const OL_SYMBOL_REGEX = /[\da-np-z]\S/;

export const isOlSymbol = (symbol: string): boolean =>
  OL_SYMBOL_REGEX.test(symbol.toLowerCase());
