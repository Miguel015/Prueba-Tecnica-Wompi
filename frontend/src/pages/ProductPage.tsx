import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProductById } from '../store/product/product.slice';
import type {
  CardInfo,
  CustomerInfo,
  DeliveryInfo,
} from '../store/transaction/transaction.slice';
import { createTransaction, setDraftData } from '../store/transaction/transaction.slice';
import { detectBrand, isExpiryValid, luhnValid } from '../components/cardValidation';

const PRODUCT_ID = '00000000-0000-0000-0000-000000000001';

type FormErrors = {
  cardNumber?: string;
  expMonth?: string;
  expYear?: string;
  cvc?: string;
  cardHolderName?: string;
  customerName?: string;
  customerEmail?: string;
  address?: string;
};

function ProductPage() {
  const dispatch = useAppDispatch();
  const product = useAppSelector((state) => state.product);
  const transaction = useAppSelector((state) => state.transaction);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [card, setCard] = useState<CardInfo>({
    number: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    cardHolderName: '',
  });
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    email: '',
  });
  const [delivery, setDelivery] = useState<DeliveryInfo>({ address: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [autoCloseSeconds, setAutoCloseSeconds] = useState(0);

  useEffect(() => {
    if (!product.id) {
      dispatch(fetchProductById(PRODUCT_ID));
    }
  }, [dispatch, product.id]);

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    const name = customer.name.trim();
    const email = customer.email.trim();
    const address = delivery.address.trim();
    const cardNumber = card.number.replace(/\s+/g, '');
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    if (!name || name.length < 3) {
      errors.customerName = 'Customer name must be at least 3 characters';
    }
    if (!email || !emailRegex.test(email)) {
      errors.customerEmail = 'A valid customer email is required';
    }
    if (!address || address.length < 5) {
      errors.address = 'Delivery address must be at least 5 characters';
    }
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19 || !luhnValid(card.number)) {
      errors.cardNumber = 'Invalid card number';
    }
    if (!isExpiryValid(card.expMonth, card.expYear)) {
      errors.expMonth = 'Card expiry is not valid';
      errors.expYear = 'Card expiry is not valid';
    }
    if (!card.cvc || card.cvc.length < 3 || card.cvc.length > 4) {
      errors.cvc = 'CVC is invalid';
    }
    const holder = card.cardHolderName.trim();
    if (!holder || holder.length < 5) {
      errors.cardHolderName = 'Card holder name must be at least 5 characters';
    }
    return errors;
  };

  const handleOpenPayment = () => {
    setIsModalOpen(true);
  };

  const handleContinueToSummary = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    if (!product.id) return;
    dispatch(
      setDraftData({
        productId: product.id,
        customer,
        delivery,
        card,
      }),
    );
    setIsModalOpen(false);
    setShowSummary(true);
  };

  const handleConfirmPayment = async () => {
    if (!product.id) return;
    await dispatch(
      createTransaction({
        productId: product.id,
        customer,
        delivery,
        card,
      }),
    );
    setShowResult(true);
    setShowSummary(false);
    setIsModalOpen(false);
  };

  const handleBackToForm = () => {
    if (transaction.loading) return;
    setShowSummary(false);
    setIsModalOpen(true);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setAutoCloseSeconds(0);
    dispatch(fetchProductById(PRODUCT_ID));
  };

  useEffect(() => {
    if (!showResult) {
      return;
    }

    setAutoCloseSeconds(5);
    const interval = setInterval(() => {
      setAutoCloseSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleCloseResult();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showResult]);

  const cardBrand = detectBrand(card.number);

  return (
    <div className="app-container">
      <div className="product-card">
        {product.loading ? (
          <p>Loading product...</p>
        ) : (
          <>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <p>Price: ${product.price.toFixed(2)}</p>
            <p>Stock available: {product.stockAvailable}</p>
            <button
              className="btn-primary"
              disabled={product.stockAvailable <= 0}
              onClick={handleOpenPayment}
            >
              Pay with credit card
            </button>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Payment & Delivery</h2>
            <div className="form-group">
              <label>Card number ({cardBrand})</label>
              <input
                className={formErrors.cardNumber ? 'input-error' : ''}
                value={card.number}
                onChange={(e) =>
                  setCard((prev) => ({ ...prev, number: e.target.value }))
                }
                placeholder="4111 1111 1111 1111"
              />
              {formErrors.cardNumber && (
                <span className="field-error">{formErrors.cardNumber}</span>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry (MM)</label>
                <input
                  className={formErrors.expMonth ? 'input-error' : ''}
                  value={card.expMonth}
                  onChange={(e) =>
                    setCard((prev) => ({ ...prev, expMonth: e.target.value }))
                  }
                  placeholder="MM"
                />
                {formErrors.expMonth && (
                  <span className="field-error">{formErrors.expMonth}</span>
                )}
              </div>
              <div className="form-group">
                <label>Expiry (YY)</label>
                <input
                  className={formErrors.expYear ? 'input-error' : ''}
                  value={card.expYear}
                  onChange={(e) =>
                    setCard((prev) => ({ ...prev, expYear: e.target.value }))
                  }
                  placeholder="YY"
                />
                {formErrors.expYear && (
                  <span className="field-error">{formErrors.expYear}</span>
                )}
              </div>
              <div className="form-group">
                <label>CVC</label>
                <input
                  className={formErrors.cvc ? 'input-error' : ''}
                  value={card.cvc}
                  onChange={(e) =>
                    setCard((prev) => ({ ...prev, cvc: e.target.value }))
                  }
                  placeholder="123"
                />
                {formErrors.cvc && (
                  <span className="field-error">{formErrors.cvc}</span>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Card holder name</label>
              <input
                className={formErrors.cardHolderName ? 'input-error' : ''}
                value={card.cardHolderName}
                onChange={(e) =>
                  setCard((prev) => ({
                    ...prev,
                    cardHolderName: e.target.value,
                  }))
                }
              />
              {formErrors.cardHolderName && (
                <span className="field-error">{formErrors.cardHolderName}</span>
              )}
            </div>

            <div className="section-group">
              <div className="section-block">
                <h3>Customer</h3>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    className={formErrors.customerName ? 'input-error' : ''}
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                  {formErrors.customerName && (
                    <span className="field-error">{formErrors.customerName}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    className={formErrors.customerEmail ? 'input-error' : ''}
                    value={customer.email}
                    onChange={(e) =>
                      setCustomer((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                  {formErrors.customerEmail && (
                    <span className="field-error">{formErrors.customerEmail}</span>
                  )}
                </div>
              </div>

              <div className="section-block">
                <h3>Delivery</h3>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    className={formErrors.address ? 'input-error' : ''}
                    value={delivery.address}
                    onChange={(e) =>
                      setDelivery({ address: e.target.value })
                    }
                  />
                  {formErrors.address && (
                    <span className="field-error">{formErrors.address}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleContinueToSummary}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {showSummary && product.id && (
        <div className="summary-backdrop">
          <div className="summary-card">
            <h2>Summary</h2>
            <div className="summary-body">
              <div className="summary-row">
                <span>Product price</span>
                <span>${product.price.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Base fee</span>
                <span>$5.00</span>
              </div>
              <div className="summary-row">
                <span>Delivery fee</span>
                <span>$10.00</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>
                  $
                  {(product.price + 5 + 10).toFixed(2)}
                </span>
              </div>
            </div>
            <button
              className="btn-secondary"
              type="button"
              onClick={handleBackToForm}
              disabled={transaction.loading}
            >
              Back
            </button>
            <button
              className="btn-primary"
              onClick={handleConfirmPayment}
              disabled={transaction.loading}
            >
              {transaction.loading ? (
                <span className="btn-loader">
                  <span className="btn-loader-dot" />
                  <span className="btn-loader-dot" />
                  <span className="btn-loader-dot" />
                  <span className="btn-loader-text">Sending payment...</span>
                </span>
              ) : (
                'Pay now'
              )}
            </button>
          </div>
        </div>
      )}

      {showResult && (
        <div className="summary-backdrop">
          <div className="summary-card">
            <h2>Payment result</h2>
            <p>
              Status:{' '}
              <span
                className={
                  transaction.status === 'APPROVED'
                    ? 'status-pill status-approved'
                    : transaction.status === 'DECLINED'
                    ? 'status-pill status-declined'
                    : transaction.status === 'PENDING'
                    ? 'status-pill status-pending'
                    : 'status-pill status-error'
                }
              >
                {transaction.status}
              </span>
            </p>

            {transaction.status === 'PENDING' && <p>Processing payment...</p>}

            {transaction.status === 'APPROVED' && <p>Payment approved!</p>}
            {transaction.status === 'DECLINED' && <p>Payment declined.</p>}
            {transaction.status === 'ERROR' && (
              <p>Error processing payment: {transaction.error}</p>
            )}
            {autoCloseSeconds > 0 && (
              <p className="hint-text">
                Returning to product in {autoCloseSeconds}s...
              </p>
            )}
            <button
              className="btn-secondary"
              onClick={handleCloseResult}
            >
              Back to product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPage;
