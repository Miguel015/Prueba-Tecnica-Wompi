import { CreatePaymentTransactionUseCase } from '../../application/use-cases/create-payment-transaction.usecase';
declare class CreateTransactionDto {
    productId: string;
    customer: {
        name: string;
        email: string;
        documentNumber?: string;
    };
    delivery: {
        address: string;
    };
    card: {
        number: string;
        expMonth: string;
        expYear: string;
        cvc: string;
        cardHolderName: string;
    };
}
export declare class TransactionsController {
    private readonly createPaymentTransactionUseCase;
    constructor(createPaymentTransactionUseCase: CreatePaymentTransactionUseCase);
    create(body: CreateTransactionDto): Promise<unknown>;
}
export {};
