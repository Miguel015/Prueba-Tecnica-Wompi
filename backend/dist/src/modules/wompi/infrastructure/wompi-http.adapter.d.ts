import { PaymentGatewayPort, WompiChargeRequest, WompiChargeResponse } from '../domain/payment-gateway.port';
export declare class WompiHttpAdapter implements PaymentGatewayPort {
    private readonly logger;
    charge(request: WompiChargeRequest): Promise<WompiChargeResponse>;
}
