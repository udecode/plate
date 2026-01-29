/**
 * Property Change Tracking Tests
 *
 * Tests for comprehensive OOXML property change tracking (w:rPrChange, w:pPrChange)
 * per ECMA-376 Part 1 §17.3.2 (run) and §17.3.1 (paragraph).
 *
 * These tests verify that all run and paragraph properties are correctly parsed
 * from property change elements in tracked revisions.
 */

import { XMLParser } from '../../src/xml/XMLParser';
import type { RunFormatting } from '../../src/elements/Run';
import type { ParagraphFormattingPartial } from '../../src/elements/PropertyChangeTypes';

/**
 * Helper to parse run property changes from XML
 * Simulates what DocumentParser.parseRunPropertiesFromObject does for w:rPrChange
 */
function parseRunPropertyChange(xml: string): Partial<RunFormatting> {
  const parsed = XMLParser.parseToObject(xml) as Record<string, any>;
  const rPrChangeObj = (parsed['w:rPrChange'] || parsed) as Record<string, any>;
  const prevRPr = rPrChangeObj['w:rPr'] as Record<string, any> | undefined;

  if (!prevRPr) return {};

  const prevProps: Partial<RunFormatting> = {};

  // Basic formatting
  if (prevRPr['w:b']) prevProps.bold = prevRPr['w:b']['@_w:val'] !== '0';
  if (prevRPr['w:i']) prevProps.italic = prevRPr['w:i']['@_w:val'] !== '0';
  if (prevRPr['w:u']) prevProps.underline = prevRPr['w:u']['@_w:val'] || true;
  if (prevRPr['w:strike'])
    prevProps.strike = prevRPr['w:strike']['@_w:val'] !== '0';
  if (prevRPr['w:dstrike'])
    prevProps.dstrike = prevRPr['w:dstrike']['@_w:val'] !== '0';

  // Font and size
  if (prevRPr['w:rFonts']) prevProps.font = prevRPr['w:rFonts']['@_w:ascii'];
  if (prevRPr['w:sz'])
    prevProps.size = Number.parseInt(prevRPr['w:sz']['@_w:val'], 10) / 2;
  if (prevRPr['w:color']) {
    const colorVal = prevRPr['w:color']['@_w:val'];
    if (colorVal && colorVal !== 'auto') prevProps.color = colorVal;
  }
  if (prevRPr['w:highlight'])
    prevProps.highlight = prevRPr['w:highlight']['@_w:val'];

  // Subscript/superscript
  if (prevRPr['w:vertAlign']) {
    const val = prevRPr['w:vertAlign']['@_w:val'];
    if (val === 'subscript') prevProps.subscript = true;
    if (val === 'superscript') prevProps.superscript = true;
  }

  // Caps
  if (prevRPr['w:smallCaps'])
    prevProps.smallCaps = prevRPr['w:smallCaps']['@_w:val'] !== '0';
  if (prevRPr['w:caps'])
    prevProps.allCaps = prevRPr['w:caps']['@_w:val'] !== '0';

  // Text effects
  if (prevRPr['w:outline'])
    prevProps.outline = prevRPr['w:outline']['@_w:val'] !== '0';
  if (prevRPr['w:shadow'])
    prevProps.shadow = prevRPr['w:shadow']['@_w:val'] !== '0';
  if (prevRPr['w:emboss'])
    prevProps.emboss = prevRPr['w:emboss']['@_w:val'] !== '0';
  if (prevRPr['w:imprint'])
    prevProps.imprint = prevRPr['w:imprint']['@_w:val'] !== '0';

  // Hidden text
  if (prevRPr['w:vanish'])
    prevProps.vanish = prevRPr['w:vanish']['@_w:val'] !== '0';
  if (prevRPr['w:specVanish'])
    prevProps.specVanish = prevRPr['w:specVanish']['@_w:val'] !== '0';

  // RTL and proofing
  if (prevRPr['w:rtl']) prevProps.rtl = prevRPr['w:rtl']['@_w:val'] !== '0';
  if (prevRPr['w:noProof'])
    prevProps.noProof = prevRPr['w:noProof']['@_w:val'] !== '0';
  if (prevRPr['w:snapToGrid'])
    prevProps.snapToGrid = prevRPr['w:snapToGrid']['@_w:val'] !== '0';

  // Complex script
  if (prevRPr['w:bCs'])
    prevProps.complexScriptBold = prevRPr['w:bCs']['@_w:val'] !== '0';
  if (prevRPr['w:iCs'])
    prevProps.complexScriptItalic = prevRPr['w:iCs']['@_w:val'] !== '0';

  // Spacing and positioning
  if (prevRPr['w:spacing']) {
    const val = prevRPr['w:spacing']['@_w:val'];
    if (val !== undefined)
      prevProps.characterSpacing = Number.parseInt(val, 10);
  }
  if (prevRPr['w:w']) {
    const val = prevRPr['w:w']['@_w:val'];
    if (val !== undefined) prevProps.scaling = Number.parseInt(val, 10);
  }
  if (prevRPr['w:position']) {
    const val = prevRPr['w:position']['@_w:val'];
    if (val !== undefined) prevProps.position = Number.parseInt(val, 10);
  }
  if (prevRPr['w:kern']) {
    const val = prevRPr['w:kern']['@_w:val'];
    if (val !== undefined) prevProps.kerning = Number.parseInt(val, 10);
  }

  // Language and style
  if (prevRPr['w:lang']) prevProps.language = prevRPr['w:lang']['@_w:val'];
  if (prevRPr['w:rStyle'])
    prevProps.characterStyle = prevRPr['w:rStyle']['@_w:val'];

  // Effects
  if (prevRPr['w:effect']) prevProps.effect = prevRPr['w:effect']['@_w:val'];
  if (prevRPr['w:fitText']) {
    const val = prevRPr['w:fitText']['@_w:val'];
    if (val !== undefined) prevProps.fitText = Number.parseInt(val, 10);
  }
  if (prevRPr['w:em']) prevProps.emphasis = prevRPr['w:em']['@_w:val'];

  // Border - matches TextBorder interface (style, size, space, color)
  if (prevRPr['w:bdr']) {
    const bdr = prevRPr['w:bdr'];
    prevProps.border = {
      style: bdr['@_w:val'],
      size:
        bdr['@_w:sz'] !== undefined
          ? Number.parseInt(bdr['@_w:sz'], 10)
          : undefined,
      space:
        bdr['@_w:space'] !== undefined
          ? Number.parseInt(bdr['@_w:space'], 10)
          : undefined,
      color: bdr['@_w:color'],
    };
  }

  // Shading - matches CharacterShading interface (fill, color, val)
  if (prevRPr['w:shd']) {
    const shd = prevRPr['w:shd'];
    prevProps.shading = {
      fill: shd['@_w:fill'],
      color: shd['@_w:color'],
      val: shd['@_w:val'],
    };
  }

  // East Asian layout
  if (prevRPr['w:eastAsianLayout']) {
    const ea = prevRPr['w:eastAsianLayout'];
    // Note: parseToObject with parseAttributeValue: true converts "true"/1 to boolean true
    prevProps.eastAsianLayout = {
      id:
        ea['@_w:id'] !== undefined
          ? Number.parseInt(String(ea['@_w:id']), 10)
          : undefined,
      combine:
        ea['@_w:combine'] === true ||
        ea['@_w:combine'] === 'true' ||
        ea['@_w:combine'] === 1 ||
        ea['@_w:combine'] === '1',
      combineBrackets: ea['@_w:combineBrackets'],
      vert:
        ea['@_w:vert'] === true ||
        ea['@_w:vert'] === 'true' ||
        ea['@_w:vert'] === 1 ||
        ea['@_w:vert'] === '1',
      vertCompress:
        ea['@_w:vertCompress'] === true ||
        ea['@_w:vertCompress'] === 'true' ||
        ea['@_w:vertCompress'] === 1 ||
        ea['@_w:vertCompress'] === '1',
    };
  }

  return prevProps;
}

