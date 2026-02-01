import { Result } from 'shared/domain/errors/result';
import { ProductRepository } from 'modules/products/domain/product.repository';
import { CustomerRepository, EnsureCustomerProps } from 'modules/customers/domain/customer.repository';
import { DeliveryRepository } from 'modules/delivery/domain/delivery.repository';
import { TransactionRepository } from 'modules/transactions/domain/transaction.repository';
import { InternalTransactionStatus } from 'modules/transactions/domain/transaction-status.enum';
import { PaymentGatewayPort } from 'modules/wompi/domain/payment-gateway.port';
export interface CreatePaymentCommand {
    productId: string;
    customer: EnsureCustomerProps;
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
export interface PaymentSummary {
    transactionId: string;
    status: InternalTransactionStatus;
    productId: string;
    amount: number;
    baseFee: number;
    deliveryFee: number;
    total: number;
}
export declare class CreatePaymentTransactionUseCase {
    private readonly productRepository;
    private readonly customerRepository;
    private readonly deliveryRepository;
    private readonly transactionRepository;
    private readonly paymentGateway;
    private readonly BASE_FEE;
    private readonly DELIVERY_FEE;
    constructor(productRepository: ProductRepository, customerRepository: CustomerRepository, deliveryRepository: DeliveryRepository, transactionRepository: TransactionRepository, paymentGateway: PaymentGatewayPort);
    execute(command: CreatePaymentCommand): Promise<ReturnType<typeof Result.ok<PaymentSummary> | typeof Result.err>>;
    private validateCommand;
    private isLuhnValid;
    private isExpiryValid;
    private mapStatus;
}
