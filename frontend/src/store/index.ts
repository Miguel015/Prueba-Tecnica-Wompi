import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import productReducer from './product/product.slice';
import transactionReducer from './transaction/transaction.slice';

export const store = configureStore({
  reducer: {
    product: productReducer,
    transaction: transactionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector = <TSelected>(
  selector: (state: RootState) => TSelected,
): TSelected => useSelector(selector);
