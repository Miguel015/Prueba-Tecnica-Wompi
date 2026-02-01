import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

export interface ProductState {
  id: string | null;
  name: string;
  description?: string;
  price: number;
  stockAvailable: number;
  loading: boolean;
  error?: string;
}

const initialState: ProductState = {
  id: null,
  name: '',
  description: undefined,
  price: 0,
  stockAvailable: 0,
  loading: false,
};

export const fetchProductById = createAsyncThunk(
  'product/fetchById',
  async (id: string) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data as Omit<ProductState, 'loading' | 'error'>;
  },
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load product';
      });
  },
});

export default productSlice.reducer;
