export const isOlSymbol = (symbol: string): boolean => {
  return /[\da-np-z]\S/.test(symbol.toLowerCase());
};
