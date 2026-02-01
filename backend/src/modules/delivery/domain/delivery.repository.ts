export interface CreateDeliveryProps {
  customerId: string;
  productId: string;
  transactionId: string;
  address: string;
}

export abstract class DeliveryRepository {
  abstract create(props: CreateDeliveryProps): Promise<void>;
}
