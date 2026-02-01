"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePaymentTransactionUseCase = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../../../shared/domain/errors/result");
const product_repository_1 = require("../../../products/domain/product.repository");
const customer_repository_1 = require("../../../customers/domain/customer.repository");
const delivery_repository_1 = require("../../../delivery/domain/delivery.repository");
const transaction_repository_1 = require("../../domain/transaction.repository");
const transaction_status_enum_1 = require("../../domain/transaction-status.enum");
const payment_gateway_port_1 = require("../../../wompi/domain/payment-gateway.port");
let CreatePaymentTransactionUseCase = class CreatePaymentTransactionUseCase {
    productRepository;
    customerRepository;
    deliveryRepository;
    transactionRepository;
    paymentGateway;
    BASE_FEE = 500;
    DELIVERY_FEE = 1000;
    constructor(productRepository, customerRepository, deliveryRepository, transactionRepository, paymentGateway) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.deliveryRepository = deliveryRepository;
        this.transactionRepository = transactionRepository;
        this.paymentGateway = paymentGateway;
    }
    async execute(command) {
        const validationError = this.validateCommand(command);
        if (validationError) {
            return result_1.Result.err(new Error(validationError));
        }
        const product = await this.productRepository.findById(command.productId);
        if (!product || product.stockAvailable <= 0) {
            return result_1.Result.err(new Error('Product not available or out of stock'));
        }
        const customer = await this.customerRepository.ensureCustomer(command.customer);
        const amount = product.price;
        const baseFee = this.BASE_FEE / 100;
        const deliveryFee = this.DELIVERY_FEE / 100;
        const total = amount + baseFee + deliveryFee;
        const internalTx = await this.transactionRepository.create({
            productId: product.id,
            customerId: customer.id,
            amount,
            baseFee,
            deliveryFee,
            total,
        });
        const wompiResult = await this.paymentGateway.charge({
            amountInCents: Math.round(total * 100),
            currency: 'COP',
            customerEmail: customer.email,
            cardNumber: command.card.number,
            cvc: command.card.cvc,
            expMonth: command.card.expMonth,
            expYear: command.card.expYear,
            cardHolderName: command.card.cardHolderName,
        });
        const mappedStatus = this.mapStatus(wompiResult.status);
        const updatedTx = await this.transactionRepository.updateStatus({
            transactionId: internalTx.id,
            status: mappedStatus,
            wompiReference: wompiResult.wompiReference,
        });
        if (mappedStatus === transaction_status_enum_1.InternalTransactionStatus.APPROVED) {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            await prisma.stock.update({
                where: { productId: product.id },
                data: { quantity: { decrement: 1 } },
            });
            await prisma.$disconnect();
            await this.deliveryRepository.create({
                customerId: customer.id,
                productId: product.id,
                transactionId: updatedTx.id,
                address: command.delivery.address,
            });
        }
        const summary = {
            transactionId: updatedTx.id,
            status: updatedTx.status,
            productId: product.id,
            amount,
            baseFee,
            deliveryFee,
            total,
        };
        return result_1.Result.ok(summary);
    }
    validateCommand(command) {
        const name = command.customer.name.trim();
        const email = command.customer.email.trim();
        const address = command.delivery.address.trim();
        const cardNumber = command.card.number.replace(/\s+/g, '');
        const expMonth = command.card.expMonth.trim();
        const expYear = command.card.expYear.trim();
        const cvc = command.card.cvc.trim();
        const holder = command.card.cardHolderName.trim();
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!name || name.length < 3) {
            return 'Customer name must be at least 3 characters';
        }
        if (!email || !emailRegex.test(email)) {
            return 'A valid customer email is required';
        }
        if (!address || address.length < 5) {
            return 'Delivery address must be at least 5 characters';
        }
        if (!this.isLuhnValid(cardNumber)) {
            return 'Invalid card number';
        }
        if (!this.isExpiryValid(expMonth, expYear)) {
            return 'Card expiry is not valid';
        }
        if (!cvc || cvc.length < 3 || cvc.length > 4 || !/^\d+$/.test(cvc)) {
            return 'CVC is invalid';
        }
        if (!holder || holder.length < 5) {
            return 'Card holder name must be at least 5 characters';
        }
        return null;
    }
    isLuhnValid(cardNumber) {
        if (!/^\d{13,19}$/.test(cardNumber)) {
            return false;
        }
        let sum = 0;
        let shouldDouble = false;
        for (let i = cardNumber.length - 1; i >= 0; i -= 1) {
            let digit = parseInt(cardNumber.charAt(i), 10);
            if (Number.isNaN(digit)) {
                return false;
            }
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
    }
    isExpiryValid(expMonth, expYear) {
        const month = parseInt(expMonth, 10);
        const year = parseInt(expYear, 10);
        if (Number.isNaN(month) || Number.isNaN(year)) {
            return false;
        }
        if (month < 1 || month > 12) {
            return false;
        }
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        if (year < currentYear) {
            return false;
        }
        if (year === currentYear && month < currentMonth) {
            return false;
        }
        return true;
    }
    mapStatus(wompiStatus) {
        switch (wompiStatus) {
            case 'APPROVED':
                return transaction_status_enum_1.InternalTransactionStatus.APPROVED;
            case 'DECLINED':
                return transaction_status_enum_1.InternalTransactionStatus.DECLINED;
            case 'PENDING':
                return transaction_status_enum_1.InternalTransactionStatus.PENDING;
            default:
                return transaction_status_enum_1.InternalTransactionStatus.ERROR;
        }
    }
};
exports.CreatePaymentTransactionUseCase = CreatePaymentTransactionUseCase;
exports.CreatePaymentTransactionUseCase = CreatePaymentTransactionUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [product_repository_1.ProductRepository,
        customer_repository_1.CustomerRepository,
        delivery_repository_1.DeliveryRepository,
        transaction_repository_1.TransactionRepository,
        payment_gateway_port_1.PaymentGatewayPort])
], CreatePaymentTransactionUseCase);
//# sourceMappingURL=create-payment-transaction.usecase.js.map