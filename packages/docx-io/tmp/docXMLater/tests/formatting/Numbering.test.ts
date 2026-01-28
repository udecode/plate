/**
 * Tests for Numbering components (NumberingLevel, AbstractNumbering, NumberingInstance)
 */

import { NumberingLevel, NumberFormat } from '../../src/formatting/NumberingLevel';
import { AbstractNumbering } from '../../src/formatting/AbstractNumbering';
import { NumberingInstance } from '../../src/formatting/NumberingInstance';
import { NumberingManager } from '../../src/formatting/NumberingManager';
import { XMLElement } from '../../src/xml/XMLBuilder';

/**
 * Helper to filter and safely access XMLElement children
 */
function filterXMLElements(children?: (XMLElement | string)[]): XMLElement[] {
  return (children || []).filter((c): c is XMLElement => typeof c !== 'string');
}

describe('NumberingLevel', () => {
  describe('Basic functionality', () => {
    it('should create a numbering level with required properties', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
      });

      const props = level.getProperties();
      expect(props.level).toBe(0);
      expect(props.format).toBe('decimal');
      expect(props.text).toBe('%1.');
    });

    it('should use default values for optional properties', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'bullet',
        text: '•',
      });

      const props = level.getProperties();
      expect(props.alignment).toBe('left');
      expect(props.start).toBe(1);
      expect(props.leftIndent).toBe(720); // 720 + (0 * 360)
      expect(props.hangingIndent).toBe(360);
      expect(props.font).toBe('Calibri'); // Changed from Symbol to Calibri
      expect(props.fontSize).toBe(22);
      expect(props.isLegalNumberingStyle).toBe(false);
      expect(props.suffix).toBe('tab');
    });

    it('should calculate default indentation based on level', () => {
      const level = new NumberingLevel({
        level: 2,
        format: 'decimal',
        text: '%3.',
      });

      const props = level.getProperties();
      expect(props.leftIndent).toBe(1440); // 720 + (2 * 360)
    });

    it('should use custom properties when provided', () => {
      const level = new NumberingLevel({
        level: 1,
        format: 'upperRoman',
        text: '%2)',
        alignment: 'right',
        start: 5,
        leftIndent: 1440,
        hangingIndent: 720,
        font: 'Times New Roman',
        fontSize: 24,
        isLegalNumberingStyle: true,
        suffix: 'space',
      });

      const props = level.getProperties();
      expect(props.alignment).toBe('right');
      expect(props.start).toBe(5);
      expect(props.leftIndent).toBe(1440);
      expect(props.hangingIndent).toBe(720);
      expect(props.font).toBe('Times New Roman');
      expect(props.fontSize).toBe(24);
      expect(props.isLegalNumberingStyle).toBe(true);
      expect(props.suffix).toBe('space');
    });

    it('should support italic property', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
        italic: true,
      });
      expect(level.getItalic()).toBe(true);
    });

    it('should support underline property', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
        underline: 'single',
      });
      expect(level.getUnderline()).toBe('single');
    });

    it('should default italic to false', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
      });
      expect(level.getItalic()).toBe(false);
    });

    it('should default underline to undefined', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
      });
      expect(level.getUnderline()).toBeUndefined();
    });
  });

  describe('Italic and underline methods', () => {
    it('should set italic with setItalic()', () => {
      const level = NumberingLevel.createDecimalLevel(0);
      level.setItalic(true);
      expect(level.getItalic()).toBe(true);

      level.setItalic(false);
      expect(level.getItalic()).toBe(false);
    });

    it('should set underline with setUnderline()', () => {
      const level = NumberingLevel.createDecimalLevel(0);
      level.setUnderline('double');
      expect(level.getUnderline()).toBe('double');
    });

    it('should clear underline with clearUnderline()', () => {
      const level = NumberingLevel.createDecimalLevel(0);
      level.setUnderline('wave');
      expect(level.getUnderline()).toBe('wave');

      level.clearUnderline();
      expect(level.getUnderline()).toBeUndefined();
    });

    it('should support method chaining', () => {
      const level = NumberingLevel.createDecimalLevel(0);
      const result = level
        .setItalic(true)
        .setUnderline('single')
        .setBold(true);

      expect(result).toBe(level);
      expect(level.getItalic()).toBe(true);
      expect(level.getUnderline()).toBe('single');
      expect(level.getProperties().bold).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should throw error for invalid level', () => {
      expect(() => new NumberingLevel({
        level: -1,
        format: 'decimal',
        text: '%1.',
      })).toThrow('Level must be between 0 and 8');

      expect(() => new NumberingLevel({
        level: 9,
        format: 'decimal',
        text: '%1.',
      })).toThrow('Level must be between 0 and 8');
    });

    it('should allow negative left indent (outdent into margin)', () => {
      // Negative left indent is valid per ECMA-376 for outdents
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
        leftIndent: -1472,  // Outdent into margin
      });
      expect(level.getProperties().leftIndent).toBe(-1472);
    });

    it('should throw error for negative hanging indent', () => {
      // Hanging indent should still be non-negative
      expect(() => new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
        hangingIndent: -100,
      })).toThrow('Hanging indent must be non-negative');
    });

    it('should throw error for negative start value', () => {
      expect(() => new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
        start: -1,
      })).toThrow('Start value must be non-negative');
    });
  });

  describe('Setters', () => {
    it('should set left indent', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
      });

      level.setLeftIndent(1080);
      expect(level.getProperties().leftIndent).toBe(1080);
    });

    it('should set hanging indent', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
      });

      level.setHangingIndent(540);
      expect(level.getProperties().hangingIndent).toBe(540);
    });

    it('should set font', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'bullet',
        text: '•',
      });

      level.setFont('Wingdings');
      expect(level.getProperties().font).toBe('Wingdings');
    });

    it('should set alignment', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
      });

      level.setAlignment('center');
      expect(level.getProperties().alignment).toBe('center');
    });

    it('should allow negative left indent in setter (outdent)', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
      });

      level.setLeftIndent(-1472);  // Outdent into margin
      expect(level.getProperties().leftIndent).toBe(-1472);
    });

    it('should throw error for negative hanging indent in setter', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
      });

      expect(() => level.setHangingIndent(-100)).toThrow('Hanging indent must be non-negative');
    });
  });

  describe('Method chaining', () => {
    it('should support method chaining', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
      });

      const result = level
        .setLeftIndent(1440)
        .setHangingIndent(720)
        .setFont('Arial')
        .setAlignment('right');

      expect(result).toBe(level);
      const props = level.getProperties();
      expect(props.leftIndent).toBe(1440);
      expect(props.hangingIndent).toBe(720);
      expect(props.font).toBe('Arial');
      expect(props.alignment).toBe('right');
    });
  });

  describe('XML generation', () => {
    it('should generate basic level XML', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
      });

      const xml = level.toXML();
      expect(xml.name).toBe('w:lvl');
      expect(xml.attributes?.['w:ilvl']).toBe('0');

      // Check for required elements
      const xmlElements = filterXMLElements(xml.children);
      const start = xmlElements.find(c => c.name === 'w:start');
      expect(start?.attributes?.['w:val']).toBe('1');

      const numFmt = xmlElements.find(c => c.name === 'w:numFmt');
      expect(numFmt?.attributes?.['w:val']).toBe('decimal');

      const lvlText = xmlElements.find(c => c.name === 'w:lvlText');
      expect(lvlText?.attributes?.['w:val']).toBe('%1.');

      const lvlJc = xmlElements.find(c => c.name === 'w:lvlJc');
      expect(lvlJc?.attributes?.['w:val']).toBe('left');
    });

    it('should generate XML with paragraph properties', () => {
      const level = new NumberingLevel({
        level: 1,
        format: 'decimal',
        text: '%2.',
        leftIndent: 1440,
        hangingIndent: 720,
      });

      const xml = level.toXML();
      const pPr = filterXMLElements(xml.children).find(c => c.name === 'w:pPr');
      expect(pPr).toBeDefined();

      const ind = filterXMLElements(pPr?.children).find(c => c.name === 'w:ind');
      expect(ind?.attributes?.['w:left']).toBe('1440');
      expect(ind?.attributes?.['w:hanging']).toBe('720');
    });

    it('should generate XML with run properties', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'bullet',
        text: '•',
        font: 'Symbol',
        fontSize: 24,
      });

      const xml = level.toXML();
      const rPr = filterXMLElements(xml.children).find(c => c.name === 'w:rPr');
      expect(rPr).toBeDefined();

      const rFonts = filterXMLElements(rPr?.children).find(c => c.name === 'w:rFonts');
      expect(rFonts?.attributes?.['w:ascii']).toBe('Symbol');
      expect(rFonts?.attributes?.['w:hAnsi']).toBe('Symbol');

      const sz = filterXMLElements(rPr?.children).find(c => c.name === 'w:sz');
      expect(sz?.attributes?.['w:val']).toBe('24');
    });

    it('should generate XML with suffix', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
        suffix: 'space',
      });

      const xml = level.toXML();
      const suff = filterXMLElements(xml.children).find(c => c.name === 'w:suff');
      expect(suff?.attributes?.['w:val']).toBe('space');
    });

    it('should generate XML with legal numbering style', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
        isLegalNumberingStyle: true,
      });

      const xml = level.toXML();
      const isLgl = filterXMLElements(xml.children).find(c => c.name === 'w:isLgl');
      expect(isLgl).toBeDefined();
    });

    it('should generate XML with negative left indent (outdent)', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'bullet',
        text: '•',
        leftIndent: -1472,  // Outdent into margin
        hangingIndent: 360,
      });

      const xml = level.toXML();
      const pPr = filterXMLElements(xml.children).find(c => c.name === 'w:pPr');
      expect(pPr).toBeDefined();

      const ind = filterXMLElements(pPr?.children).find(c => c.name === 'w:ind');
      expect(ind?.attributes?.['w:left']).toBe('-1472');
      expect(ind?.attributes?.['w:hanging']).toBe('360');
    });

    it('should generate XML with italic', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
        italic: true,
      });

      const xml = level.toXML();
      const rPr = filterXMLElements(xml.children).find(c => c.name === 'w:rPr');
      expect(rPr).toBeDefined();

      const i = filterXMLElements(rPr?.children).find(c => c.name === 'w:i');
      expect(i).toBeDefined();

      const iCs = filterXMLElements(rPr?.children).find(c => c.name === 'w:iCs');
      expect(iCs).toBeDefined();
    });

    it('should not generate italic XML when italic is false', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
        italic: false,
      });

      const xml = level.toXML();
      const rPr = filterXMLElements(xml.children).find(c => c.name === 'w:rPr');
      expect(rPr).toBeDefined();

      const i = filterXMLElements(rPr?.children).find(c => c.name === 'w:i');
      expect(i).toBeUndefined();
    });

    it('should generate XML with underline', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
        underline: 'single',
      });

      const xml = level.toXML();
      const rPr = filterXMLElements(xml.children).find(c => c.name === 'w:rPr');
      expect(rPr).toBeDefined();

      const u = filterXMLElements(rPr?.children).find(c => c.name === 'w:u');
      expect(u).toBeDefined();
      expect(u?.attributes?.['w:val']).toBe('single');
    });

    it('should generate XML with double underline', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
        underline: 'double',
      });

      const xml = level.toXML();
      const rPr = filterXMLElements(xml.children).find(c => c.name === 'w:rPr');
      const u = filterXMLElements(rPr?.children).find(c => c.name === 'w:u');
      expect(u?.attributes?.['w:val']).toBe('double');
    });

    it('should generate XML with combined italic and underline', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'lowerRoman',
        text: '%1.',
        italic: true,
        underline: 'wave',
      });

      const xml = level.toXML();
      const rPr = filterXMLElements(xml.children).find(c => c.name === 'w:rPr');
      expect(rPr).toBeDefined();

      const i = filterXMLElements(rPr?.children).find(c => c.name === 'w:i');
      expect(i).toBeDefined();

      const u = filterXMLElements(rPr?.children).find(c => c.name === 'w:u');
      expect(u?.attributes?.['w:val']).toBe('wave');
    });
  });

  describe('XML parsing', () => {
    it('should parse XML with negative left indent (outdent)', () => {
      const xml = `<w:lvl w:ilvl="0">
        <w:start w:val="1"/>
        <w:numFmt w:val="bullet"/>
        <w:lvlText w:val="•"/>
        <w:lvlJc w:val="left"/>
        <w:pPr>
          <w:ind w:left="-1472" w:hanging="360"/>
        </w:pPr>
      </w:lvl>`;

      const level = NumberingLevel.fromXML(xml);
      expect(level.getProperties().leftIndent).toBe(-1472);
      expect(level.getProperties().hangingIndent).toBe(360);
    });

    it('should parse italic from XML', () => {
      const xml = `<w:lvl w:ilvl="0">
        <w:start w:val="1"/>
        <w:numFmt w:val="decimal"/>
        <w:lvlText w:val="%1."/>
        <w:lvlJc w:val="left"/>
        <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
        <w:rPr><w:i/><w:iCs/></w:rPr>
      </w:lvl>`;

      const level = NumberingLevel.fromXML(xml);
      expect(level.getItalic()).toBe(true);
    });

    it('should parse self-closing italic tag', () => {
      const xml = `<w:lvl w:ilvl="0">
        <w:start w:val="1"/>
        <w:numFmt w:val="decimal"/>
        <w:lvlText w:val="%1."/>
        <w:lvlJc w:val="left"/>
        <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
        <w:rPr><w:i /></w:rPr>
      </w:lvl>`;

      const level = NumberingLevel.fromXML(xml);
      expect(level.getItalic()).toBe(true);
    });

    it('should default to false when no italic in XML', () => {
      const xml = `<w:lvl w:ilvl="0">
        <w:start w:val="1"/>
        <w:numFmt w:val="decimal"/>
        <w:lvlText w:val="%1."/>
        <w:lvlJc w:val="left"/>
        <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
        <w:rPr></w:rPr>
      </w:lvl>`;

      const level = NumberingLevel.fromXML(xml);
      expect(level.getItalic()).toBe(false);
    });

    it('should parse underline from XML', () => {
      const xml = `<w:lvl w:ilvl="0">
        <w:start w:val="1"/>
        <w:numFmt w:val="decimal"/>
        <w:lvlText w:val="%1."/>
        <w:lvlJc w:val="left"/>
        <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
        <w:rPr><w:u w:val="single"/></w:rPr>
      </w:lvl>`;

      const level = NumberingLevel.fromXML(xml);
      expect(level.getUnderline()).toBe('single');
    });

    it('should parse double underline from XML', () => {
      const xml = `<w:lvl w:ilvl="0">
        <w:start w:val="1"/>
        <w:numFmt w:val="decimal"/>
        <w:lvlText w:val="%1."/>
        <w:lvlJc w:val="left"/>
        <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
        <w:rPr><w:u w:val="double"/></w:rPr>
      </w:lvl>`;

      const level = NumberingLevel.fromXML(xml);
      expect(level.getUnderline()).toBe('double');
    });

    it('should parse combined italic and underline from XML', () => {
      const xml = `<w:lvl w:ilvl="0">
        <w:start w:val="1"/>
        <w:numFmt w:val="lowerRoman"/>
        <w:lvlText w:val="%1."/>
        <w:lvlJc w:val="left"/>
        <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
        <w:rPr><w:i/><w:u w:val="wave"/></w:rPr>
      </w:lvl>`;

      const level = NumberingLevel.fromXML(xml);
      expect(level.getItalic()).toBe(true);
      expect(level.getUnderline()).toBe('wave');
    });

    it('should default to undefined when no underline in XML', () => {
      const xml = `<w:lvl w:ilvl="0">
        <w:start w:val="1"/>
        <w:numFmt w:val="decimal"/>
        <w:lvlText w:val="%1."/>
        <w:lvlJc w:val="left"/>
        <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
        <w:rPr></w:rPr>
      </w:lvl>`;

      const level = NumberingLevel.fromXML(xml);
      expect(level.getUnderline()).toBeUndefined();
    });
  });

  describe('Static factory methods', () => {
    it('should create bullet level with custom bullet', () => {
      // When providing custom bullet, font defaults to Word-native for that level
      const level = NumberingLevel.createBulletLevel(0, '◦');
      const props = level.getProperties();
      expect(props.format).toBe('bullet');
      expect(props.text).toBe('◦');
      expect(props.font).toBe('Symbol'); // Word-native font for level 0
    });

    it('should use Word-native defaults when no parameters provided', () => {
      // Level 0: Filled bullet (Symbol font, U+F0B7)
      const level0 = NumberingLevel.createBulletLevel(0);
      expect(level0.getProperties().text).toBe('\uF0B7');
      expect(level0.getProperties().font).toBe('Symbol');

      // Level 1: Open circle (Courier New, U+006F)
      const level1 = NumberingLevel.createBulletLevel(1);
      expect(level1.getProperties().text).toBe('\u006F');
      expect(level1.getProperties().font).toBe('Courier New');

      // Level 2: Filled square (Wingdings, U+F0A7)
      const level2 = NumberingLevel.createBulletLevel(2);
      expect(level2.getProperties().text).toBe('\uF0A7');
      expect(level2.getProperties().font).toBe('Wingdings');
    });

    it('should create decimal level', () => {
      const level = NumberingLevel.createDecimalLevel(0);
      const props = level.getProperties();
      expect(props.format).toBe('decimal');
      expect(props.text).toBe('%1.');
    });

    it('should create decimal level with custom template', () => {
      const level = NumberingLevel.createDecimalLevel(1, '(%2)');
      expect(level.getProperties().text).toBe('(%2)');
    });

    it('should create lower roman level', () => {
      const level = NumberingLevel.createLowerRomanLevel(0);
      const props = level.getProperties();
      expect(props.format).toBe('lowerRoman');
      expect(props.text).toBe('%1.');
    });

    it('should create upper roman level', () => {
      const level = NumberingLevel.createUpperRomanLevel(0);
      const props = level.getProperties();
      expect(props.format).toBe('upperRoman');
      expect(props.text).toBe('%1.');
    });

    it('should create lower letter level', () => {
      const level = NumberingLevel.createLowerLetterLevel(0);
      const props = level.getProperties();
      expect(props.format).toBe('lowerLetter');
      expect(props.text).toBe('%1.');
    });

    it('should create upper letter level', () => {
      const level = NumberingLevel.createUpperLetterLevel(0);
      const props = level.getProperties();
      expect(props.format).toBe('upperLetter');
      expect(props.text).toBe('%1.');
    });

    it('should create level with custom properties', () => {
      const level = NumberingLevel.create({
        level: 2,
        format: 'decimal',
        text: '%3:',
        alignment: 'center',
      });

      const props = level.getProperties();
      expect(props.level).toBe(2);
      expect(props.format).toBe('decimal');
      expect(props.text).toBe('%3:');
      expect(props.alignment).toBe('center');
    });
  });

  describe('All number formats', () => {
    it('should support all number formats', () => {
      const formats: NumberFormat[] = [
        'bullet', 'decimal', 'lowerRoman', 'upperRoman',
        'lowerLetter', 'upperLetter', 'ordinal', 'cardinalText',
        'ordinalText', 'hex', 'chicago', 'decimal zero'
      ];

      formats.forEach(format => {
        expect(() => new NumberingLevel({
          level: 0,
          format,
          text: format === 'bullet' ? '•' : '%1.',
        })).not.toThrow();
      });
    });
  });
});

