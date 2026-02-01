export interface CreateDeliveryProps {
    customerId: string;
    productId: string;
    transactionId: string;
    address: string;
}
export declare abstract class DeliveryRepository {
    abstract create(props: CreateDeliveryProps): Promise<void>;
}
