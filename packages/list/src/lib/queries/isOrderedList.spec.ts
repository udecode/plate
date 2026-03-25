import { ListStyleType } from '../types';
import { isOrderedList } from './isOrderedList';

describe('isOrderedList', () => {
  it.each([
    [undefined, false],
    [ListStyleType.Disc, false],
    [ListStyleType.Circle, false],
    [ListStyleType.Decimal, true],
    [ListStyleType.DecimalLeadingZero, true],
    [ListStyleType.LowerRoman, true],
  ])('treats %s as ordered=%s', (listStyleType, expected) => {
    expect(isOrderedList({ listStyleType } as any)).toBe(expected);
  });
});
