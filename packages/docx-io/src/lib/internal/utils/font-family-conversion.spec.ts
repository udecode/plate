import { fontFamilyToTableObject } from './font-family-conversion';

describe('font family conversion', () => {
  it('strips quotes and keeps the trailing generic family', () => {
    expect(
      fontFamilyToTableObject(
        '"IBM Plex Sans", "Segoe UI", sans-serif',
        'Arial'
      )
    ).toEqual({
      fontName: 'IBM Plex Sans',
      genericFontName: 'sans-serif',
    });
  });

  it('preserves unquoted family names', () => {
    expect(fontFamilyToTableObject('Aptos, serif', 'Arial')).toEqual({
      fontName: 'Aptos',
      genericFontName: 'serif',
    });
  });

  it('falls back to the document font when no family is provided', () => {
    expect(fontFamilyToTableObject(undefined, 'Times New Roman')).toEqual({
      fontName: 'Times New Roman',
      genericFontName: 'Times New Roman',
    });
  });
});
