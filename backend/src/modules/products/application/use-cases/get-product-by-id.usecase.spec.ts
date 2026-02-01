import { GetProductByIdUseCase } from './get-product-by-id.usecase';
import { ProductRepository } from '../../domain/product.repository';

class InMemoryProductRepository extends ProductRepository {
  private products = [
    {
      id: 'p1',
      name: 'Test',
      description: 'Desc',
      price: 100,
      stockAvailable: 3,
    },
  ];

  async findById(id: string) {
    return this.products.find((p) => p.id === id) ?? null;
  }
}

describe('GetProductByIdUseCase', () => {
  it('returns product when exists', async () => {
    const repo = new InMemoryProductRepository();
    const useCase = new GetProductByIdUseCase(repo);

    const result = await useCase.execute('p1');

    expect(result.isOk).toBe(true);
    if (result.isOk) {
      expect(result.value.id).toBe('p1');
    }
  });

  it('returns error when not found', async () => {
    const repo = new InMemoryProductRepository();
    const useCase = new GetProductByIdUseCase(repo);

    const result = await useCase.execute('unknown');

    expect(result.isErr).toBe(true);
  });
});
