import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { ProductsModule } from '../products/products.module';
import { PrismaCustomerRepository } from '../customers/infrastructure/persistence/prisma-customer.repository';
import { CustomerRepository } from '../customers/domain/customer.repository';
import { PrismaDeliveryRepository } from '../delivery/infrastructure/persistence/prisma-delivery.repository';
import { DeliveryRepository } from '../delivery/domain/delivery.repository';
import { PrismaTransactionRepository } from './infrastructure/persistence/prisma-transaction.repository';
import { TransactionRepository } from './domain/transaction.repository';
import { WompiHttpAdapter } from '../wompi/infrastructure/wompi-http.adapter';
import { PaymentGatewayPort } from '../wompi/domain/payment-gateway.port';
import { CreatePaymentTransactionUseCase } from './application/use-cases/create-payment-transaction.usecase';
import { TransactionsController } from './infrastructure/controllers/transactions.controller';

@Module({
  imports: [ProductsModule],
  controllers: [TransactionsController],
  providers: [
    PrismaService,
    { provide: CustomerRepository, useClass: PrismaCustomerRepository },
    { provide: DeliveryRepository, useClass: PrismaDeliveryRepository },
    { provide: TransactionRepository, useClass: PrismaTransactionRepository },
    { provide: PaymentGatewayPort, useClass: WompiHttpAdapter },
    CreatePaymentTransactionUseCase,
  ],
})
export class TransactionsModule {}
