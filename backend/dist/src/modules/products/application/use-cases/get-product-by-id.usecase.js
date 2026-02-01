"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProductByIdUseCase = void 0;
const common_1 = require("@nestjs/common");
const result_1 = require("../../../../shared/domain/errors/result");
const product_repository_1 = require("../../domain/product.repository");
let GetProductByIdUseCase = class GetProductByIdUseCase {
    productRepository;
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    async execute(id) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            return result_1.Result.err(new Error('Product not found'));
        }
        return result_1.Result.ok(product);
    }
};
exports.GetProductByIdUseCase = GetProductByIdUseCase;
exports.GetProductByIdUseCase = GetProductByIdUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [product_repository_1.ProductRepository])
], GetProductByIdUseCase);
//# sourceMappingURL=get-product-by-id.usecase.js.map