import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

export type TransactionStatus = 'IDLE' | 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface CardInfo {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolderName: string;
}

export interface DeliveryInfo {
  address: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  documentNumber?: string;
}

export interface TransactionState {
  transactionId?: string;
  status: TransactionStatus;
  productId?: string;
  amount: number;
  baseFee: number;
  deliveryFee: number;
  total: number;
  card?: CardInfo;
  customer?: CustomerInfo;
  delivery?: DeliveryInfo;
  loading: boolean;
  error?: string;
}

const STORAGE_KEY = 'wompi_test_transaction_state';

const initialStateBase: TransactionState = {
  status: 'IDLE',
  amount: 0,
  baseFee: 0,
  deliveryFee: 0,
  total: 0,
  loading: false,
};

export const hydrateFromStorage = (): TransactionState => {
  if (typeof window === 'undefined') return initialStateBase;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialStateBase;
    const parsed = JSON.parse(raw) as TransactionState;
    return { ...initialStateBase, ...parsed };
  } catch {
    return initialStateBase;
  }
};

export const persistToStorage = (state: TransactionState) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const createTransaction = createAsyncThunk(
  'transaction/create',
  async (
    payload: {
      productId: string;
      customer: CustomerInfo;
      delivery: DeliveryInfo;
      card: CardInfo;
    },
  ) => {
    const response = await api.post('/api/transactions', payload);
    return response.data as {
      transactionId: string;
      status: Exclude<TransactionStatus, 'IDLE'>;
      productId: string;
      amount: number;
      baseFee: number;
      deliveryFee: number;
      total: number;
    };
  },
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState: hydrateFromStorage(),
  reducers: {
    setDraftData(
      state,
      action: PayloadAction<{
        productId: string;
        customer: CustomerInfo;
        delivery: DeliveryInfo;
        card: CardInfo;
      }>,
    ) {
      state.productId = action.payload.productId;
      state.customer = action.payload.customer;
      state.delivery = action.payload.delivery;
      state.card = action.payload.card;
      persistToStorage(state);
    },
    clearTransaction(state) {
      Object.assign(state, initialStateBase);
      persistToStorage(state);
    },
    hydrate(state, action: PayloadAction<TransactionState>) {
      Object.assign(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = undefined;
        state.status = 'PENDING';
        persistToStorage(state);
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactionId = action.payload.transactionId;
        state.status = action.payload.status;
        state.productId = action.payload.productId;
        state.amount = action.payload.amount;
        state.baseFee = action.payload.baseFee;
        state.deliveryFee = action.payload.deliveryFee;
        state.total = action.payload.total;
        persistToStorage(state);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.status = 'ERROR';
        state.error = action.error.message ?? 'Payment failed';
        persistToStorage(state);
      });
  },
});

export const { setDraftData, clearTransaction, hydrate } =
  transactionSlice.actions;

export default transactionSlice.reducer;
