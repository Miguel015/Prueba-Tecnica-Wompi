import { PrismaDeliveryRepository } from './prisma-delivery.repository';

class FakePrisma {
  public delivery = {
    create: jest.fn(),
  };
}

describe('PrismaDeliveryRepository', () => {
  it('creates a delivery with pending status', async () => {
    const prisma = new FakePrisma() as any;
    const repo = new PrismaDeliveryRepository(prisma);

    await repo.create({
      customerId: 'cust-1',
      productId: 'prod-1',
      transactionId: 'tx-1',
      address: 'Street 123',
    });

    expect(prisma.delivery.create).toHaveBeenCalledWith({
      data: {
        customerId: 'cust-1',
        productId: 'prod-1',
        transactionId: 'tx-1',
        address: 'Street 123',
        status: 'PENDING',
      },
    });
  });
});
