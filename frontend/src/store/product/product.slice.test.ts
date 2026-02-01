import reducer, { fetchProductById, type ProductState } from './product.slice';

const initialState: ProductState = {
  id: null,
  name: '',
  description: undefined,
  price: 0,
  stockAvailable: 0,
  loading: false,
  error: undefined,
};

describe('product.slice', () => {
  it('returns the initial state by default', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  it('sets loading on fetch pending', () => {
    const action = { type: fetchProductById.pending.type };
    const state = reducer(initialState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBeUndefined();
  });

  it('stores product on fetch fulfilled', () => {
    const payload: Omit<ProductState, 'loading' | 'error'> = {
      id: 'prod-1',
      name: 'Product',
      description: 'Desc',
      price: 2000,
      stockAvailable: 5,
    };

    const action = { type: fetchProductById.fulfilled.type, payload };
    const state = reducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state).toMatchObject(payload);
  });

  it('sets error on fetch rejected', () => {
    const action = {
      type: fetchProductById.rejected.type,
      error: { message: 'Boom' },
    };

    const state = reducer(initialState, action as any);

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Boom');
  });
});
