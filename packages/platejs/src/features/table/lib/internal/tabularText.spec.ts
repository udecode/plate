import { parseTabSeparated, serializeTabSeparated } from './tabularText';

describe('tabularText', () => {
  it.each([
    [
      'quotes around a field split by a tab',
      [['"a', 'b"', 'c']],
      '"""a"\tb"\tc\n',
    ],
    ['a tab inside a field', [['a\tb', 'c']], '"a\tb"\tc\n'],
    ['a field that is only a quote', [['"', '6"']], '""""\t6"\n'],
    [
      'line breaks inside a field',
      [['one\ntwo', 'three\r\nfour']],
      '"one\ntwo"\t"three\r\nfour"\n',
    ],
    ['an empty last row', [['a'], ['']], 'a\n\n'],
  ])('round-trips %s through spreadsheet TSV', (_name, rows, tsv) => {
    expect(serializeTabSeparated(rows)).toBe(tsv);
    expect(parseTabSeparated(tsv)).toEqual(rows);
  });

  it('keeps quotes on a field that did not need quoting', () => {
    expect(parseTabSeparated('"quoted"\tx\n')).toEqual([['"quoted"', 'x']]);
  });

  it('ends a quoted field only at a field boundary', () => {
    expect(parseTabSeparated('"a\tb"c"\td')).toEqual([['"a', 'b"c"', 'd']]);
  });

  it('reads an unclosed quote as text', () => {
    expect(parseTabSeparated('"open\tb\nc\td')).toEqual([
      ['"open', 'b'],
      ['c', 'd'],
    ]);
  });

  it('reads a quoted spreadsheet field across lines', () => {
    expect(
      parseTabSeparated('name\tnote\nAda\t"line one\nline two"\n')
    ).toEqual([
      ['name', 'note'],
      ['Ada', 'line one\nline two'],
    ]);
  });

  it('adds no row for a final CRLF', () => {
    expect(parseTabSeparated('a\tb\r\nc\td\r\n')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('keeps an empty field after a final tab', () => {
    expect(parseTabSeparated('a\t')).toEqual([['a', '']]);
  });
});
