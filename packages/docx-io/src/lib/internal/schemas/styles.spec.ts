import { defaultFont, defaultFontSize, defaultLang } from '../constants';

import generateStylesXML from './styles';

describe('generateStylesXML', () => {
  it('uses the default typography values in the document defaults', () => {
    const xml = generateStylesXML();

    expect(xml).toContain(`w:ascii="${defaultFont}"`);
    expect(xml).toContain(`w:val="${defaultFontSize}"`);
    expect(xml).toContain(`w:val="${defaultLang}"`);
  });

  it('renders custom font, sizes, and language values', () => {
    const xml = generateStylesXML('IBM Plex Sans', 30, 28, 'fr-FR');

    expect(xml).toContain('w:ascii="IBM Plex Sans"');
    expect(xml).toContain('w:sz w:val="30"');
    expect(xml).toContain('w:szCs w:val="28"');
    expect(xml).toContain('w:lang w:val="fr-FR" w:eastAsia="fr-FR"');
    expect(xml).toContain('w:styleId="Heading1"');
    expect(xml).toContain('w:styleId="Hyperlink"');
  });
});