describe('AbstractNumbering', () => {
  describe('Basic functionality', () => {
    it('should create abstract numbering with ID', () => {
      const abstractNum = new AbstractNumbering(1);
      expect(abstractNum.getId()).toBe(1);
    });

    it('should add single level', () => {
      const abstractNum = new AbstractNumbering(1);
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
      });

      abstractNum.addLevel(level);
      expect(abstractNum.getLevel(0)).toBe(level);
    });

    it('should add multiple levels', () => {
      const abstractNum = new AbstractNumbering(1);
      const levels = [
        NumberingLevel.createDecimalLevel(0),
        NumberingLevel.createLowerLetterLevel(1),
        NumberingLevel.createLowerRomanLevel(2),
      ];

      abstractNum.addLevels(levels);
      expect(abstractNum.getLevel(0)?.getFormat()).toBe('decimal');
      expect(abstractNum.getLevel(1)?.getFormat()).toBe('lowerLetter');
      expect(abstractNum.getLevel(2)?.getFormat()).toBe('lowerRoman');
    });

    it('should get all levels', () => {
      const abstractNum = new AbstractNumbering(1);
      abstractNum.addLevels([
        NumberingLevel.createDecimalLevel(0),
        NumberingLevel.createDecimalLevel(1),
      ]);

      const levels = abstractNum.getLevels();
      expect(levels).toHaveLength(2);
    });

    it('should return undefined for invalid level index', () => {
      const abstractNum = new AbstractNumbering(1);
      abstractNum.addLevel(NumberingLevel.createDecimalLevel(0));

      expect(abstractNum.getLevel(1)).toBeUndefined();
      expect(abstractNum.getLevel(-1)).toBeUndefined();
    });
  });

  describe('Multi-level list ID', () => {
    it('should set and get multi-level list ID', () => {
      const abstractNum = new AbstractNumbering(1);
      abstractNum.setMultiLevelType('multilevel');

      expect(abstractNum.getMultiLevelType()).toBe('multilevel');
    });
  });

  describe('XML generation', () => {
    it('should generate abstract numbering XML', () => {
      const abstractNum = new AbstractNumbering(5);
      abstractNum.addLevels([
        NumberingLevel.createDecimalLevel(0),
        NumberingLevel.createLowerLetterLevel(1),
      ]);

      const xml = abstractNum.toXML();
      expect(xml.name).toBe('w:abstractNum');
      expect(xml.attributes?.['w:abstractNumId']).toBe('5');

      // Check for levels
      const levels = filterXMLElements(xml.children).filter(c => c.name === 'w:lvl');
      expect(levels).toHaveLength(2);
    });

    it('should include multi-level type in XML', () => {
      const abstractNum = new AbstractNumbering(1);
      abstractNum.setMultiLevelType('hybridMultilevel');

      const xml = abstractNum.toXML();
      const multiLevelType = filterXMLElements(xml.children).find(c => c.name === 'w:multiLevelType');
      expect(multiLevelType?.attributes?.['w:val']).toBe('hybridMultilevel');
    });
  });

  describe('Static factory methods', () => {
    it('should create bullet list', () => {
      const abstractNum = AbstractNumbering.createBulletList(1);
      expect(abstractNum.getId()).toBe(1);

      // Should have 9 levels, all bullets
      const levels = abstractNum.getLevels();
      expect(levels).toHaveLength(9);
      levels.forEach(level => {
        expect(level.getFormat()).toBe('bullet');
      });
    });

    it('should create numbered list', () => {
      const abstractNum = AbstractNumbering.createNumberedList(2);
      expect(abstractNum.getId()).toBe(2);

      const levels = abstractNum.getLevels();
      expect(levels).toHaveLength(9);

      // Check the pattern: decimal, lowerLetter, lowerRoman, upperLetter, upperRoman, repeating
      expect(levels[0]!.getFormat()).toBe('decimal');
      expect(levels[1]!.getFormat()).toBe('lowerLetter');
      expect(levels[2]!.getFormat()).toBe('lowerRoman');
      expect(levels[3]!.getFormat()).toBe('upperLetter');
      expect(levels[4]!.getFormat()).toBe('upperRoman');
      expect(levels[5]!.getFormat()).toBe('decimal'); // Cycle repeats
    });

    it('should create outline list', () => {
      const abstractNum = AbstractNumbering.createOutlineList(3);
      expect(abstractNum.getId()).toBe(3);

      const levels = abstractNum.getLevels();
      expect(levels).toHaveLength(9);

      // Check the outline pattern
      expect(levels[0]!.getFormat()).toBe('upperRoman');
      expect(levels[1]!.getFormat()).toBe('upperLetter');
      expect(levels[2]!.getFormat()).toBe('decimal');
    });
  });
});

