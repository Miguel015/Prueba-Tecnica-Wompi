export type WompiPaymentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
export interface WompiChargeRequest {
    amountInCents: number;
    currency: string;
    customerEmail: string;
    paymentSourceId?: string;
    cardNumber: string;
    cvc: string;
    expMonth: string;
    expYear: string;
    cardHolderName: string;
}
export interface WompiChargeResponse {
    status: WompiPaymentStatus;
    wompiReference: string;
}
export declare abstract class PaymentGatewayPort {
    abstract charge(request: WompiChargeRequest): Promise<WompiChargeResponse>;
}
