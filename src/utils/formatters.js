import { PERSON_COLORS } from './constants';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const toTitleCase = (str) => {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

export const formatDateInput = (value) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
};

export const parsePercentageInput = (value) => {
  const trimmed = value.toString().trim();

  // Handle fraction input (e.g., "1/4")
  if (trimmed.includes('/')) {
    const [numerator, denominator] = trimmed.split('/').map(p => parseFloat(p.trim()));
    if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
      return (numerator / denominator) * 100;
    }
    return null;
  }

  const num = parseFloat(trimmed);
  if (isNaN(num)) return null;

  // Treat values between 0 and 1 as decimals (e.g., 0.25 = 25%)
  if (num > 0 && num < 1) return num * 100;
  return num;
};

export const gcd = (a, b) => {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
};

export const formatFraction = (percentage) => {
  if (percentage === 0) return '0';
  if (percentage === 100) return '1/1';

  const decimal = percentage / 100;
  const precision = 1000000;
  let numerator = Math.round(decimal * precision);
  let denominator = precision;

  const divisor = gcd(numerator, denominator);
  if (divisor === 0) return `${numerator}/${denominator}`;
  numerator = Math.round(numerator / divisor);
  denominator = Math.round(denominator / divisor);

  return `${numerator}/${denominator}`;
};

export const getPersonColor = (personId, persons) => {
  const index = persons.findIndex(p => p.id === personId);
  return PERSON_COLORS[index % PERSON_COLORS.length];
};

export const getDocumentLabel = (doc, relationship) => {
  if (!doc && !relationship) return '';

  const parts = [];

  // Add book/page in (book/page) format
  if (doc) {
    if (doc.book && doc.page) {
      parts.push(`(${doc.book}/${doc.page})`);
    } else if (doc.instrumentNumber) {
      parts.push(doc.instrumentNumber);
    } else if (doc.documentTitle) {
      parts.push(doc.documentTitle.substring(0, 12));
    }
  }

  // Add relationship if present
  if (relationship) {
    parts.push(relationship);
  }

  return parts.join(' ');
};