describe('NumberingInstance', () => {
  describe('Basic functionality', () => {
    it('should create numbering instance', () => {
      const instance = new NumberingInstance(1, 100);
      expect(instance.getId()).toBe(1);
      expect(instance.getAbstractNumId()).toBe(100);
    });

    it('should set level overrides', () => {
      const instance = new NumberingInstance(1, 100);
      instance.setLevelOverride(0, 5);

      const overrides = instance.getLevelOverrides();
      expect(overrides.get(0)).toBe(5);
    });

    it('should support multiple level overrides', () => {
      const instance = new NumberingInstance(1, 100);
      instance.setLevelOverride(0, 10);
      instance.setLevelOverride(1, 20);
      instance.setLevelOverride(2, 30);

      const overrides = instance.getLevelOverrides();
      expect(overrides.size).toBe(3);
      expect(overrides.get(0)).toBe(10);
      expect(overrides.get(1)).toBe(20);
      expect(overrides.get(2)).toBe(30);
    });
  });

  describe('XML generation', () => {
    it('should generate basic numbering instance XML', () => {
      const instance = new NumberingInstance(5, 200);
      const xml = instance.toXML();

      expect(xml.name).toBe('w:num');
      expect(xml.attributes?.['w:numId']).toBe('5');

      const abstractNumId = filterXMLElements(xml.children).find(c => c.name === 'w:abstractNumId');
      expect(abstractNumId?.attributes?.['w:val']).toBe('200');
    });

    it('should generate XML with level overrides', () => {
      const instance = new NumberingInstance(1, 100);
      instance.setLevelOverride(0, 5);
      instance.setLevelOverride(2, 10);

      const xml = instance.toXML();

      const lvlOverrides = filterXMLElements(xml.children).filter(c => c.name === 'w:lvlOverride');
      expect(lvlOverrides).toHaveLength(2);

      const level0Override = lvlOverrides.find(o => o.attributes?.['w:ilvl'] === '0');
      const startOverride0 = filterXMLElements(level0Override?.children).find(c => c.name === 'w:startOverride');
      expect(startOverride0?.attributes?.['w:val']).toBe('5');

      const level2Override = lvlOverrides.find(o => o.attributes?.['w:ilvl'] === '2');
      const startOverride2 = filterXMLElements(level2Override?.children).find(c => c.name === 'w:startOverride');
      expect(startOverride2?.attributes?.['w:val']).toBe('10');
    });
  });

  describe('Static factory method', () => {
    it('should create instance with static method', () => {
      const instance = NumberingInstance.create(10, 500);
      expect(instance).toBeInstanceOf(NumberingInstance);
      expect(instance.getId()).toBe(10);
      expect(instance.getAbstractNumId()).toBe(500);
    });
  });
});

