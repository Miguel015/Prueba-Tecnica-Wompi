import { Product } from '../../domain/product.entity';
import { ProductRepository } from '../../domain/product.repository';
export declare class GetProductByIdUseCase {
    private readonly productRepository;
    constructor(productRepository: ProductRepository);
    execute(id: string): Promise<import("../../../../shared/domain/errors/result").Ok<Product | null, Error> | import("../../../../shared/domain/errors/result").Err<Product | null, Error>>;
}
