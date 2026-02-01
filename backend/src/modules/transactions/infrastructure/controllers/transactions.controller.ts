import { Body, Controller, Post } from '@nestjs/common';
import { CreatePaymentTransactionUseCase } from '../../application/use-cases/create-payment-transaction.usecase';

class CreateTransactionDto {
  productId!: string;
  customer!: {
    name: string;
    email: string;
    documentNumber?: string;
  };
  delivery!: {
    address: string;
  };
  card!: {
    number: string;
    expMonth: string;
    expYear: string;
    cvc: string;
    cardHolderName: string;
  };
}

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createPaymentTransactionUseCase: CreatePaymentTransactionUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateTransactionDto) {
    const result = await this.createPaymentTransactionUseCase.execute({
      productId: body.productId,
      customer: body.customer,
      delivery: body.delivery,
      card: body.card,
    });

    if (result.isErr) {
      const error = result.error as Error;
      // Manejo sencillo; se puede refinar con filtros/HTTPException mapeando tipos de error.
      return {
        status: 'ERROR',
        message: error.message,
      };
    }

    return result.value;
  }
}
