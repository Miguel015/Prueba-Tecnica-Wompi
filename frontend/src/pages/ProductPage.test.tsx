import * as React from 'react';
import { Provider } from 'react-redux';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { store } from '../store';
import { fetchProductById } from '../store/product/product.slice';
import ProductPage from './ProductPage';

const PRODUCT_ID = '00000000-0000-0000-0000-000000000001';

const mockProduct = {
  id: PRODUCT_ID,
  name: 'Test Product',
  description: 'Test description',
  price: 2000,
  stockAvailable: 5,
};

function renderWithStore(ui: React.ReactElement) {
  return render(<Provider store={store}>{ui}</Provider>);
}

beforeEach(() => {
  store.dispatch(
    fetchProductById.fulfilled(mockProduct, 'test-request', PRODUCT_ID),
  );
});

describe('ProductPage form validation', () => {
  it('shows field errors when submitting empty form', async () => {
    renderWithStore(<ProductPage />);

    const payButton = await screen.findByRole('button', {
      name: /pay with credit card/i,
    });

    fireEvent.click(payButton);

    const continueButton = await screen.findByRole('button', {
      name: /continue/i,
    });

    fireEvent.click(continueButton);

    expect(
      await screen.findByText(/customer name must be at least 3 characters/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/a valid customer email is required/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/delivery address must be at least 5 characters/i),
    ).toBeInTheDocument();
  });

  it('accepts valid data for Miguel Suarez and reaches summary', async () => {
    renderWithStore(<ProductPage />);

    const payButton = await screen.findByRole('button', {
      name: /pay with credit card/i,
    });

    fireEvent.click(payButton);

    const cardNumberInput = screen.getByPlaceholderText(
      '4111 1111 1111 1111',
    );
    fireEvent.change(cardNumberInput, {
      target: { value: '4111111111111111' },
    });

    const expMonthInput = screen.getByPlaceholderText('MM');
    fireEvent.change(expMonthInput, {
      target: { value: '12' },
    });

    const expYearInput = screen.getByPlaceholderText('YY');
    fireEvent.change(expYearInput, {
      target: { value: '40' },
    });

    const cvcInput = screen.getByPlaceholderText('123');
    fireEvent.change(cvcInput, {
      target: { value: '123' },
    });

    const cardHolderLabel = screen.getByText(/card holder name/i);
    const cardHolderInput = cardHolderLabel.parentElement?.querySelector(
      'input',
    ) as HTMLInputElement | null;
    if (!cardHolderInput) throw new Error('Card holder input not found');
    fireEvent.change(cardHolderInput, {
      target: { value: 'Miguel Suarez' },
    });

    const nameLabel = screen.getByText(/^name$/i);
    const nameInput = nameLabel.parentElement?.querySelector(
      'input',
    ) as HTMLInputElement | null;
    if (!nameInput) throw new Error('Customer name input not found');
    fireEvent.change(nameInput, {
      target: { value: 'Miguel Suarez' },
    });

    const emailLabel = screen.getByText(/^email$/i);
    const emailInput = emailLabel.parentElement?.querySelector(
      'input',
    ) as HTMLInputElement | null;
    if (!emailInput) throw new Error('Customer email input not found');
    fireEvent.change(emailInput, {
      target: { value: 'miguel@example.com' },
    });

    const addressLabel = screen.getByText(/address/i);
    const addressInput = addressLabel.parentElement?.querySelector(
      'input',
    ) as HTMLInputElement | null;
    if (!addressInput) throw new Error('Address input not found');
    fireEvent.change(addressInput, {
      target: { value: 'Street 123' },
    });

    const continueButton = await screen.findByRole('button', {
      name: /continue/i,
    });

    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/summary/i)).toBeInTheDocument();
    });
  });
});
