import { InternalTransactionStatus } from '../../domain/transaction-status.enum';
import { PrismaTransactionRepository } from './prisma-transaction.repository';

class FakePrisma {
  public transaction = {
    create: jest.fn(),
    update: jest.fn(),
  };
}

describe('PrismaTransactionRepository', () => {
  it('creates and maps a transaction', async () => {
    const prisma = new FakePrisma() as any;
    const repo = new PrismaTransactionRepository(prisma);

    prisma.transaction.create.mockResolvedValueOnce({
      id: 'tx-1',
      productId: 'prod-1',
      customerId: 'cust-1',
      status: 'PENDING',
      wompiReference: null,
      amount: 2000,
      baseFee: 5,
      deliveryFee: 10,
      total: 2015,
    });

    const created = await repo.create({
      productId: 'prod-1',
      customerId: 'cust-1',
      amount: 2000,
      baseFee: 5,
      deliveryFee: 10,
      total: 2015,
    });

    expect(created.id).toBe('tx-1');
    expect(created.status).toBe(InternalTransactionStatus.PENDING);
    expect(created.total).toBe(2015);
  });

  it('updates status and normalizes wompiReference', async () => {
    const prisma = new FakePrisma() as any;
    const repo = new PrismaTransactionRepository(prisma);

    prisma.transaction.update.mockResolvedValueOnce({
      id: 'tx-1',
      productId: 'prod-1',
      customerId: 'cust-1',
      status: 'APPROVED',
      wompiReference: '',
      amount: 2000,
      baseFee: 5,
      deliveryFee: 10,
      total: 2015,
    });

    const updated = await repo.updateStatus({
      transactionId: 'tx-1',
      status: InternalTransactionStatus.APPROVED,
      wompiReference: '',
    });

    expect(updated.status).toBe(InternalTransactionStatus.APPROVED);
    expect(updated.wompiReference).toBe('');
  });
});