describe('NumberingManager', () => {
  describe('Basic functionality', () => {
    it('should create numbering manager', () => {
      const manager = new NumberingManager();
      expect(manager).toBeInstanceOf(NumberingManager);
    });

    it('should add abstract numbering', () => {
      const manager = new NumberingManager();
      const abstractNum = AbstractNumbering.createBulletList(1);

      manager.addAbstractNumbering(abstractNum);
      expect(manager.getAbstractNumbering(1)).toBe(abstractNum);
    });

    it('should add numbering instance', () => {
      const manager = new NumberingManager();
      const abstractNum = AbstractNumbering.createBulletList(1);
      const instance = new NumberingInstance(10, 1);

      manager.addAbstractNumbering(abstractNum);
      manager.addNumberingInstance(instance);

      expect(manager.getNumberingInstance(10)).toBe(instance);
    });

    it('should get all abstract numberings', () => {
      const manager = new NumberingManager();
      manager.addAbstractNumbering(AbstractNumbering.createBulletList(1));
      manager.addAbstractNumbering(AbstractNumbering.createNumberedList(2));

      const abstracts = manager.getAllAbstractNumberings();
      expect(abstracts).toHaveLength(2);
    });

    it('should get all numbering instances', () => {
      const manager = new NumberingManager();
      // Add abstract numberings first
      manager.addAbstractNumbering(AbstractNumbering.createBulletList(100));
      manager.addAbstractNumbering(AbstractNumbering.createNumberedList(200));
      // Then add instances that reference them
      manager.addNumberingInstance(new NumberingInstance(1, 100));
      manager.addNumberingInstance(new NumberingInstance(2, 200));

      const instances = manager.getAllNumberingInstances();
      expect(instances).toHaveLength(2);
    });
  });

  describe('Create and register methods', () => {
    it('should create and register bullet list', () => {
      const manager = new NumberingManager();
      const numId = manager.createBulletList();

      expect(numId).toBeDefined();
      const instance = manager.getNumberingInstance(numId);
      expect(instance).toBeDefined();

      const abstractId = instance?.getAbstractNumId();
      // Use explicit !== undefined check since abstractId could be 0 (falsy but valid)
      const abstractNum = abstractId !== undefined ? manager.getAbstractNumbering(abstractId) : undefined;
      expect(abstractNum).toBeDefined();
    });

    it('should create and register numbered list', () => {
      const manager = new NumberingManager();
      const numId = manager.createNumberedList();

      expect(numId).toBeDefined();
      const instance = manager.getNumberingInstance(numId);
      expect(instance).toBeDefined();
    });

    it('should create and register outline list', () => {
      const manager = new NumberingManager();
      const numId = manager.createOutlineList();

      expect(numId).toBeDefined();
      const instance = manager.getNumberingInstance(numId);
      expect(instance).toBeDefined();
    });

    it('should increment IDs for multiple lists', () => {
      const manager = new NumberingManager();
      const id1 = manager.createBulletList();
      const id2 = manager.createNumberedList();
      const id3 = manager.createOutlineList();

      expect(id2).toBeGreaterThan(id1);
      expect(id3).toBeGreaterThan(id2);
    });
  });

  describe('XML generation', () => {
    it('should generate numbering XML document', () => {
      const manager = new NumberingManager();
      manager.createBulletList();
      manager.createNumberedList();

      const xml = manager.toXML();
      expect(xml.name).toBe('w:numbering');
      expect(xml.attributes?.['xmlns:w']).toBeDefined();

      // Should have abstract numberings and instances
      const abstractNums = filterXMLElements(xml.children).filter(c => c.name === 'w:abstractNum');
      expect(abstractNums.length).toBeGreaterThanOrEqual(2);

      const nums = filterXMLElements(xml.children).filter(c => c.name === 'w:num');
      expect(nums.length).toBeGreaterThanOrEqual(2);
    });

    it('should include namespaces in root element', () => {
      const manager = new NumberingManager();
      const xml = manager.toXML();

      expect(xml.attributes?.['xmlns:w']).toBe('http://schemas.openxmlformats.org/wordprocessingml/2006/main');
      expect(xml.attributes?.['xmlns:r']).toBe('http://schemas.openxmlformats.org/officeDocument/2006/relationships');
    });
  });

  describe('Static factory method', () => {
    it('should create manager with static method', () => {
      const manager = NumberingManager.create();
      expect(manager).toBeInstanceOf(NumberingManager);
    });
  });
});

