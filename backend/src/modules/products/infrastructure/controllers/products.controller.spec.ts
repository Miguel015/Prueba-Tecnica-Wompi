import { NotFoundException } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.usecase';
import { Result } from '../../../../shared/domain/errors/result';

class FakeGetProductByIdUseCase {
  execute = jest.fn();
}

describe('ProductsController', () => {
  let controller: ProductsController;
  let useCase: FakeGetProductByIdUseCase;

  beforeEach(() => {
    useCase = new FakeGetProductByIdUseCase();
    controller = new ProductsController(useCase as unknown as GetProductByIdUseCase);
  });

  it('returns product when use case succeeds', async () => {
    const product = {
      id: 'prod-1',
      name: 'Test Product',
      description: 'Desc',
      price: 2000,
      stockAvailable: 5,
    };

    useCase.execute.mockResolvedValueOnce(Result.ok(product));

    const result = await controller.getById('prod-1');

    expect(result).toEqual(product);
    expect(useCase.execute).toHaveBeenCalledWith('prod-1');
  });

  it('throws NotFoundException when use case fails', async () => {
    useCase.execute.mockResolvedValueOnce(Result.err(new Error('not found')));

    await expect(controller.getById('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
