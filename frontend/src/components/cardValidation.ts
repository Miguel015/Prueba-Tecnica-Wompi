export type CardBrand = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

export function detectBrand(cardNumber: string): CardBrand {
  const sanitized = cardNumber.replace(/\s+/g, '');
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(sanitized)) return 'VISA';
  if (/^(5[1-5][0-9]{14})$/.test(sanitized)) return 'MASTERCARD';
  return 'UNKNOWN';
}

export function luhnValid(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let shouldDouble = false;
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function isExpiryValid(month: string, year: string): boolean {
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (!m || !y || m < 1 || m > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (y < currentYear) return false;
  if (y === currentYear && m < currentMonth) return false;
  return true;
}
