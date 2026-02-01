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
exports.PrismaTransactionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../shared/infrastructure/prisma/prisma.service");
let PrismaTransactionRepository = class PrismaTransactionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(props) {
        const tx = await this.prisma.transaction.create({
            data: {
                productId: props.productId,
                customerId: props.customerId,
                status: 'PENDING',
                amount: props.amount,
                baseFee: props.baseFee,
                deliveryFee: props.deliveryFee,
                total: props.total,
            },
        });
        return this.map(tx);
    }
    async updateStatus(props) {
        const tx = await this.prisma.transaction.update({
            where: { id: props.transactionId },
            data: {
                status: props.status,
                wompiReference: props.wompiReference || null,
            },
        });
        return this.map(tx);
    }
    map(tx) {
        return {
            id: tx.id,
            productId: tx.productId,
            customerId: tx.customerId,
            status: tx.status,
            wompiReference: tx.wompiReference ?? undefined,
            amount: Number(tx.amount),
            baseFee: Number(tx.baseFee),
            deliveryFee: Number(tx.deliveryFee),
            total: Number(tx.total),
        };
    }
};
exports.PrismaTransactionRepository = PrismaTransactionRepository;
exports.PrismaTransactionRepository = PrismaTransactionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTransactionRepository);
//# sourceMappingURL=prisma-transaction.repository.js.map