import {
  NO_BREAK_SPACE,
  SPACE,
} from '@/packages/core/src/plugins/html-deserializer/constants';

import { isOlSymbol } from './isOlSymbol';

describe('isOlSymbol', () => {
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
      expect(isOlSymbol(symbol)).toBe(false);
      expect(isOlSymbol(`${NO_BREAK_SPACE}${symbol}`)).toBe(false);
      expect(isOlSymbol(`${NO_BREAK_SPACE}${symbol}${NO_BREAK_SPACE}`)).toBe(
        false
      );
      expect(isOlSymbol(`${symbol}${NO_BREAK_SPACE}`)).toBe(false);
      expect(isOlSymbol(`${NO_BREAK_SPACE}${symbol}${SPACE}`)).toBe(false);
      expect(isOlSymbol(`${symbol}${SPACE}`)).toBe(false);
      expect(
        isOlSymbol(`${NO_BREAK_SPACE}${symbol}${NO_BREAK_SPACE}${SPACE}`)
      ).toBe(false);
      expect(isOlSymbol(`${symbol}${NO_BREAK_SPACE}${SPACE}`)).toBe(false);
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
      expect(isOlSymbol(symbol)).toBe(true);
      expect(isOlSymbol(`${NO_BREAK_SPACE}${symbol}`)).toBe(true);
      expect(isOlSymbol(`${NO_BREAK_SPACE}${symbol}${NO_BREAK_SPACE}`)).toBe(
        true
      );
      expect(isOlSymbol(`${symbol}${NO_BREAK_SPACE}`)).toBe(true);
      expect(isOlSymbol(`${NO_BREAK_SPACE}${symbol}${SPACE}`)).toBe(true);
      expect(isOlSymbol(`${symbol}${SPACE}`)).toBe(true);
      expect(
        isOlSymbol(`${NO_BREAK_SPACE}${symbol}${NO_BREAK_SPACE}${SPACE}`)
      ).toBe(true);
      expect(isOlSymbol(`${symbol}${NO_BREAK_SPACE}${SPACE}`)).toBe(true);
    });
  });
});
