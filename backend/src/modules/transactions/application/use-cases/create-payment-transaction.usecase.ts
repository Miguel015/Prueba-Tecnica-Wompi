import { Injectable } from '@nestjs/common';
import { Result } from 'shared/domain/errors/result';
import { ProductRepository } from 'modules/products/domain/product.repository';
import {
  CustomerRepository,
  EnsureCustomerProps,
} from 'modules/customers/domain/customer.repository';
import { DeliveryRepository } from 'modules/delivery/domain/delivery.repository';
import {
  TransactionRepository,
  Transaction,
} from 'modules/transactions/domain/transaction.repository';
import { InternalTransactionStatus } from 'modules/transactions/domain/transaction-status.enum';
import {
  PaymentGatewayPort,
  WompiPaymentStatus,
} from 'modules/wompi/domain/payment-gateway.port';

export interface CreatePaymentCommand {
  productId: string;
  customer: EnsureCustomerProps;
  delivery: { address: string };
  card: {
    number: string;
    expMonth: string;
    expYear: string;
    cvc: string;
    cardHolderName: string;
  };
}

export interface PaymentSummary {
  transactionId: string;
  status: InternalTransactionStatus;
  productId: string;
  amount: number;
  baseFee: number;
  deliveryFee: number;
  total: number;
}

@Injectable()
export class CreatePaymentTransactionUseCase {
  private readonly BASE_FEE = 500; // 5.00
  private readonly DELIVERY_FEE = 1000; // 10.00

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly deliveryRepository: DeliveryRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(
    command: CreatePaymentCommand,
  ): Promise<ReturnType<typeof Result.ok<PaymentSummary> | typeof Result.err>> {
    const validationError = this.validateCommand(command);
    if (validationError) {
      return Result.err<PaymentSummary, Error>(new Error(validationError));
    }

    const product = await this.productRepository.findById(command.productId);
    if (!product || product.stockAvailable <= 0) {
      return Result.err<PaymentSummary, Error>(
        new Error('Product not available or out of stock'),
      );
    }

    const customer = await this.customerRepository.ensureCustomer(
      command.customer,
    );

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

    // Llamada a Wompi (solo backend con API Key)
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

    const mappedStatus: InternalTransactionStatus = this.mapStatus(
      wompiResult.status,
    );

    const updatedTx = await this.transactionRepository.updateStatus({
      transactionId: internalTx.id,
      status: mappedStatus,
      wompiReference: wompiResult.wompiReference,
    });

    if (mappedStatus === InternalTransactionStatus.APPROVED) {
      // Actualizar stock (sólo si APPROVED)
      // Reservas simples: decremento directo a quantity.
      // Se hace vía Prisma directamente para mantener el ejemplo sencillo.
      // En un sistema más grande esto sería otro puerto/repositorio dedicado.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
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

    const summary: PaymentSummary = {
      transactionId: updatedTx.id,
      status: updatedTx.status,
      productId: product.id,
      amount,
      baseFee,
      deliveryFee,
      total,
    };

    return Result.ok<PaymentSummary, Error>(summary);
  }

  private validateCommand(command: CreatePaymentCommand): string | null {
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

  private isLuhnValid(cardNumber: string): boolean {
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

  private isExpiryValid(expMonth: string, expYear: string): boolean {
    const month = parseInt(expMonth, 10);
    const year = parseInt(expYear, 10);

    if (Number.isNaN(month) || Number.isNaN(year)) {
      return false;
    }

    if (month < 1 || month > 12) {
      return false;
    }

    const now = new Date();
    const currentYear = now.getFullYear() % 100; // YY
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) {
      return false;
    }

    if (year === currentYear && month < currentMonth) {
      return false;
    }

    return true;
  }

  private mapStatus(wompiStatus: WompiPaymentStatus): InternalTransactionStatus {
    switch (wompiStatus) {
      case 'APPROVED':
        return InternalTransactionStatus.APPROVED;
      case 'DECLINED':
        return InternalTransactionStatus.DECLINED;
      case 'PENDING':
        return InternalTransactionStatus.PENDING;
      default:
        return InternalTransactionStatus.ERROR;
    }
  }
}
