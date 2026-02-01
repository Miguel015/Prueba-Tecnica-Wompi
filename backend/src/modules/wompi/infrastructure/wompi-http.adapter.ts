import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import {
  PaymentGatewayPort,
  WompiChargeRequest,
  WompiChargeResponse,
} from '../domain/payment-gateway.port';

const WOMPI_BASE_URL =
  process.env.WOMPI_BASE_URL ?? 'https://api-sandbox.co.uat.wompi.dev/v1';

@Injectable()
export class WompiHttpAdapter implements PaymentGatewayPort {
  private readonly logger = new Logger(WompiHttpAdapter.name);

  async charge(request: WompiChargeRequest): Promise<WompiChargeResponse> {
    const publicKey = process.env.WOMPI_PUBLIC_KEY;
    const privateKey = process.env.WOMPI_PRIVATE_KEY;
    const integrityKey = process.env.WOMPI_INTEGRITY_KEY;

    if (!publicKey || !privateKey || !integrityKey) {
      throw new Error(
        'WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY or WOMPI_INTEGRITY_KEY is not configured',
      );
    }

    try {
      // 1) Obtener acceptance_token del merchant usando la PUBLIC KEY
      const merchantResp = await axios.get(
        `${WOMPI_BASE_URL}/merchants/${publicKey}`,
      );

      const acceptanceToken: string =
        merchantResp.data?.data?.presigned_acceptance?.acceptance_token ?? '';

      if (!acceptanceToken) {
        this.logger.error('Wompi acceptance_token not found in merchant response');
        return { status: 'ERROR', wompiReference: '' };
      }

      // 2) Tokenizar la tarjeta con la PUBLIC KEY
      const sanitizedNumber = request.cardNumber.replace(/\s+/g, '');

      const tokenResp = await axios.post(
        `${WOMPI_BASE_URL}/tokens/cards`,
        {
          number: sanitizedNumber,
          cvc: request.cvc,
          exp_month: request.expMonth,
          // Wompi espera año en formato YY según el error de validación
          exp_year: request.expYear,
          card_holder: request.cardHolderName,
        },
        {
          headers: {
            Authorization: `Bearer ${publicKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const cardTokenId: string = tokenResp.data?.data?.id ?? '';

      if (!cardTokenId) {
        this.logger.error('Wompi card token not created correctly');
        return { status: 'ERROR', wompiReference: '' };
      }

      // 3) Crear la transacción con la PRIVATE KEY
      const reference = `TECH-TEST-${Date.now()}`;

      const signaturePayload = `${reference}${request.amountInCents}${request.currency}${integrityKey}`;
      const signature = crypto
        .createHash('sha256')
        .update(signaturePayload)
        .digest('hex');

      const txResp = await axios.post(
        `${WOMPI_BASE_URL}/transactions`,
        {
          amount_in_cents: request.amountInCents,
          currency: request.currency,
          customer_email: request.customerEmail,
          acceptance_token: acceptanceToken,
          reference,
          signature,
          payment_method: {
            type: 'CARD',
            token: cardTokenId,
            installments: 1,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${privateKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const wompiStatus: string = txResp.data?.data?.status ?? 'ERROR';
      const wompiId: string = txResp.data?.data?.id ?? '';

      const mappedStatus: WompiChargeResponse['status'] =
        wompiStatus === 'APPROVED'
          ? 'APPROVED'
          : wompiStatus === 'DECLINED'
          ? 'DECLINED'
          : wompiStatus === 'PENDING'
          ? 'PENDING'
          : 'ERROR';

      return {
        status: mappedStatus,
        wompiReference: wompiId,
      };
    } catch (error: any) {
      this.logger.error(
        'Error calling Wompi',
        error?.response?.data ?? (error as Error),
      );
      return {
        status: 'ERROR',
        wompiReference: '',
      };
    }
  }
}
