export const PROMO_CODES = {
  SALE15: 15,
  SALE20: 20,
  WELCOME10: 10,
};

export function validatePromo(code) {
  const normalizedCode = code.trim().toUpperCase();

  if (!Object.hasOwn(PROMO_CODES, normalizedCode)) {
    return { valid: false };
  }

  return { valid: true, discount: PROMO_CODES[normalizedCode] };
}
