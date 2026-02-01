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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const get_product_by_id_usecase_1 = require("../../application/use-cases/get-product-by-id.usecase");
let ProductsController = class ProductsController {
    getProductByIdUseCase;
    constructor(getProductByIdUseCase) {
        this.getProductByIdUseCase = getProductByIdUseCase;
    }
    async getById(id) {
        const result = await this.getProductByIdUseCase.execute(id);
        if (result.isErr) {
            throw new common_1.NotFoundException(result.error.message);
        }
        return result.value;
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getById", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [get_product_by_id_usecase_1.GetProductByIdUseCase])
], ProductsController);
//# sourceMappingURL=products.controller.js.map