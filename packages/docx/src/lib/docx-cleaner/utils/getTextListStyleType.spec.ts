import { getTextListStyleType } from './getTextListStyleType';

describe('getTextListStyleType', () => {
  it.each([
    ['01. Item', 'decimal-leading-zero'],
    ['12. Item', 'decimal'],
    ['iv. Item', 'lower-roman'],
    ['g. Item', 'lower-alpha'],
    ['IV. Item', 'upper-roman'],
    ['G. Item', 'upper-alpha'],
    ['bullet item', undefined],
  ])('maps %s to %s', (text, expected) => {
    expect(getTextListStyleType(text)).toBe(expected);
  });
});
