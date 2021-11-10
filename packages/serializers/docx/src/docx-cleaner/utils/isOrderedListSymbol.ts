export const isOrderedListSymbol = (symbol: string): boolean => {
  return /[0-9a-np-z]\S/g.test(symbol.toLowerCase());
};
