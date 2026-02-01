import { PrismaService } from 'shared/infrastructure/prisma/prisma.service';
import { CreateTransactionProps, Transaction, TransactionRepository, UpdateTransactionStatusProps } from 'modules/transactions/domain/transaction.repository';
export declare class PrismaTransactionRepository implements TransactionRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(props: CreateTransactionProps): Promise<Transaction>;
    updateStatus(props: UpdateTransactionStatusProps): Promise<Transaction>;
    private map;
}
