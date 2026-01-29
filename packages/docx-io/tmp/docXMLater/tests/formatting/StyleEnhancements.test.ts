/**
 * Tests for Style Enhancements (Phase 5.3)
 *
 * Tests the 9 style gallery metadata properties that control
 * style visibility, organization, and behavior in Word.
 */

import { Document, Style, StylesManager } from '../../src';
import * as path from 'path';
import * as fs from 'fs';

describe('Style Enhancements - Phase 5.3', () => {
  let doc: Document;

  beforeEach(() => {
    doc = Document.create();
  });

  describe('Setter Methods', () => {
    it('should set qFormat property', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
      });

      style.setQFormat(true);
      const props = style.getProperties();
      expect(props.qFormat).toBe(true);

      style.setQFormat(false);
      const props2 = style.getProperties();
      expect(props2.qFormat).toBe(false);
    });

    it('should set uiPriority property with validation', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
      });

      style.setUiPriority(10);
      expect(style.getProperties().uiPriority).toBe(10);

      style.setUiPriority(0);
      expect(style.getProperties().uiPriority).toBe(0);

      style.setUiPriority(99);
      expect(style.getProperties().uiPriority).toBe(99);

      // Should throw for invalid values
      expect(() => style.setUiPriority(-1)).toThrow('UI priority must be between 0 and 99');
      expect(() => style.setUiPriority(100)).toThrow('UI priority must be between 0 and 99');
    });

    it('should set semiHidden property', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
      });

      style.setSemiHidden(true);
      expect(style.getProperties().semiHidden).toBe(true);
    });

    it('should set unhideWhenUsed property', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
      });

      style.setUnhideWhenUsed(true);
      expect(style.getProperties().unhideWhenUsed).toBe(true);
    });

    it('should set locked property', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
      });

      style.setLocked(true);
      expect(style.getProperties().locked).toBe(true);
    });

    it('should set personal property', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
      });

      style.setPersonal(true);
      expect(style.getProperties().personal).toBe(true);
    });

    it('should set link property', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
      });

      style.setLink('LinkedStyle');
      expect(style.getProperties().link).toBe('LinkedStyle');
    });

    it('should set autoRedefine property', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
      });

      style.setAutoRedefine(true);
      expect(style.getProperties().autoRedefine).toBe(true);
    });

    it('should set aliases property', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
      });

      style.setAliases('Alias1,Alias2,Alias3');
      expect(style.getProperties().aliases).toBe('Alias1,Alias2,Alias3');
    });

    it('should support fluent API chaining', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
      });

      const result = style
        .setQFormat(true)
        .setUiPriority(10)
        .setSemiHidden(false)
        .setUnhideWhenUsed(true)
        .setLocked(false)
        .setPersonal(false)
        .setLink('LinkedStyle')
        .setAutoRedefine(true)
        .setAliases('Test,Style');

      expect(result).toBe(style); // Should return same instance
      const props = style.getProperties();
      expect(props.qFormat).toBe(true);
      expect(props.uiPriority).toBe(10);
      expect(props.unhideWhenUsed).toBe(true);
      expect(props.link).toBe('LinkedStyle');
      expect(props.autoRedefine).toBe(true);
      expect(props.aliases).toBe('Test,Style');
    });
  });

  describe('Validation', () => {
    it('should validate uiPriority range in isValid()', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
      });

      style.setUiPriority(10);
      expect(style.isValid()).toBe(true);

      // Manually set invalid value (bypassing setter)
      const props = style.getProperties();
      (props as any).uiPriority = 150;
      const invalidStyle = Style.create(props);
      expect(invalidStyle.isValid()).toBe(false);
    });

    it('should prevent circular link references', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
        link: 'TestStyle', // Links to itself
      });

      expect(style.isValid()).toBe(false);
    });
  });

  describe('XML Generation', () => {
    it('should generate qFormat XML', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
        qFormat: true,
      });

      const xml = style.toXML();
      const xmlString = JSON.stringify(xml);
      expect(xmlString).toContain('"name":"w:qFormat"');
    });

    it('should generate uiPriority XML', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
        uiPriority: 25,
      });

      const xml = style.toXML();
      const xmlString = JSON.stringify(xml);
      expect(xmlString).toContain('uiPriority');
      expect(xmlString).toContain('25');
    });

    it('should generate semiHidden XML', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
        semiHidden: true,
      });

      const xml = style.toXML();
      const xmlString = JSON.stringify(xml);
      expect(xmlString).toContain('semiHidden');
    });

    it('should generate unhideWhenUsed XML', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
        unhideWhenUsed: true,
      });

      const xml = style.toXML();
      const xmlString = JSON.stringify(xml);
      expect(xmlString).toContain('unhideWhenUsed');
    });

    it('should generate locked XML', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
        locked: true,
      });

      const xml = style.toXML();
      const xmlString = JSON.stringify(xml);
      expect(xmlString).toContain('locked');
    });

    it('should generate personal XML', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
        personal: true,
      });

      const xml = style.toXML();
      const xmlString = JSON.stringify(xml);
      expect(xmlString).toContain('personal');
    });

    it('should generate link XML', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
        link: 'LinkedStyle',
      });

      const xml = style.toXML();
      const xmlString = JSON.stringify(xml);
      expect(xmlString).toContain('link');
      expect(xmlString).toContain('LinkedStyle');
    });

    it('should generate autoRedefine XML', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
        autoRedefine: true,
      });

      const xml = style.toXML();
      const xmlString = JSON.stringify(xml);
      expect(xmlString).toContain('autoRedefine');
    });

    it('should generate aliases XML', () => {
      const style = Style.create({
        styleId: 'TestStyle',
        name: 'Test Style',
        type: 'paragraph',
        aliases: 'Alt1,Alt2',
      });

      const xml = style.toXML();
      const xmlString = JSON.stringify(xml);
      expect(xmlString).toContain('aliases');
      expect(xmlString).toContain('Alt1,Alt2');
    });

    it('should generate complete metadata XML', () => {
      const style = Style.create({
        styleId: 'CompleteStyle',
        name: 'Complete Style',
        type: 'paragraph',
        qFormat: true,
        uiPriority: 5,
        semiHidden: false,
        unhideWhenUsed: true,
        locked: false,
        personal: false,
        link: 'LinkedCharStyle',
        autoRedefine: true,
        aliases: 'Complete,Full',
      });

      const xml = style.toXML();
      const xmlString = JSON.stringify(xml);

      expect(xmlString).toContain('qFormat');
      expect(xmlString).toContain('uiPriority');
      expect(xmlString).toContain('unhideWhenUsed');
      expect(xmlString).toContain('link');
      expect(xmlString).toContain('LinkedCharStyle');
      expect(xmlString).toContain('autoRedefine');
      expect(xmlString).toContain('aliases');
      expect(xmlString).toContain('Complete,Full');
    });
  });

  describe('StylesManager Helper Methods', () => {
    it('should get quick styles', () => {
      const manager = StylesManager.create();

      // Add custom quick style
      const quickStyle = Style.create({
        styleId: 'QuickStyle1',
        name: 'Quick Style 1',
        type: 'paragraph',
        qFormat: true,
        customStyle: true,
      });
      manager.addStyle(quickStyle);

      // Add semi-hidden style (should not appear in quick styles)
      const hiddenStyle = Style.create({
        styleId: 'HiddenStyle1',
        name: 'Hidden Style 1',
        type: 'paragraph',
        qFormat: true,
        semiHidden: true,
        customStyle: true,
      });
      manager.addStyle(hiddenStyle);

      const quickStyles = manager.getQuickStyles();

      // Should include built-in styles (Normal, Heading1, etc.)
      expect(quickStyles.length).toBeGreaterThan(0);

      // Should include our quick style
      expect(quickStyles.some(s => s.getStyleId() === 'QuickStyle1')).toBe(true);

      // Should NOT include hidden style
      expect(quickStyles.some(s => s.getStyleId() === 'HiddenStyle1')).toBe(false);
    });

    it('should get visible styles', () => {
      const manager = StylesManager.createEmpty();

      const visibleStyle = Style.create({
        styleId: 'Visible1',
        name: 'Visible Style',
        type: 'paragraph',
      });
      manager.addStyle(visibleStyle);

      const hiddenStyle = Style.create({
        styleId: 'Hidden1',
        name: 'Hidden Style',
        type: 'paragraph',
        semiHidden: true,
      });
      manager.addStyle(hiddenStyle);

      const visibleStyles = manager.getVisibleStyles();

      expect(visibleStyles.some(s => s.getStyleId() === 'Visible1')).toBe(true);
      expect(visibleStyles.some(s => s.getStyleId() === 'Hidden1')).toBe(false);
    });

    it('should get styles sorted by priority', () => {
      const manager = StylesManager.createEmpty();

      const style1 = Style.create({
        styleId: 'Style1',
        name: 'Style 1',
        type: 'paragraph',
        uiPriority: 50,
      });
      manager.addStyle(style1);

      const style2 = Style.create({
        styleId: 'Style2',
        name: 'Style 2',
        type: 'paragraph',
        uiPriority: 10,
      });
      manager.addStyle(style2);

      const style3 = Style.create({
        styleId: 'Style3',
        name: 'Style 3',
        type: 'paragraph',
        uiPriority: 30,
      });
      manager.addStyle(style3);

      const style4 = Style.create({
        styleId: 'Style4',
        name: 'Style 4',
        type: 'paragraph',
        // No priority - should appear last
      });
      manager.addStyle(style4);

      const sortedStyles = manager.getStylesByPriority();

      expect(sortedStyles[0]!.getStyleId()).toBe('Style2'); // uiPriority = 10
      expect(sortedStyles[1]!.getStyleId()).toBe('Style3'); // uiPriority = 30
      expect(sortedStyles[2]!.getStyleId()).toBe('Style1'); // uiPriority = 50
      expect(sortedStyles[3]!.getStyleId()).toBe('Style4'); // no priority (999)
    });

    it('should get linked style', () => {
      const manager = StylesManager.createEmpty();

      const paraStyle = Style.create({
        styleId: 'ParaStyle1',
        name: 'Paragraph Style 1',
        type: 'paragraph',
        link: 'CharStyle1',
      });
      manager.addStyle(paraStyle);

      const charStyle = Style.create({
        styleId: 'CharStyle1',
        name: 'Character Style 1',
        type: 'character',
      });
      manager.addStyle(charStyle);

      const linked = manager.getLinkedStyle('ParaStyle1');
      expect(linked).toBeDefined();
      expect(linked?.getStyleId()).toBe('CharStyle1');
      expect(linked?.getType()).toBe('character');
    });

    it('should return undefined for non-existent linked style', () => {
      const manager = StylesManager.createEmpty();

      const style = Style.create({
        styleId: 'Style1',
        name: 'Style 1',
        type: 'paragraph',
      });
      manager.addStyle(style);

      const linked = manager.getLinkedStyle('Style1');
      expect(linked).toBeUndefined();
    });
  });

  describe('Round-Trip Testing', () => {
    const outputDir = path.join(__dirname, '../output');

    beforeAll(() => {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
    });

    it('should preserve all metadata properties through save/load cycle', async () => {
      const doc = Document.create();

      // Create a style with all metadata properties
      const style = Style.create({
        styleId: 'MetadataTest',
        name: 'Metadata Test Style',
        type: 'paragraph',
        qFormat: true,
        uiPriority: 15,
        semiHidden: false,
        unhideWhenUsed: true,
        locked: false,
        personal: false,
        link: 'Normal',
        autoRedefine: true,
        aliases: 'Meta,Test,Style',
      });

      doc.addStyle(style);
      doc.createParagraph('Test paragraph').setStyle('MetadataTest');

      const outputPath = path.join(outputDir, 'test-style-metadata-roundtrip.docx');
      await doc.save(outputPath);

      // Load the document
      const loadedDoc = await Document.load(outputPath);
      const loadedStyle = loadedDoc.getStyle('MetadataTest');

      expect(loadedStyle).toBeDefined();
      const props = loadedStyle!.getProperties();

      expect(props.qFormat).toBe(true);
      expect(props.uiPriority).toBe(15);
      expect(props.semiHidden).toBeFalsy(); // false serializes as absent in XML, parses as undefined
      expect(props.unhideWhenUsed).toBe(true);
      expect(props.locked).toBeFalsy(); // false serializes as absent in XML, parses as undefined
      expect(props.personal).toBeFalsy(); // false serializes as absent in XML, parses as undefined
      expect(props.link).toBe('Normal');
      expect(props.autoRedefine).toBe(true);
      expect(props.aliases).toBe('Meta,Test,Style');
    });

    it('should handle styles with partial metadata', async () => {
      const doc = Document.create();

      const style = Style.create({
        styleId: 'PartialMeta',
        name: 'Partial Metadata Style',
        type: 'paragraph',
        qFormat: true,
        uiPriority: 20,
        // Other metadata properties not set
      });

      doc.addStyle(style);
      doc.createParagraph('Test').setStyle('PartialMeta');

      const outputPath = path.join(outputDir, 'test-style-partial-metadata.docx');
      await doc.save(outputPath);

      const loadedDoc = await Document.load(outputPath);
      const loadedStyle = loadedDoc.getStyle('PartialMeta');

      expect(loadedStyle).toBeDefined();
      const props = loadedStyle!.getProperties();

      expect(props.qFormat).toBe(true);
      expect(props.uiPriority).toBe(20);
      expect(props.semiHidden).toBeFalsy();
      expect(props.link).toBeUndefined();
    });

    it('should handle multiple styles with different metadata', async () => {
      const doc = Document.create();

      // Quick style
      const quickStyle = Style.create({
        styleId: 'QuickTest',
        name: 'Quick Test',
        type: 'paragraph',
        qFormat: true,
        uiPriority: 5,
      });
      doc.addStyle(quickStyle);

      // Hidden style
      const hiddenStyle = Style.create({
        styleId: 'HiddenTest',
        name: 'Hidden Test',
        type: 'paragraph',
        semiHidden: true,
        unhideWhenUsed: true,
      });
      doc.addStyle(hiddenStyle);

      // Locked style
      const lockedStyle = Style.create({
        styleId: 'LockedTest',
        name: 'Locked Test',
        type: 'paragraph',
        locked: true,
      });
      doc.addStyle(lockedStyle);

      doc.createParagraph('Quick').setStyle('QuickTest');
      doc.createParagraph('Hidden').setStyle('HiddenTest');
      doc.createParagraph('Locked').setStyle('LockedTest');

      const outputPath = path.join(outputDir, 'test-style-multiple-metadata.docx');
      await doc.save(outputPath);

      const loadedDoc = await Document.load(outputPath);

      const quick = loadedDoc.getStyle('QuickTest');
      expect(quick?.getProperties().qFormat).toBe(true);
      expect(quick?.getProperties().uiPriority).toBe(5);

      const hidden = loadedDoc.getStyle('HiddenTest');
      expect(hidden?.getProperties().semiHidden).toBe(true);
      expect(hidden?.getProperties().unhideWhenUsed).toBe(true);

      const locked = loadedDoc.getStyle('LockedTest');
      expect(locked?.getProperties().locked).toBe(true);
    });
  });
});