/**
 * Helper to parse paragraph property changes from XML
 */
function parseParagraphPropertyChange(
  xml: string
): Partial<ParagraphFormattingPartial> {
  const parsed = XMLParser.parseToObject(xml) as Record<string, any>;
  const pPrChangeObj = (parsed['w:pPrChange'] || parsed) as Record<string, any>;
  const prevPPr = pPrChangeObj['w:pPr'] as Record<string, any> | undefined;

  if (!prevPPr) return {};

  const prevProps: Partial<ParagraphFormattingPartial> = {};

  // Style
  if (prevPPr['w:pStyle']?.['@_w:val']) {
    prevProps.style = prevPPr['w:pStyle']['@_w:val'];
  }

  // Alignment
  if (prevPPr['w:jc']?.['@_w:val']) {
    prevProps.alignment = prevPPr['w:jc']['@_w:val'];
  }

  // Keep properties
  if (prevPPr['w:keepNext'])
    prevProps.keepNext = prevPPr['w:keepNext']['@_w:val'] !== '0';
  if (prevPPr['w:keepLines'])
    prevProps.keepLines = prevPPr['w:keepLines']['@_w:val'] !== '0';
  if (prevPPr['w:pageBreakBefore'])
    prevProps.pageBreakBefore = prevPPr['w:pageBreakBefore']['@_w:val'] !== '0';
  if (prevPPr['w:widowControl'])
    prevProps.widowControl = prevPPr['w:widowControl']['@_w:val'] !== '0';

  // Spacing
  if (prevPPr['w:suppressAutoHyphens'])
    prevProps.suppressAutoHyphens =
      prevPPr['w:suppressAutoHyphens']['@_w:val'] !== '0';
  if (prevPPr['w:contextualSpacing'])
    prevProps.contextualSpacing =
      prevPPr['w:contextualSpacing']['@_w:val'] !== '0';
  if (prevPPr['w:mirrorIndents'])
    prevProps.mirrorIndents = prevPPr['w:mirrorIndents']['@_w:val'] !== '0';

  // Outline and direction
  if (prevPPr['w:outlineLvl']?.['@_w:val'] !== undefined) {
    prevProps.outlineLevel = Number.parseInt(
      prevPPr['w:outlineLvl']['@_w:val'],
      10
    );
  }
  if (prevPPr['w:bidi']) prevProps.bidi = prevPPr['w:bidi']['@_w:val'] !== '0';
  if (prevPPr['w:textDirection']?.['@_w:val']) {
    prevProps.textDirection = prevPPr['w:textDirection']['@_w:val'];
  }

  // Grid and spacing
  if (prevPPr['w:suppressLineNumbers'])
    prevProps.suppressLineNumbers =
      prevPPr['w:suppressLineNumbers']['@_w:val'] !== '0';
  if (prevPPr['w:adjustRightInd'])
    prevProps.adjustRightInd = prevPPr['w:adjustRightInd']['@_w:val'] !== '0';
  if (prevPPr['w:snapToGrid'])
    prevProps.snapToGrid = prevPPr['w:snapToGrid']['@_w:val'] !== '0';
  if (prevPPr['w:wordWrap'])
    prevProps.wordWrap = prevPPr['w:wordWrap']['@_w:val'] !== '0';
  if (prevPPr['w:autoSpaceDE'])
    prevProps.autoSpaceDE = prevPPr['w:autoSpaceDE']['@_w:val'] !== '0';
  if (prevPPr['w:autoSpaceDN'])
    prevProps.autoSpaceDN = prevPPr['w:autoSpaceDN']['@_w:val'] !== '0';

  // Borders
  if (prevPPr['w:pBdr']) {
    const pBdr = prevPPr['w:pBdr'];
    prevProps.borders = {};

    const parseBorder = (borderObj: any) => {
      if (!borderObj) return;
      return {
        val: borderObj['@_w:val'],
        sz:
          borderObj['@_w:sz'] !== undefined
            ? Number.parseInt(borderObj['@_w:sz'], 10)
            : undefined,
        space:
          borderObj['@_w:space'] !== undefined
            ? Number.parseInt(borderObj['@_w:space'], 10)
            : undefined,
        color: borderObj['@_w:color'],
        themeColor: borderObj['@_w:themeColor'],
      };
    };

    if (pBdr['w:top']) prevProps.borders.top = parseBorder(pBdr['w:top']);
    if (pBdr['w:bottom'])
      prevProps.borders.bottom = parseBorder(pBdr['w:bottom']);
    if (pBdr['w:left']) prevProps.borders.left = parseBorder(pBdr['w:left']);
    if (pBdr['w:right']) prevProps.borders.right = parseBorder(pBdr['w:right']);
    if (pBdr['w:between'])
      prevProps.borders.between = parseBorder(pBdr['w:between']);
    if (pBdr['w:bar']) prevProps.borders.bar = parseBorder(pBdr['w:bar']);
  }

  // Shading
  if (prevPPr['w:shd']) {
    const shd = prevPPr['w:shd'];
    prevProps.shading = {
      fill: shd['@_w:fill'],
      color: shd['@_w:color'],
      val: shd['@_w:val'],
      themeFill: shd['@_w:themeFill'],
      themeColor: shd['@_w:themeColor'],
    };
  }

  // Tabs
  if (prevPPr['w:tabs']) {
    const tabsObj = prevPPr['w:tabs'];
    const tabArray = tabsObj['w:tab'];
    if (tabArray) {
      const tabs = Array.isArray(tabArray) ? tabArray : [tabArray];
      prevProps.tabs = tabs.map((tab: any) => ({
        val: tab['@_w:val'],
        pos:
          tab['@_w:pos'] !== undefined
            ? Number.parseInt(tab['@_w:pos'], 10)
            : undefined,
        leader: tab['@_w:leader'],
      }));
    }
  }

  return prevProps;
}

