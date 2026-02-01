import { Injectable } from '@nestjs/common';
import { Result } from '../../../../shared/domain/errors/result';
import { Product } from '../../domain/product.entity';
import { ProductRepository } from '../../domain/product.repository';

@Injectable()
export class GetProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      return Result.err<Product | null, Error>(
        new Error('Product not found'),
      );
    }
    return Result.ok<Product, Error>(product);
  }
}
