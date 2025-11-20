const DECIMAL_PATTERN = /^\d+[.\\]/;
const LOWER_ROMAN_PATTERN = /^[cdilmvx]+\./;
const LOWER_ALPHA_PATTERN = /^[a-z]+\./;
const UPPER_ROMAN_PATTERN = /^[CDILMVX]+\./;
const UPPER_ALPHA_PATTERN = /^[A-Z]+\./;

export const getTextListStyleType = (text: string): string | undefined => {
  const trimmedText = text.trimStart();

  if (DECIMAL_PATTERN.exec(trimmedText)?.[0]) {
    if (trimmedText.startsWith('0')) {
      return 'decimal-leading-zero';
    }

    return 'decimal';
  }
  if (LOWER_ROMAN_PATTERN.exec(trimmedText)?.[0]) {
    return 'lower-roman';
  }
  if (LOWER_ALPHA_PATTERN.exec(trimmedText)?.[0]) {
    return 'lower-alpha';
  }
  if (UPPER_ROMAN_PATTERN.exec(trimmedText)?.[0]) {
    return 'upper-roman';
  }
  if (UPPER_ALPHA_PATTERN.exec(trimmedText)?.[0]) {
    return 'upper-alpha';
  }
};
