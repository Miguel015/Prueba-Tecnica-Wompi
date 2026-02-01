"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/infrastructure/prisma/prisma.service");
const products_module_1 = require("../products/products.module");
const prisma_customer_repository_1 = require("../customers/infrastructure/persistence/prisma-customer.repository");
const customer_repository_1 = require("../customers/domain/customer.repository");
const prisma_delivery_repository_1 = require("../delivery/infrastructure/persistence/prisma-delivery.repository");
const delivery_repository_1 = require("../delivery/domain/delivery.repository");
const prisma_transaction_repository_1 = require("./infrastructure/persistence/prisma-transaction.repository");
const transaction_repository_1 = require("./domain/transaction.repository");
const wompi_http_adapter_1 = require("../wompi/infrastructure/wompi-http.adapter");
const payment_gateway_port_1 = require("../wompi/domain/payment-gateway.port");
const create_payment_transaction_usecase_1 = require("./application/use-cases/create-payment-transaction.usecase");
const transactions_controller_1 = require("./infrastructure/controllers/transactions.controller");
let TransactionsModule = class TransactionsModule {
};
exports.TransactionsModule = TransactionsModule;
exports.TransactionsModule = TransactionsModule = __decorate([
    (0, common_1.Module)({
        imports: [products_module_1.ProductsModule],
        controllers: [transactions_controller_1.TransactionsController],
        providers: [
            prisma_service_1.PrismaService,
            { provide: customer_repository_1.CustomerRepository, useClass: prisma_customer_repository_1.PrismaCustomerRepository },
            { provide: delivery_repository_1.DeliveryRepository, useClass: prisma_delivery_repository_1.PrismaDeliveryRepository },
            { provide: transaction_repository_1.TransactionRepository, useClass: prisma_transaction_repository_1.PrismaTransactionRepository },
            { provide: payment_gateway_port_1.PaymentGatewayPort, useClass: wompi_http_adapter_1.WompiHttpAdapter },
            create_payment_transaction_usecase_1.CreatePaymentTransactionUseCase,
        ],
    })
], TransactionsModule);
//# sourceMappingURL=transactions.module.js.map