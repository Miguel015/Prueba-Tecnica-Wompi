import { TransactionsController } from './transactions.controller';
import { CreatePaymentTransactionUseCase } from '../../application/use-cases/create-payment-transaction.usecase';
import { Result } from '../../../../shared/domain/errors/result';

class FakeCreatePaymentTransactionUseCase {
  execute = jest.fn();
}

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let useCase: FakeCreatePaymentTransactionUseCase;

  beforeEach(() => {
    useCase = new FakeCreatePaymentTransactionUseCase();
    controller = new TransactionsController(
      useCase as unknown as CreatePaymentTransactionUseCase,
    );
  });

  const baseBody = {
    productId: 'prod-1',
    customer: { name: 'Miguel Suarez', email: 'miguel@example.com' },
    delivery: { address: 'Street 123' },
    card: {
      number: '4111111111111111',
      expMonth: '12',
      expYear: '40',
      cvc: '123',
      cardHolderName: 'Miguel Suarez',
    },
  };

  it('returns value when use case succeeds', async () => {
    const payload = { ...baseBody };
    const expected = { transactionId: 'tx-1', status: 'APPROVED' };

    useCase.execute.mockResolvedValueOnce(Result.ok(expected));

    const result = await controller.create(payload as any);

    expect(result).toEqual(expected);
    expect(useCase.execute).toHaveBeenCalledWith(payload);
  });

  it('returns error payload when use case fails', async () => {
    const payload = { ...baseBody };

    useCase.execute.mockResolvedValueOnce(
      Result.err(new Error('validation failed')),
    );

    const result = await controller.create(payload as any);

    expect(result).toEqual({ status: 'ERROR', message: 'validation failed' });
  });
});
