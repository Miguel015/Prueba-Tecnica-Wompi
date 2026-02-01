import { Injectable } from '@nestjs/common';
import { PrismaService } from 'shared/infrastructure/prisma/prisma.service';
import { ProductRepository } from 'modules/products/domain/product.repository';
import { Product } from 'modules/products/domain/product.entity';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { stock: true },
    });

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      description: product.description ?? undefined,
      price: Number(product.price),
      stockAvailable:
        (product.stock?.quantity ?? 0) - (product.stock?.reservedQuantity ?? 0),
    };
  }
}
