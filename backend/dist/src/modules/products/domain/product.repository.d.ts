import { Product } from './product.entity';
export declare abstract class ProductRepository {
    abstract findById(id: string): Promise<Product | null>;
}