describe('Property Change Tracking', () => {
  describe('Run Property Changes (w:rPrChange)', () => {
    describe('Basic formatting', () => {
      it('should parse bold property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:b/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.bold).toBe(true);
      });

      it('should parse italic property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:i/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.italic).toBe(true);
      });

      it('should parse underline property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:u w:val="double"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.underline).toBe('double');
      });

      it('should parse strikethrough property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:strike/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.strike).toBe(true);
      });

      it('should parse double strikethrough property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:dstrike/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.dstrike).toBe(true);
      });
    });

    describe('Font and color', () => {
      it('should parse font property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:rFonts w:ascii="Arial"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.font).toBe('Arial');
      });

      it('should parse size property change (half-points to points)', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:sz w:val="24"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.size).toBe(12); // 24 half-points = 12 points
      });

      it('should parse color property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:color w:val="FF0000"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.color).toBe('FF0000');
      });

      it('should ignore auto color value', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:color w:val="auto"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.color).toBeUndefined();
      });

      it('should parse highlight property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:highlight w:val="yellow"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.highlight).toBe('yellow');
      });
    });

    describe('Text effects', () => {
      it('should parse outline property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:outline/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.outline).toBe(true);
      });

      it('should parse shadow property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:shadow/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.shadow).toBe(true);
      });

      it('should parse emboss property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:emboss/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.emboss).toBe(true);
      });

      it('should parse imprint property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:imprint/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.imprint).toBe(true);
      });
    });

    describe('Caps and vertical alignment', () => {
      it('should parse smallCaps property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:smallCaps/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.smallCaps).toBe(true);
      });

      it('should parse allCaps property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:caps/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.allCaps).toBe(true);
      });

      it('should parse subscript property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:vertAlign w:val="subscript"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.subscript).toBe(true);
      });

      it('should parse superscript property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:vertAlign w:val="superscript"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.superscript).toBe(true);
      });
    });

    describe('Hidden and proofing', () => {
      it('should parse vanish property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:vanish/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.vanish).toBe(true);
      });

      it('should parse specVanish property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:specVanish/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.specVanish).toBe(true);
      });

      it('should parse noProof property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:noProof/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.noProof).toBe(true);
      });
    });

    describe('RTL and complex scripts', () => {
      it('should parse rtl property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:rtl/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.rtl).toBe(true);
      });

      it('should parse complex script bold property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:bCs/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.complexScriptBold).toBe(true);
      });

      it('should parse complex script italic property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:iCs/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.complexScriptItalic).toBe(true);
      });
    });

    describe('Spacing and positioning', () => {
      it('should parse characterSpacing property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:spacing w:val="40"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.characterSpacing).toBe(40);
      });

      it('should parse scaling property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:w w:val="150"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.scaling).toBe(150);
      });

      it('should parse position property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:position w:val="6"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.position).toBe(6);
      });

      it('should parse kerning property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:kern w:val="24"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.kerning).toBe(24);
      });
    });

    describe('Language and style', () => {
      it('should parse language property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:lang w:val="en-US"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.language).toBe('en-US');
      });

      it('should parse characterStyle property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:rStyle w:val="Emphasis"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.characterStyle).toBe('Emphasis');
      });
    });

    describe('Border and shading', () => {
      it('should parse text border property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:bdr w:val="single" w:sz="4" w:space="1" w:color="000000"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.border).toEqual({
          style: 'single',
          size: 4,
          space: 1,
          color: '000000',
        });
      });

      it('should parse character shading property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:shd w:val="clear" w:fill="FFFF00"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.shading).toEqual({
          val: 'clear',
          fill: 'FFFF00',
          color: undefined,
        });
      });
    });

    describe('East Asian layout', () => {
      it('should parse eastAsianLayout property change', () => {
        const xml = `<w:rPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:rPr><w:eastAsianLayout w:id="1" w:combine="true" w:combineBrackets="round" w:vert="true"/></w:rPr>
        </w:rPrChange>`;
        const props = parseRunPropertyChange(xml);
        expect(props.eastAsianLayout).toEqual({
          id: 1,
          combine: true,
          combineBrackets: 'round',
          vert: true,
          vertCompress: false,
        });
      });
    });
  });

  describe('Paragraph Property Changes (w:pPrChange)', () => {
    describe('Style and alignment', () => {
      it('should parse style property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.style).toBe('Heading1');
      });

      it('should parse alignment property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:jc w:val="center"/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.alignment).toBe('center');
      });
    });

    describe('Keep properties', () => {
      it('should parse keepNext property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:keepNext/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.keepNext).toBe(true);
      });

      it('should parse keepLines property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:keepLines/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.keepLines).toBe(true);
      });

      it('should parse pageBreakBefore property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:pageBreakBefore/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.pageBreakBefore).toBe(true);
      });

      it('should parse widowControl property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:widowControl/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.widowControl).toBe(true);
      });
    });

    describe('Spacing and hyphenation', () => {
      it('should parse suppressAutoHyphens property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:suppressAutoHyphens/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.suppressAutoHyphens).toBe(true);
      });

      it('should parse contextualSpacing property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:contextualSpacing/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.contextualSpacing).toBe(true);
      });

      it('should parse mirrorIndents property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:mirrorIndents/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.mirrorIndents).toBe(true);
      });
    });

    describe('Outline and direction', () => {
      it('should parse outlineLevel property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:outlineLvl w:val="2"/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.outlineLevel).toBe(2);
      });

      it('should parse bidi property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:bidi/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.bidi).toBe(true);
      });

      it('should parse textDirection property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:textDirection w:val="tbRl"/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.textDirection).toBe('tbRl');
      });
    });

    describe('Grid and spacing options', () => {
      it('should parse suppressLineNumbers property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:suppressLineNumbers/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.suppressLineNumbers).toBe(true);
      });

      it('should parse adjustRightInd property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:adjustRightInd/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.adjustRightInd).toBe(true);
      });

      it('should parse snapToGrid property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:snapToGrid/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.snapToGrid).toBe(true);
      });

      it('should parse wordWrap property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:wordWrap/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.wordWrap).toBe(true);
      });

      it('should parse autoSpaceDE property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:autoSpaceDE/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.autoSpaceDE).toBe(true);
      });

      it('should parse autoSpaceDN property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:autoSpaceDN/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.autoSpaceDN).toBe(true);
      });
    });

    describe('Borders', () => {
      it('should parse paragraph borders property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr>
            <w:pBdr>
              <w:top w:val="single" w:sz="4" w:space="1" w:color="000000"/>
              <w:bottom w:val="double" w:sz="8" w:space="2" w:color="FF0000"/>
            </w:pBdr>
          </w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.borders).toBeDefined();
        expect(props.borders?.top).toEqual({
          val: 'single',
          sz: 4,
          space: 1,
          color: '000000',
          themeColor: undefined,
        });
        expect(props.borders?.bottom).toEqual({
          val: 'double',
          sz: 8,
          space: 2,
          color: 'FF0000',
          themeColor: undefined,
        });
      });
    });

    describe('Shading', () => {
      it('should parse paragraph shading property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr><w:shd w:val="clear" w:fill="E6E6E6" w:color="auto"/></w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.shading).toEqual({
          val: 'clear',
          fill: 'E6E6E6',
          color: 'auto',
          themeFill: undefined,
          themeColor: undefined,
        });
      });
    });

    describe('Tabs', () => {
      it('should parse single tab stop property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr>
            <w:tabs>
              <w:tab w:val="left" w:pos="720"/>
            </w:tabs>
          </w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.tabs).toEqual([
          { val: 'left', pos: 720, leader: undefined },
        ]);
      });

      it('should parse multiple tab stops property change', () => {
        const xml = `<w:pPrChange w:id="1" w:author="Test" w:date="2024-01-01T00:00:00Z">
          <w:pPr>
            <w:tabs>
              <w:tab w:val="left" w:pos="720"/>
              <w:tab w:val="center" w:pos="4320"/>
              <w:tab w:val="right" w:pos="8640" w:leader="dot"/>
            </w:tabs>
          </w:pPr>
        </w:pPrChange>`;
        const props = parseParagraphPropertyChange(xml);
        expect(props.tabs).toHaveLength(3);
        expect(props.tabs?.[0]).toEqual({
          val: 'left',
          pos: 720,
          leader: undefined,
        });
        expect(props.tabs?.[1]).toEqual({
          val: 'center',
          pos: 4320,
          leader: undefined,
        });
        expect(props.tabs?.[2]).toEqual({
          val: 'right',
          pos: 8640,
          leader: 'dot',
        });
      });
    });
  });
});
