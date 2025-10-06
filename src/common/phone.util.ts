import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function normalizeMobile(input: string, defaultCountry = 'EG') {
  const pn = parsePhoneNumberFromString(
    (input || '').trim(),
    defaultCountry as any,
  );
  if (!pn || !pn.isValid()) throw new Error('Invalid phone number');
  return pn.number; // E.164 => +20100xxxxxxx
}
