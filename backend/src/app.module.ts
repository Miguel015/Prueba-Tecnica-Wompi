import { Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module';
import { TransactionsModule } from './modules/transactions/transactions.module';

@Module({
  imports: [ProductsModule, TransactionsModule],
})
export class AppModule {}
