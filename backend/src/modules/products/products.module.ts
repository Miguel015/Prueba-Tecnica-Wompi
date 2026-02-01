import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { ProductsController } from './infrastructure/controllers/products.controller';
import { PrismaProductRepository } from './infrastructure/persistence/prisma-product.repository';
import { GetProductByIdUseCase } from './application/use-cases/get-product-by-id.usecase';
import { ProductRepository } from './domain/product.repository';

@Module({
  controllers: [ProductsController],
  providers: [
    PrismaService,
    {
      provide: ProductRepository,
      useClass: PrismaProductRepository,
    },
    GetProductByIdUseCase,
  ],
  exports: [ProductRepository],
})
export class ProductsModule {}
