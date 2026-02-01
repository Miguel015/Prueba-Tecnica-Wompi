import { PrismaService } from 'shared/infrastructure/prisma/prisma.service';
import { ProductRepository } from 'modules/products/domain/product.repository';
import { Product } from 'modules/products/domain/product.entity';
export declare class PrismaProductRepository implements ProductRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<Product | null>;
}
