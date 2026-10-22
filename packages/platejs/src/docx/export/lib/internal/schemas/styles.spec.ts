import generateStylesXML from './styles';

describe('generateStylesXML', () => {
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
