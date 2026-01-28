/**
 * Tests for Style Validation Features
 *
 * Validates the new style validation APIs that enable
 * style corruption detection and repair.
 */

import { Document, Style, StylesManager } from '../../src';

describe('Style Validation Features', () => {
  let doc: Document;

  beforeEach(() => {
    doc = Document.create();
  });

  describe('Document.getStyles()', () => {
    it('should return all styles including built-in', () => {
      const styles = doc.getStyles();

      expect(styles).toBeDefined();
      expect(styles.length).toBeGreaterThan(0);

      // Should have at least Normal style
      const normalStyle = styles.find(s => s.getStyleId() === 'Normal');
      expect(normalStyle).toBeDefined();
    });

    it('should include custom styles', () => {
      const customStyle = Style.create({
        styleId: 'CustomStyle1',
        name: 'Custom Style 1',
        type: 'paragraph',
        basedOn: 'Normal'
      });

      doc.addStyle(customStyle);
      const styles = doc.getStyles();

      const found = styles.find(s => s.getStyleId() === 'CustomStyle1');
      expect(found).toBeDefined();
      expect(found?.getName()).toBe('Custom Style 1');
    });
  });

  describe('Document.removeStyle()', () => {
    it('should remove an existing style', () => {
      const customStyle = Style.create({
        styleId: 'ToRemove',
        name: 'To Remove',
        type: 'paragraph'
      });

      doc.addStyle(customStyle);
      expect(doc.hasStyle('ToRemove')).toBe(true);

      const removed = doc.removeStyle('ToRemove');
      expect(removed).toBe(true);
      expect(doc.hasStyle('ToRemove')).toBe(false);
    });

    it('should return false for non-existent style', () => {
      const removed = doc.removeStyle('NonExistent');
      expect(removed).toBe(false);
    });
  });

  describe('Document.updateStyle()', () => {
    it('should update style properties', () => {
      const style = Style.create({
        styleId: 'ToUpdate',
        name: 'Original Name',
        type: 'paragraph',
        runFormatting: {
          bold: false,
          size: 10
        }
      });

      doc.addStyle(style);

      const updated = doc.updateStyle('ToUpdate', {
        name: 'Updated Name',
        runFormatting: {
          bold: true,
          size: 12,
          color: 'FF0000'
        }
      });

      expect(updated).toBe(true);

      const updatedStyle = doc.getStyle('ToUpdate');
      expect(updatedStyle).toBeDefined();
      expect(updatedStyle?.getName()).toBe('Updated Name');

      const props = updatedStyle?.getProperties();
      expect(props?.runFormatting?.bold).toBe(true);
      expect(props?.runFormatting?.size).toBe(12);
      expect(props?.runFormatting?.color).toBe('FF0000');
    });

    it('should preserve styleId during update', () => {
      doc.addStyle(Style.create({
        styleId: 'PreserveId',
        name: 'Test',
        type: 'paragraph'
      }));

      doc.updateStyle('PreserveId', {
        styleId: 'AttemptedChange', // Should be ignored
        name: 'New Name'
      });

      const style = doc.getStyle('PreserveId');
      expect(style).toBeDefined();
      expect(doc.hasStyle('AttemptedChange')).toBe(false);
    });

    it('should return false for non-existent style', () => {
      const updated = doc.updateStyle('NonExistent', { name: 'New' });
      expect(updated).toBe(false);
    });
  });

  describe('Document.getStylesXml()', () => {
    it('should return raw styles XML', () => {
      const xml = doc.getStylesXml();

      expect(xml).toBeDefined();
      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<w:styles');
      expect(xml).toContain('</w:styles>');
      expect(xml).toContain('xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"');
    });

    it('should include all styles in XML', () => {
      doc.addStyle(Style.create({
        styleId: 'TestInXml',
        name: 'Test In XML',
        type: 'paragraph'
      }));

      const xml = doc.getStylesXml();

      expect(xml).toContain('w:styleId="TestInXml"');
      expect(xml).toContain('<w:name w:val="Test In XML"');
    });
  });

  describe('Document.setStylesXml()', () => {
    it('should set raw styles XML', () => {
      const customXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="CustomFromXml">
    <w:name w:val="Custom From XML"/>
  </w:style>
</w:styles>`;

      doc.setStylesXml(customXml);
      const retrievedXml = doc.getStylesXml();

      expect(retrievedXml).toContain('w:styleId="CustomFromXml"');
      expect(retrievedXml).toContain('Custom From XML');
    });

    it('should clear styles manager when setting XML', () => {
      // Add a style through API
      doc.addStyle(Style.create({
        styleId: 'WillBeCleared',
        name: 'Will Be Cleared',
        type: 'paragraph'
      }));

      // Set new XML
      const minimalXml = `<?xml version="1.0"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="OnlyStyle">
    <w:name w:val="Only Style"/>
  </w:style>
</w:styles>`;

      doc.setStylesXml(minimalXml);

      // Style added through API should be gone
      const xml = doc.getStylesXml();
      expect(xml).not.toContain('WillBeCleared');
      expect(xml).toContain('OnlyStyle');
    });
  });

  describe('Style.isValid()', () => {
    it('should validate correct style', () => {
      const style = Style.create({
        styleId: 'Valid',
        name: 'Valid Style',
        type: 'paragraph',
        basedOn: 'Normal'
      });

      expect(style.isValid()).toBe(true);
    });

    it('should reject style without required fields', () => {
      const noId = new Style({
        styleId: '',
        name: 'No ID',
        type: 'paragraph'
      });
      expect(noId.isValid()).toBe(false);

      const noName = new Style({
        styleId: 'HasId',
        name: '',
        type: 'paragraph'
      });
      expect(noName.isValid()).toBe(false);
    });

    it('should reject invalid style type', () => {
      const style = new Style({
        styleId: 'BadType',
        name: 'Bad Type',
        type: 'invalid' as any
      });

      expect(style.isValid()).toBe(false);
    });

    it('should reject circular reference', () => {
      const style = Style.create({
        styleId: 'Circular',
        name: 'Circular',
        type: 'paragraph',
        basedOn: 'Circular' // Based on itself
      });

      expect(style.isValid()).toBe(false);
    });

    it('should reject invalid formatting values', () => {
      const badSize = Style.create({
        styleId: 'BadSize',
        name: 'Bad Size',
        type: 'paragraph',
        runFormatting: {
          size: -5 // Invalid
        }
      });
      expect(badSize.isValid()).toBe(false);

      const badColor = Style.create({
        styleId: 'BadColor',
        name: 'Bad Color',
        type: 'paragraph',
        runFormatting: {
          color: 'GGGGGG' // Invalid hex
        }
      });
      expect(badColor.isValid()).toBe(false);

      const badHighlight = Style.create({
        styleId: 'BadHighlight',
        name: 'Bad Highlight',
        type: 'paragraph',
        runFormatting: {
          highlight: 'invalidColor' as any
        }
      });
      expect(badHighlight.isValid()).toBe(false);
    });

    it('should accept valid formatting values', () => {
      const style = Style.create({
        styleId: 'GoodFormat',
        name: 'Good Format',
        type: 'paragraph',
        paragraphFormatting: {
          alignment: 'center',
          spacing: {
            before: 100,
            after: 200,
            line: 240,
            lineRule: 'auto'
          },
          indentation: {
            left: 720,
            firstLine: 360
          }
        },
        runFormatting: {
          bold: true,
          size: 14,
          color: 'FF0000',
          highlight: 'yellow'
        }
      });

      expect(style.isValid()).toBe(true);
    });
  });

  describe('StylesManager.validate()', () => {
    it('should validate correct styles XML', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Normal">
    <w:name w:val="Normal"/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="Heading 1"/>
    <w:basedOn w:val="Normal"/>
  </w:style>
</w:styles>`;

      const result = StylesManager.validate(xml);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.styleCount).toBe(2);
      expect(result.styleIds).toContain('Normal');
      expect(result.styleIds).toContain('Heading1');
    });

    it('should detect empty XML', () => {
      const result = StylesManager.validate('');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Styles XML is empty or null');
    });

    it('should detect missing root element', () => {
      const xml = `<?xml version="1.0"?>
<wrongRoot>
  <w:style w:type="paragraph" w:styleId="Test">
    <w:name w:val="Test"/>
  </w:style>
</wrongRoot>`;

      const result = StylesManager.validate(xml);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Missing required <w:styles> root element'))).toBe(true);
    });

    it('should detect duplicate style IDs', () => {
      const xml = `<?xml version="1.0"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Duplicate">
    <w:name w:val="First"/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Duplicate">
    <w:name w:val="Second"/>
  </w:style>
</w:styles>`;

      const result = StylesManager.validate(xml);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate style ID found: "Duplicate"'))).toBe(true);
    });

    it('should detect missing required attributes', () => {
      const xml = `<?xml version="1.0"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph">
    <w:name w:val="No ID"/>
  </w:style>
</w:styles>`;

      const result = StylesManager.validate(xml);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('without required w:styleId attribute'))).toBe(true);
    });

    it('should detect circular references', () => {
      const xml = `<?xml version="1.0"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Circular">
    <w:name w:val="Circular"/>
    <w:basedOn w:val="Circular"/>
  </w:style>
</w:styles>`;

      const result = StylesManager.validate(xml);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Circular reference detected'))).toBe(true);
    });

    it('should detect XML corruption patterns', () => {
      const xml = `<?xml version="1.0"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  &lt;w:style w:type="paragraph" w:styleId="Escaped"&gt;
    <w:name w:val="Escaped"/>
  &lt;/w:style&gt;
</w:styles>`;

      const result = StylesManager.validate(xml);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('double-encoding corruption'))).toBe(true);
    });

    it('should warn about missing Normal style', () => {
      const xml = `<?xml version="1.0"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Other">
    <w:name w:val="Other"/>
  </w:style>
</w:styles>`;

      const result = StylesManager.validate(xml);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('Missing "Normal" style'))).toBe(true);
    });

    it('should detect malformed style tags', () => {
      const xml = `<?xml version="1.0"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style>
    <w:name w:val="No Attributes"/>
  </w:style>
</w:styles>`;

      const result = StylesManager.validate(xml);

      expect(result.isValid).toBe(false);
      // Missing required attributes
      expect(result.errors.some(e => e.includes('without') && e.includes('required'))).toBe(true);
    });
  });

  describe('Integration: Style validation workflow', () => {
    it('should validate XML before setting', () => {
      const badXml = `<?xml version="1.0"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Circular">
    <w:basedOn w:val="Circular"/>
  </w:style>
</w:styles>`;

      // Validate first
      const validation = StylesManager.validate(badXml);
      expect(validation.isValid).toBe(false);

      // Should not set invalid XML
      if (validation.isValid) {
        doc.setStylesXml(badXml);
      }

      // Original styles should still be there
      expect(doc.hasStyle('Normal')).toBe(true);
    });

    it('should repair corrupted styles', () => {
      const corruptedXml = doc.getStylesXml();

      // Simulate corruption
      const doubleEncoded = corruptedXml
        .replace(/<w:style/g, '&lt;w:style')
        .replace(/<\/w:style>/g, '&lt;/w:style&gt;');

      const validation = StylesManager.validate(doubleEncoded);
      expect(validation.isValid).toBe(false);

      // Repair by reverting double encoding
      const repaired = doubleEncoded
        .replace(/&lt;w:style/g, '<w:style')
        .replace(/&lt;\/w:style&gt;/g, '</w:style>');

      const repairedValidation = StylesManager.validate(repaired);
      expect(repairedValidation.isValid).toBe(true);

      // Safe to set repaired XML
      doc.setStylesXml(repaired);
    });
  });
});