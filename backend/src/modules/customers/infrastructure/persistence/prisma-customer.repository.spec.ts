import { PrismaCustomerRepository } from './prisma-customer.repository';

class FakePrisma {
  public customer = {
    upsert: jest.fn(),
  };
}

describe('PrismaCustomerRepository', () => {
  it('upserts and maps customer', async () => {
    const prisma = new FakePrisma() as any;
    const repo = new PrismaCustomerRepository(prisma);

    prisma.customer.upsert.mockResolvedValueOnce({
      id: 'cust-1',
      name: 'Miguel Suarez',
      email: 'miguel@example.com',
      documentNumber: null,
    });

    const result = await repo.ensureCustomer({
      name: 'Miguel Suarez',
      email: 'miguel@example.com',
    });

    expect(prisma.customer.upsert).toHaveBeenCalled();
    expect(result).toEqual({
      id: 'cust-1',
      name: 'Miguel Suarez',
      email: 'miguel@example.com',
      documentNumber: undefined,
    });
  });
});
