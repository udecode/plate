import { NO_BREAK_SPACE, SPACE } from '../constants';
import { isOrderedListSymbol } from './isOrderedListSymbol';

describe('isOrderedListSymbol', () => {
  it('Recognizes symbols of unordered lists', () => {
    const unorderedListSymbols = [
      '§',
      '·',
      'o',
      'r',
      'v',
      '',
      'Ø',
      'ü',
      '¢',
      '¿',
    ];

    unorderedListSymbols.forEach((symbol) => {
      expect(isOrderedListSymbol(symbol)).toBe(false);
      expect(isOrderedListSymbol(`${NO_BREAK_SPACE}${symbol}`)).toBe(false);
      expect(
        isOrderedListSymbol(`${NO_BREAK_SPACE}${symbol}${NO_BREAK_SPACE}`)
      ).toBe(false);
      expect(isOrderedListSymbol(`${symbol}${NO_BREAK_SPACE}`)).toBe(false);
      expect(isOrderedListSymbol(`${NO_BREAK_SPACE}${symbol}${SPACE}`)).toBe(
        false
      );
      expect(isOrderedListSymbol(`${symbol}${SPACE}`)).toBe(false);
      expect(
        isOrderedListSymbol(
          `${NO_BREAK_SPACE}${symbol}${NO_BREAK_SPACE}${SPACE}`
        )
      ).toBe(false);
      expect(isOrderedListSymbol(`${symbol}${NO_BREAK_SPACE}${SPACE}`)).toBe(
        false
      );
    });
  });

  it('Recognizes symbols of ordered lists', () => {
    const orderedListSymbols = [
      '01.',
      '01)',
      '1.',
      '1)',
      'I.',
      'i.',
      'I)',
      'i)',
      'A.',
      'a.',
      'A)',
      'a)',
      'One.',
      '1st.',
      'First.',
    ];

    orderedListSymbols.forEach((symbol) => {
      expect(isOrderedListSymbol(symbol)).toBe(true);
      expect(isOrderedListSymbol(`${NO_BREAK_SPACE}${symbol}`)).toBe(true);
      expect(
        isOrderedListSymbol(`${NO_BREAK_SPACE}${symbol}${NO_BREAK_SPACE}`)
      ).toBe(true);
      expect(isOrderedListSymbol(`${symbol}${NO_BREAK_SPACE}`)).toBe(true);
      expect(isOrderedListSymbol(`${NO_BREAK_SPACE}${symbol}${SPACE}`)).toBe(
        true
      );
      expect(isOrderedListSymbol(`${symbol}${SPACE}`)).toBe(true);
      expect(
        isOrderedListSymbol(
          `${NO_BREAK_SPACE}${symbol}${NO_BREAK_SPACE}${SPACE}`
        )
      ).toBe(true);
      expect(isOrderedListSymbol(`${symbol}${NO_BREAK_SPACE}${SPACE}`)).toBe(
        true
      );
    });
  });
});
