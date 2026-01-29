/**
 * Tests for NumberingLevel restart functionality (w:lvlRestart)
 * Per ECMA-376 Part 1 Section 17.9.11
 */

import { NumberingLevel } from '../../src/formatting/NumberingLevel';
import { AbstractNumbering } from '../../src/formatting/AbstractNumbering';
import { NumberingInstance } from '../../src/formatting/NumberingInstance';
import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import path from 'path';
import fs from 'fs';

describe('NumberingLevel Restart (w:lvlRestart)', () => {
  const testOutputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('Setting lvlRestart', () => {
    it('should set lvlRestart via constructor', () => {
      const level = new NumberingLevel({
        level: 1,
        format: 'decimal',
        text: '%2.',
        lvlRestart: 0,
      });

      expect(level.getLvlRestart()).toBe(0);
    });

    it('should have undefined lvlRestart by default', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
      });

      expect(level.getLvlRestart()).toBeUndefined();
    });

    it('should set lvlRestart via setter method', () => {
      const level = new NumberingLevel({
        level: 1,
        format: 'decimal',
        text: '%2.',
      });

      level.setLvlRestart(0);
      expect(level.getLvlRestart()).toBe(0);
    });

    it('should support method chaining', () => {
      const level = new NumberingLevel({
        level: 1,
        format: 'decimal',
        text: '%2.',
      });

      const result = level.setLvlRestart(0).setBold(true).setColor('FF0000');

      expect(result).toBe(level);
      expect(level.getLvlRestart()).toBe(0);
      expect(level.getProperties().bold).toBe(true);
    });

    it('should allow setting to undefined (default behavior)', () => {
      const level = new NumberingLevel({
        level: 1,
        format: 'decimal',
        text: '%2.',
        lvlRestart: 0,
      });

      level.setLvlRestart(undefined);
      expect(level.getLvlRestart()).toBeUndefined();
    });

    it('should reject invalid lvlRestart values', () => {
      const level = new NumberingLevel({
        level: 1,
        format: 'decimal',
        text: '%2.',
      });

      expect(() => level.setLvlRestart(-1)).toThrow();
      expect(() => level.setLvlRestart(9)).toThrow();
    });
  });

  describe('XML Generation', () => {
    it('should not output lvlRestart when undefined (default)', () => {
      const level = new NumberingLevel({
        level: 0,
        format: 'decimal',
        text: '%1.',
      });

      const xml = level.toXML();
      const xmlString = JSON.stringify(xml);

      expect(xmlString).not.toContain('lvlRestart');
    });

    it('should output lvlRestart when set to 0', () => {
      const level = new NumberingLevel({
        level: 1,
        format: 'decimal',
        text: '%2.',
        lvlRestart: 0,
      });

      const xml = level.toXML();
      const xmlString = JSON.stringify(xml);

      expect(xmlString).toContain('lvlRestart');
      expect(xmlString).toContain('"w:val":"0"');
    });

    it('should output lvlRestart when set to higher level', () => {
      const level = new NumberingLevel({
        level: 2,
        format: 'decimal',
        text: '%3.',
        lvlRestart: 0, // Restart when level 0 changes
      });

      const xml = level.toXML();
      const xmlString = JSON.stringify(xml);

      expect(xmlString).toContain('lvlRestart');
    });
  });

  describe('XML Parsing', () => {
    it('should parse lvlRestart from XML', () => {
      const xml = `
        <w:lvl w:ilvl="1">
          <w:start w:val="1"/>
          <w:numFmt w:val="decimal"/>
          <w:lvlRestart w:val="0"/>
          <w:lvlText w:val="%2."/>
          <w:lvlJc w:val="left"/>
        </w:lvl>
      `;

      const level = NumberingLevel.fromXML(xml);
      expect(level.getLvlRestart()).toBe(0);
    });

    it('should return undefined for missing lvlRestart', () => {
      const xml = `
        <w:lvl w:ilvl="1">
          <w:start w:val="1"/>
          <w:numFmt w:val="decimal"/>
          <w:lvlText w:val="%2."/>
          <w:lvlJc w:val="left"/>
        </w:lvl>
      `;

      const level = NumberingLevel.fromXML(xml);
      expect(level.getLvlRestart()).toBeUndefined();
    });
  });

  describe('Round-Trip Tests', () => {
    it('should round-trip lvlRestart through buffer', async () => {
      const doc = Document.create();

      // Create abstract numbering with lvlRestart
      const abstractNum = new AbstractNumbering({ abstractNumId: 1 });

      // Level 0: Normal decimal (default restart)
      const level0 = NumberingLevel.createDecimalLevel(0, '%1.');
      abstractNum.addLevel(level0);

      // Level 1: Decimal that never restarts (lvlRestart=0)
      const level1 = new NumberingLevel({
        level: 1,
        format: 'decimal',
        text: '%2.',
        lvlRestart: 0, // Never restart
      });
      abstractNum.addLevel(level1);

      doc.getNumberingManager().addAbstractNumbering(abstractNum);

      const instance = new NumberingInstance({ numId: 1, abstractNumId: 1 });
      doc.getNumberingManager().addNumberingInstance(instance);

      // Add some paragraphs
      for (let i = 1; i <= 3; i++) {
        const para = new Paragraph();
        para.addText(`Item ${i}`);
        para.setNumbering(1, 0);
        doc.addParagraph(para);

        // Sub-items
        for (let j = 1; j <= 2; j++) {
          const subPara = new Paragraph();
          subPara.addText(`Sub-item ${j}`);
          subPara.setNumbering(1, 1);
          doc.addParagraph(subPara);
        }
      }

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      // Verify the numbering was preserved
      const loadedAbstractNum = loadedDoc
        .getNumberingManager()
        .getAbstractNumbering(1);
      expect(loadedAbstractNum).toBeDefined();

      const loadedLevel1 = loadedAbstractNum?.getLevel(1);
      expect(loadedLevel1).toBeDefined();
      expect(loadedLevel1?.getLvlRestart()).toBe(0);
    });

    it('should round-trip through file', async () => {
      const testFile = path.join(testOutputDir, 'test-lvlRestart.docx');
      const doc = Document.create();

      // Create abstract numbering with various restart settings
      const abstractNum = new AbstractNumbering({ abstractNumId: 1 });

      // Level 0: Default restart behavior
      abstractNum.addLevel(NumberingLevel.createDecimalLevel(0, '%1.'));

      // Level 1: Never restart (lvlRestart=0)
      const level1 = new NumberingLevel({
        level: 1,
        format: 'lowerLetter',
        text: '%2.',
        lvlRestart: 0,
      });
      abstractNum.addLevel(level1);

      // Level 2: Restart when level 0 changes (not level 1)
      const level2 = new NumberingLevel({
        level: 2,
        format: 'lowerRoman',
        text: '%3.',
        lvlRestart: 0,
      });
      abstractNum.addLevel(level2);

      doc.getNumberingManager().addAbstractNumbering(abstractNum);
      const instance = new NumberingInstance({ numId: 1, abstractNumId: 1 });
      doc.getNumberingManager().addNumberingInstance(instance);

      const para = new Paragraph();
      para.addText('Test item');
      para.setNumbering(1, 0);
      doc.addParagraph(para);

      await doc.save(testFile);
      const loadedDoc = await Document.load(testFile);

      const loadedAbstractNum = loadedDoc
        .getNumberingManager()
        .getAbstractNumbering(1);
      expect(loadedAbstractNum?.getLevel(1)?.getLvlRestart()).toBe(0);
      expect(loadedAbstractNum?.getLevel(2)?.getLvlRestart()).toBe(0);
    });
  });

  describe('Use Cases', () => {
    it('should support continuous sub-numbering across sections', () => {
      // Use case: Legal documents where sub-paragraphs continue numbering
      // even when main sections change (1.1, 1.2, 2.3, 2.4 not 2.1, 2.2)

      const level1 = new NumberingLevel({
        level: 1,
        format: 'decimal',
        text: '%1.%2.',
        lvlRestart: 0, // Never restart - continues across main sections
      });

      expect(level1.getLvlRestart()).toBe(0);
    });

    it('should support independent sub-lists that restart', () => {
      // Use case: Normal lists where sub-items restart for each main item
      // 1. Item A
      //   a. Sub 1 (resets for each main item)
      //   b. Sub 2
      // 2. Item B
      //   a. Sub 1 (restarts)

      const level1 = new NumberingLevel({
        level: 1,
        format: 'lowerLetter',
        text: '%2.',
        // lvlRestart undefined = default behavior (restart when level 0 changes)
      });

      expect(level1.getLvlRestart()).toBeUndefined();
    });
  });
});
