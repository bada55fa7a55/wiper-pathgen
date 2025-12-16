const signedNumberPattern = /^[+-]?\d+(?:\.\d+)?$/;
const positiveDecimalPattern = /^\+?\d+(?:\.\d+)?$/;
const positiveIntegerPattern = /^\+?\d+$/;

const signedDecimalErrorMessage = 'Enter a positive or negative number (decimals allowed).';
const positiveDecimalErrorMessage = 'Enter a positive number (decimals allowed).';
const positiveIntegerErrorMessage = 'Enter a positive whole number.';

type NumericValidationResult = {
  parsedValue: number | undefined;
  errorMessage: string;
};

export type SignedDecimalValidationResult = NumericValidationResult;
export type PositiveDecimalValidationResult = NumericValidationResult;
export type PositiveIntegerValidationResult = NumericValidationResult;

export function validateSignedDecimal(rawValue: string): SignedDecimalValidationResult {
  const trimmedValue = rawValue.trim();

  const isIncompleteNumber =
    trimmedValue === '' ||
    trimmedValue === '+' ||
    trimmedValue === '-' ||
    trimmedValue === '.' ||
    trimmedValue === '+.' ||
    trimmedValue === '-.';

  if (isIncompleteNumber) {
    return { parsedValue: undefined, errorMessage: signedDecimalErrorMessage };
  }

  if (signedNumberPattern.test(trimmedValue)) {
    return { parsedValue: parseFloat(trimmedValue), errorMessage: '' };
  }

  return { parsedValue: undefined, errorMessage: signedDecimalErrorMessage };
}

export function validatePositiveDecimal(rawValue: string): PositiveDecimalValidationResult {
  const trimmedValue = rawValue.trim();

  const isIncompleteNumber = trimmedValue === '' || trimmedValue === '+' || trimmedValue === '.';

  if (isIncompleteNumber) {
    return { parsedValue: undefined, errorMessage: positiveDecimalErrorMessage };
  }

  if (positiveDecimalPattern.test(trimmedValue)) {
    return { parsedValue: parseFloat(trimmedValue), errorMessage: '' };
  }

  return { parsedValue: undefined, errorMessage: positiveDecimalErrorMessage };
}

export function validatePositiveInteger(rawValue: string): PositiveIntegerValidationResult {
  const trimmedValue = rawValue.trim();

  const isIncompleteNumber = trimmedValue === '' || trimmedValue === '+';

  if (isIncompleteNumber) {
    return { parsedValue: undefined, errorMessage: positiveIntegerErrorMessage };
  }

  if (positiveIntegerPattern.test(trimmedValue)) {
    return { parsedValue: parseInt(trimmedValue, 10), errorMessage: '' };
  }

  return { parsedValue: undefined, errorMessage: positiveIntegerErrorMessage };
}
