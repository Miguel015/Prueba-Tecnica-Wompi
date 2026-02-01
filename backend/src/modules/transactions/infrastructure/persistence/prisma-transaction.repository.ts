import { Injectable } from '@nestjs/common';
import { PrismaService } from 'shared/infrastructure/prisma/prisma.service';
import {
  CreateTransactionProps,
  Transaction,
  TransactionRepository,
  UpdateTransactionStatusProps,
} from 'modules/transactions/domain/transaction.repository';
import { InternalTransactionStatus } from 'modules/transactions/domain/transaction-status.enum';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(props: CreateTransactionProps): Promise<Transaction> {
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

  async updateStatus(
    props: UpdateTransactionStatusProps,
  ): Promise<Transaction> {
    const tx = await this.prisma.transaction.update({
      where: { id: props.transactionId },
      data: {
        status: props.status,
        wompiReference: props.wompiReference || null,
      },
    });

    return this.map(tx);
  }

  private map(tx: any): Transaction {
    return {
      id: tx.id,
      productId: tx.productId,
      customerId: tx.customerId,
      status: tx.status as InternalTransactionStatus,
      wompiReference: tx.wompiReference ?? undefined,
      amount: Number(tx.amount),
      baseFee: Number(tx.baseFee),
      deliveryFee: Number(tx.deliveryFee),
      total: Number(tx.total),
    };
  }
}
