import { defaultFont } from '../constants';

import generateThemeXML from './theme';

describe('generateThemeXML', () => {
  it('uses the default font in the major and minor font schemes', () => {
    const xml = generateThemeXML();

    expect(
      xml.match(new RegExp(`typeface="${defaultFont}"`, 'g'))
    ).toHaveLength(4);
  });

  it('renders a custom font across the latin and east Asia slots', () => {
    const xml = generateThemeXML('Fira Code');

    expect(xml).toContain('<a:majorFont>');
    expect(xml).toContain('<a:minorFont>');
    expect(xml).toContain('<a:latin typeface="Fira Code"/>');
    expect(xml).toContain('<a:ea typeface="Fira Code"/>');
  });
});
