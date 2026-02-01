import { detectBrand, isExpiryValid, luhnValid } from './cardValidation';

describe('cardValidation utilities', () => {
  it('validates VISA test number with Luhn', () => {
    expect(luhnValid('4111 1111 1111 1111')).toBe(true);
  });

  it('detects VISA and MasterCard', () => {
    expect(detectBrand('4111 1111 1111 1111')).toBe('VISA');
    expect(detectBrand('5105 1051 0510 5100')).toBe('MASTERCARD');
  });

  it('rejects expired dates', () => {
    expect(isExpiryValid('01', '10')).toBe(false);
  });
})
