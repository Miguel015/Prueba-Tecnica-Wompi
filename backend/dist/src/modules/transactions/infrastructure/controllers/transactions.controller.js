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
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const create_payment_transaction_usecase_1 = require("../../application/use-cases/create-payment-transaction.usecase");
class CreateTransactionDto {
    productId;
    customer;
    delivery;
    card;
}
let TransactionsController = class TransactionsController {
    createPaymentTransactionUseCase;
    constructor(createPaymentTransactionUseCase) {
        this.createPaymentTransactionUseCase = createPaymentTransactionUseCase;
    }
    async create(body) {
        const result = await this.createPaymentTransactionUseCase.execute({
            productId: body.productId,
            customer: body.customer,
            delivery: body.delivery,
            card: body.card,
        });
        if (result.isErr) {
            const error = result.error;
            return {
                status: 'ERROR',
                message: error.message,
            };
        }
        return result.value;
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "create", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [create_payment_transaction_usecase_1.CreatePaymentTransactionUseCase])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map