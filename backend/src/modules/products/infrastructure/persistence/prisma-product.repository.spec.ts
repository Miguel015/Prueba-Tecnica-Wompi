import { PrismaProductRepository } from './prisma-product.repository';

class FakePrisma {
  public product = {
    findUnique: jest.fn(),
  };
}

describe('PrismaProductRepository', () => {
  it('returns null when product is not found', async () => {
    const prisma = new FakePrisma() as any;
    const repo = new PrismaProductRepository(prisma);

    prisma.product.findUnique.mockResolvedValueOnce(null);

    const result = await repo.findById('missing');

    expect(result).toBeNull();
  });

  it('maps product with stock correctly', async () => {
    const prisma = new FakePrisma() as any;
    const repo = new PrismaProductRepository(prisma);

    prisma.product.findUnique.mockResolvedValueOnce({
      id: 'prod-1',
      name: 'Product',
      description: 'Desc',
      price: 2000,
      stock: {
        quantity: 10,
        reservedQuantity: 3,
      },
    });

    const result = await repo.findById('prod-1');

    expect(result).toEqual({
      id: 'prod-1',
      name: 'Product',
      description: 'Desc',
      price: 2000,
      stockAvailable: 7,
    });
  });
});
