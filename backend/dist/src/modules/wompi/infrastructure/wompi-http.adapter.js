"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WompiHttpAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WompiHttpAdapter = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const WOMPI_BASE_URL = process.env.WOMPI_BASE_URL ?? 'https://api-sandbox.co.uat.wompi.dev/v1';
let WompiHttpAdapter = WompiHttpAdapter_1 = class WompiHttpAdapter {
    logger = new common_1.Logger(WompiHttpAdapter_1.name);
    async charge(request) {
        const publicKey = process.env.WOMPI_PUBLIC_KEY;
        const privateKey = process.env.WOMPI_PRIVATE_KEY;
        const integrityKey = process.env.WOMPI_INTEGRITY_KEY;
        if (!publicKey || !privateKey || !integrityKey) {
            throw new Error('WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY or WOMPI_INTEGRITY_KEY is not configured');
        }
        try {
            const merchantResp = await axios_1.default.get(`${WOMPI_BASE_URL}/merchants/${publicKey}`);
            const acceptanceToken = merchantResp.data?.data?.presigned_acceptance?.acceptance_token ?? '';
            if (!acceptanceToken) {
                this.logger.error('Wompi acceptance_token not found in merchant response');
                return { status: 'ERROR', wompiReference: '' };
            }
            const sanitizedNumber = request.cardNumber.replace(/\s+/g, '');
            const tokenResp = await axios_1.default.post(`${WOMPI_BASE_URL}/tokens/cards`, {
                number: sanitizedNumber,
                cvc: request.cvc,
                exp_month: request.expMonth,
                exp_year: request.expYear,
                card_holder: request.cardHolderName,
            }, {
                headers: {
                    Authorization: `Bearer ${publicKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const cardTokenId = tokenResp.data?.data?.id ?? '';
            if (!cardTokenId) {
                this.logger.error('Wompi card token not created correctly');
                return { status: 'ERROR', wompiReference: '' };
            }
            const reference = `TECH-TEST-${Date.now()}`;
            const signaturePayload = `${reference}${request.amountInCents}${request.currency}${integrityKey}`;
            const signature = crypto
                .createHash('sha256')
                .update(signaturePayload)
                .digest('hex');
            const txResp = await axios_1.default.post(`${WOMPI_BASE_URL}/transactions`, {
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
            }, {
                headers: {
                    Authorization: `Bearer ${privateKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const wompiStatus = txResp.data?.data?.status ?? 'ERROR';
            const wompiId = txResp.data?.data?.id ?? '';
            const mappedStatus = wompiStatus === 'APPROVED'
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
        }
        catch (error) {
            this.logger.error('Error calling Wompi', error?.response?.data ?? error);
            return {
                status: 'ERROR',
                wompiReference: '',
            };
        }
    }
};
exports.WompiHttpAdapter = WompiHttpAdapter;
exports.WompiHttpAdapter = WompiHttpAdapter = WompiHttpAdapter_1 = __decorate([
    (0, common_1.Injectable)()
], WompiHttpAdapter);
//# sourceMappingURL=wompi-http.adapter.js.map