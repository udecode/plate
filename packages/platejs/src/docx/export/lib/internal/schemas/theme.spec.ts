import generateThemeXML from './theme';

describe('generateThemeXML', () => {
  it('renders a custom font across the latin and east Asia slots', () => {
    const xml = generateThemeXML('Fira Code');

    expect(xml).toContain('<a:majorFont>');
    expect(xml).toContain('<a:minorFont>');
    expect(xml).toContain('<a:latin typeface="Fira Code"/>');
    expect(xml).toContain('<a:ea typeface="Fira Code"/>');
  });
});