describe('Numbering Parsing Fixes', () => {
  describe('AbstractNumbering.fromXML multiLevelType parsing', () => {
    it('should correctly parse singleLevel multiLevelType', () => {
      const xml = `
        <w:abstractNum w:abstractNumId="1">
          <w:multiLevelType w:val="singleLevel"/>
          <w:lvl w:ilvl="0">
            <w:numFmt w:val="decimal"/>
            <w:lvlText w:val="%1."/>
          </w:lvl>
        </w:abstractNum>
      `;
      const abstractNum = AbstractNumbering.fromXML(xml);
      // Generate XML and verify multiLevelType is preserved
      const generatedXml = abstractNum.toXML();
      // The multiLevelType child should contain "singleLevel"
      const children = generatedXml.children || [];
      const multiLevelTypeChild = children.find(
        (c) => typeof c !== 'string' && c.name === 'w:multiLevelType'
      );
      expect(multiLevelTypeChild).toBeDefined();
      expect(
        typeof multiLevelTypeChild !== 'string' && multiLevelTypeChild?.attributes?.['w:val']
      ).toBe('singleLevel');
    });

    it('should correctly parse multilevel multiLevelType', () => {
      const xml = `
        <w:abstractNum w:abstractNumId="2">
          <w:multiLevelType w:val="multilevel"/>
          <w:lvl w:ilvl="0">
            <w:numFmt w:val="decimal"/>
            <w:lvlText w:val="%1."/>
          </w:lvl>
        </w:abstractNum>
      `;
      const abstractNum = AbstractNumbering.fromXML(xml);
      const generatedXml = abstractNum.toXML();
      const children = generatedXml.children || [];
      const multiLevelTypeChild = children.find(
        (c) => typeof c !== 'string' && c.name === 'w:multiLevelType'
      );
      expect(multiLevelTypeChild).toBeDefined();
      expect(
        typeof multiLevelTypeChild !== 'string' && multiLevelTypeChild?.attributes?.['w:val']
      ).toBe('multilevel');
    });

    it('should correctly parse hybridMultilevel multiLevelType', () => {
      const xml = `
        <w:abstractNum w:abstractNumId="3">
          <w:multiLevelType w:val="hybridMultilevel"/>
          <w:lvl w:ilvl="0">
            <w:numFmt w:val="lowerLetter"/>
            <w:lvlText w:val="%1."/>
          </w:lvl>
        </w:abstractNum>
      `;
      const abstractNum = AbstractNumbering.fromXML(xml);
      const generatedXml = abstractNum.toXML();
      const children = generatedXml.children || [];
      const multiLevelTypeChild = children.find(
        (c) => typeof c !== 'string' && c.name === 'w:multiLevelType'
      );
      expect(multiLevelTypeChild).toBeDefined();
      expect(
        typeof multiLevelTypeChild !== 'string' && multiLevelTypeChild?.attributes?.['w:val']
      ).toBe('hybridMultilevel');
    });
  });

  describe('NumberingLevel.fromXML bold property parsing', () => {
    it('should always set bold=false regardless of source XML w:b element', () => {
      // Bullet/number symbols should never be bold - source XML is ignored
      const xml = `
        <w:lvl w:ilvl="0">
          <w:numFmt w:val="bullet"/>
          <w:lvlText w:val="•"/>
          <w:rPr>
            <w:b/>
          </w:rPr>
        </w:lvl>
      `;
      const level = NumberingLevel.fromXML(xml);
      expect(level.getProperties().bold).toBe(false);
    });

    it('should return bold=false when w:b w:val="0"', () => {
      const xml = `
        <w:lvl w:ilvl="0">
          <w:numFmt w:val="lowerLetter"/>
          <w:lvlText w:val="%1."/>
          <w:rPr>
            <w:b w:val="0"/>
          </w:rPr>
        </w:lvl>
      `;
      const level = NumberingLevel.fromXML(xml);
      expect(level.getProperties().bold).toBe(false);
    });

    it('should default bold to false when no w:b element present', () => {
      const xml = `
        <w:lvl w:ilvl="0">
          <w:numFmt w:val="decimal"/>
          <w:lvlText w:val="%1."/>
          <w:rPr>
            <w:rFonts w:ascii="Arial"/>
          </w:rPr>
        </w:lvl>
      `;
      const level = NumberingLevel.fromXML(xml);
      expect(level.getProperties().bold).toBe(false);
    });

    it('should parse color from w:color element', () => {
      const xml = `
        <w:lvl w:ilvl="0">
          <w:numFmt w:val="decimal"/>
          <w:lvlText w:val="%1."/>
          <w:rPr>
            <w:color w:val="FF0000"/>
          </w:rPr>
        </w:lvl>
      `;
      const level = NumberingLevel.fromXML(xml);
      expect(level.getProperties().color).toBe('FF0000');
    });
  });

  describe('NumberingLevel.setFormat', () => {
    it('should change format from lowerLetter to decimal', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'lowerLetter',
        text: '%1.',
      });

      expect(level.getFormat()).toBe('lowerLetter');

      level.setFormat('decimal');

      expect(level.getFormat()).toBe('decimal');
    });

    it('should change format from bullet to decimal', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'bullet',
        text: '•',
      });

      level.setFormat('decimal');

      expect(level.getFormat()).toBe('decimal');
    });

    it('should be chainable', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
      });

      const result = level.setFormat('lowerRoman').setText('%1)');

      expect(result).toBe(level);
      expect(level.getFormat()).toBe('lowerRoman');
      expect(level.getProperties().text).toBe('%1)');
    });
  });
});