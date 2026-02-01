export type WompiPaymentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface WompiChargeRequest {
  amountInCents: number;
  currency: string;
  customerEmail: string;
  paymentSourceId?: string; // según modalidad de Wompi (token/source)
  // En este ejercicio simplificamos a una llamada directa con datos de tarjeta, pero
  // los datos sensibles nunca se persisten en BD.
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

export abstract class PaymentGatewayPort {
  abstract charge(request: WompiChargeRequest): Promise<WompiChargeResponse>;
}
