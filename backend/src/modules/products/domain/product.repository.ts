import { Product } from './product.entity';

// Abstract class to be used as NestJS injection token (hexagonal port).
export abstract class ProductRepository {
  abstract findById(id: string): Promise<Product | null>;
}
