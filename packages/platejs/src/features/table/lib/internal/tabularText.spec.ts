import { parseTabSeparated, serializeTabSeparated } from './tabularText';

describe('tabularText', () => {
  it.each([
    ['quotes around a field split by a tab', [['"a', 'b"', 'c']]],
    ['a tab inside a field', [['a\tb', 'c']]],
    ['a field that is only a quote', [['"', '6"']]],
    ['line breaks inside a field', [['one\ntwo', 'three\r\nfour']]],
    ['an empty last row', [['a'], ['']]],
  ])('round-trips %s', (_name, rows) => {
    expect(parseTabSeparated(serializeTabSeparated(rows))).toEqual(rows);
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
