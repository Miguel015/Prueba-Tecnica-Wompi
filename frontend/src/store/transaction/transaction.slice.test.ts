import reducer, {
  clearTransaction,
  createTransaction,
  hydrate,
  hydrateFromStorage,
  setDraftData,
  type TransactionState,
} from './transaction.slice';

const baseState: TransactionState = {
  status: 'IDLE',
  amount: 0,
  baseFee: 0,
  deliveryFee: 0,
  total: 0,
  loading: false,
};

describe('transaction.slice - pure reducer', () => {
  it('hydrateFromStorage returns base state on server', () => {
    // window is undefined in Jest node environment when this is called directly
    const state = hydrateFromStorage();
    expect(state).toMatchObject(baseState);
  });

  it('returns initial state by default', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state.status).toBe('IDLE');
  });

  it('sets draft data', () => {
    const action = setDraftData({
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
    });

    const state = reducer(baseState, action);

    expect(state.productId).toBe('prod-1');
    expect(state.customer?.name).toBe('Miguel Suarez');
    expect(state.delivery?.address).toBe('Street 123');
    expect(state.card?.number).toBe('4111111111111111');
  });

  it('clears transaction', () => {
    const filled: TransactionState = {
      ...baseState,
      status: 'APPROVED',
      transactionId: 'tx-1',
      productId: 'prod-1',
      amount: 2000,
      baseFee: 5,
      deliveryFee: 10,
      total: 2015,
      customer: { name: 'Miguel', email: 'miguel@example.com' },
      delivery: { address: 'Street 123' },
      card: {
        number: '4111111111111111',
        expMonth: '12',
        expYear: '40',
        cvc: '123',
        cardHolderName: 'Miguel Suarez',
      },
      loading: false,
      error: undefined,
    };

    const state = reducer(filled, clearTransaction());

    expect(state).toMatchObject(baseState);
  });

  it('hydrates state', () => {
    const hydrated: TransactionState = {
      ...baseState,
      status: 'PENDING',
      transactionId: 'tx-1',
      productId: 'prod-1',
      amount: 2000,
      baseFee: 5,
      deliveryFee: 10,
      total: 2015,
      loading: true,
    };

    const state = reducer(baseState, hydrate(hydrated));

    expect(state).toEqual(hydrated);
  });

  it('handles createTransaction.pending', () => {
    const action = { type: createTransaction.pending.type };
    const state = reducer(baseState, action);

    expect(state.loading).toBe(true);
    expect(state.status).toBe('PENDING');
    expect(state.error).toBeUndefined();
  });

  it('handles createTransaction.fulfilled', () => {
    const action = {
      type: createTransaction.fulfilled.type,
      payload: {
        transactionId: 'tx-1',
        status: 'APPROVED',
        productId: 'prod-1',
        amount: 2000,
        baseFee: 5,
        deliveryFee: 10,
        total: 2015,
      },
    };

    const state = reducer(baseState, action as any);

    expect(state.loading).toBe(false);
    expect(state.status).toBe('APPROVED');
    expect(state.transactionId).toBe('tx-1');
    expect(state.total).toBe(2015);
  });

  it('handles createTransaction.rejected', () => {
    const action = {
      type: createTransaction.rejected.type,
      error: { message: 'Payment failed' },
    };

    const state = reducer(baseState, action as any);

    expect(state.loading).toBe(false);
    expect(state.status).toBe('ERROR');
    expect(state.error).toBe('Payment failed');
  });
});
