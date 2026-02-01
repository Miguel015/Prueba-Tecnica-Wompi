import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.usecase';
export declare class ProductsController {
    private readonly getProductByIdUseCase;
    constructor(getProductByIdUseCase: GetProductByIdUseCase);
    getById(id: string): Promise<import("../../domain/product.entity").Product | null>;
}
