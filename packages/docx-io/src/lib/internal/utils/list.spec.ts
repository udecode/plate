import ListStyleBuilder from './list';

describe('ListStyleBuilder', () => {
  it.each([
    ['upper-roman', 'upperRoman'],
    ['lower-roman', 'lowerRoman'],
    ['upper-alpha', 'upperLetter'],
    ['upper-alpha-bracket-end', 'upperLetter'],
    ['lower-alpha', 'lowerLetter'],
    ['lower-alpha-bracket-end', 'lowerLetter'],
    ['decimal', 'decimal'],
    ['decimal-bracket', 'decimal'],
    ['decimal-bracket-end', 'decimal'],
  ] as const)('maps %s to %s numbering', (listType, expected) => {
    const builder = new ListStyleBuilder({
      defaultOrderedListStyleType: 'upperRoman',
    });

    expect(builder.getListStyleType(listType)).toBe(expected);
  });

  it('falls back to the configured default for unknown list styles', () => {
    const builder = new ListStyleBuilder({
      defaultOrderedListStyleType: 'upperRoman',
    });

    expect(builder.getListStyleType(undefined)).toBe('upperRoman');
  });

  it.each([
    [{ 'list-style-type': 'decimal' }, 0, '%1.'],
    [{ 'list-style-type': 'decimal-bracket' }, 1, '(%2)'],
    [{ 'list-style-type': 'decimal-bracket-end' }, 2, '%3)'],
    [{ 'list-style-type': 'upper-alpha-bracket-end' }, 0, '%1)'],
    [{ 'list-style-type': 'lower-roman' }, 1, '%2.'],
  ] as const)('formats %j at level %i as %s', (style, level, expected) => {
    const builder = new ListStyleBuilder();

    expect(builder.getListPrefixSuffix(style, level)).toBe(expected);
  });
});
