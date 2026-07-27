const digitRegex = /\d+/;

// return '0' if value not valid
export const toUnitLess = (value: string): string => {
  const match = digitRegex.exec(value);

  if (!match) return '0';

  const num = Number(match[0]);

  if (value.endsWith('rem')) {
    return (num * 16).toString();
  }

  return num.toString();
};
