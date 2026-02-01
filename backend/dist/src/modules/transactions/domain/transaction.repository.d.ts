import { InternalTransactionStatus } from './transaction-status.enum';
export interface CreateTransactionProps {
    productId: string;
    customerId: string;
    amount: number;
    baseFee: number;
    deliveryFee: number;
    total: number;
}
export interface UpdateTransactionStatusProps {
    transactionId: string;
    status: InternalTransactionStatus;
    wompiReference?: string;
}
export interface Transaction {
    id: string;
    productId: string;
    customerId: string;
    status: InternalTransactionStatus;
    wompiReference?: string | null;
    amount: number;
    baseFee: number;
    deliveryFee: number;
    total: number;
}
export declare abstract class TransactionRepository {
    abstract create(props: CreateTransactionProps): Promise<Transaction>;
    abstract updateStatus(props: UpdateTransactionStatusProps): Promise<Transaction>;
}
