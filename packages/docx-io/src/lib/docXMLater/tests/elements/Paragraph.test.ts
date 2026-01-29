/**
 * Tests for Paragraph and Run classes
 */

import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import { Hyperlink } from '../../src/elements/Hyperlink';
import { Revision } from '../../src/elements/Revision';
import { XMLBuilder } from '../../src/xml/XMLBuilder';

describe('Run', () => {
  describe('Basic functionality', () => {
    test('should create a run with text', () => {
      const run = new Run('Hello World');
      expect(run.getText()).toBe('Hello World');
    });

    test('should set text', () => {
      const run = new Run('Original');
      run.setText('Updated');
      expect(run.getText()).toBe('Updated');
    });

    test('should create run with formatting', () => {
      const run = new Run('Bold text', { bold: true });
      expect(run.getFormatting().bold).toBe(true);
    });
  });

  describe('Formatting methods', () => {
    test('should set bold', () => {
      const run = new Run('Text');
      run.setBold();
      expect(run.getFormatting().bold).toBe(true);
    });

    test('should set italic', () => {
      const run = new Run('Text');
      run.setItalic();
      expect(run.getFormatting().italic).toBe(true);
    });

    test('should set underline', () => {
      const run = new Run('Text');
      run.setUnderline();
      expect(run.getFormatting().underline).toBe(true);
    });

    test('should set underline with style', () => {
      const run = new Run('Text');
      run.setUnderline('double');
      expect(run.getFormatting().underline).toBe('double');
    });

    test('should set strike', () => {
      const run = new Run('Text');
      run.setStrike();
      expect(run.getFormatting().strike).toBe(true);
    });

    test('should set subscript', () => {
      const run = new Run('Text');
      run.setSubscript();
      expect(run.getFormatting().subscript).toBe(true);
      expect(run.getFormatting().superscript).toBe(false);
    });

    test('should set superscript', () => {
      const run = new Run('Text');
      run.setSuperscript();
      expect(run.getFormatting().superscript).toBe(true);
      expect(run.getFormatting().subscript).toBe(false);
    });

    test('should toggle between subscript and superscript', () => {
      const run = new Run('Text');
      run.setSubscript();
      expect(run.getFormatting().subscript).toBe(true);
      run.setSuperscript();
      expect(run.getFormatting().superscript).toBe(true);
      expect(run.getFormatting().subscript).toBe(false);
    });

    test('should set font', () => {
      const run = new Run('Text');
      run.setFont('Arial', 12);
      expect(run.getFormatting().font).toBe('Arial');
      expect(run.getFormatting().size).toBe(12);
    });

    test('should set font without size', () => {
      const run = new Run('Text');
      run.setFont('Times New Roman');
      expect(run.getFormatting().font).toBe('Times New Roman');
      expect(run.getFormatting().size).toBeUndefined();
    });

    test('should set size', () => {
      const run = new Run('Text');
      run.setSize(14);
      expect(run.getFormatting().size).toBe(14);
    });

    test('should set color', () => {
      const run = new Run('Text');
      run.setColor('#FF0000');
      expect(run.getFormatting().color).toBe('FF0000');
    });

    test('should set color without hash', () => {
      const run = new Run('Text');
      run.setColor('00FF00');
      expect(run.getFormatting().color).toBe('00FF00');
    });

    test('should set highlight', () => {
      const run = new Run('Text');
      run.setHighlight('yellow');
      expect(run.getFormatting().highlight).toBe('yellow');
    });

    test('should set small caps', () => {
      const run = new Run('Text');
      run.setSmallCaps();
      expect(run.getFormatting().smallCaps).toBe(true);
    });

    test('should set all caps', () => {
      const run = new Run('Text');
      run.setAllCaps();
      expect(run.getFormatting().allCaps).toBe(true);
    });
  });

  describe('Method chaining', () => {
    test('should support method chaining', () => {
      const run = new Run('Text')
        .setBold()
        .setItalic()
        .setColor('FF0000')
        .setSize(14);

      const formatting = run.getFormatting();
      expect(formatting.bold).toBe(true);
      expect(formatting.italic).toBe(true);
      expect(formatting.color).toBe('FF0000');
      expect(formatting.size).toBe(14);
    });
  });

  describe('XML generation', () => {
    test('should generate basic XML', () => {
      const run = new Run('Hello');
      const xml = run.toXML();

      expect(xml.name).toBe('w:r');
      expect(xml.children).toBeDefined();
    });

    test('should generate XML with formatting', () => {
      const run = new Run('Bold', { bold: true });
      const xml = run.toXML();

      const builder = new XMLBuilder();
      builder.element(xml.name, xml.attributes, xml.children);
      const xmlStr = builder.build();

      // Accept both <w:b/> and <w:b w:val="1"/> (both are valid per ECMA-376)
      expect(xmlStr).toMatch(/<w:b(\s+w:val="1")?\/?>/);
      expect(xmlStr).toContain('Bold');
    });

    test('should preserve spaces with xml:space attribute', () => {
      const run = new Run('  Text with spaces  ');
      const xml = run.toXML();

      const builder = new XMLBuilder();
      builder.element(xml.name, xml.attributes, xml.children);
      const xmlStr = builder.build();

      expect(xmlStr).toContain('xml:space="preserve"');
    });
  });

  describe('Static methods', () => {
    test('should create run with static method', () => {
      const run = Run.create('Text', { bold: true });
      expect(run.getText()).toBe('Text');
      expect(run.getFormatting().bold).toBe(true);
    });
  });
});

describe('Paragraph', () => {
  describe('Basic functionality', () => {
    test('should create empty paragraph', () => {
      const para = new Paragraph();
      expect(para.getRuns().length).toBe(0);
      expect(para.getText()).toBe('');
    });

    test('should add run', () => {
      const para = new Paragraph();
      const run = new Run('Hello');
      para.addRun(run);

      expect(para.getRuns().length).toBe(1);
      expect(para.getText()).toBe('Hello');
    });

    test('should add text', () => {
      const para = new Paragraph();
      para.addText('Hello');
      para.addText(' World');

      expect(para.getRuns().length).toBe(2);
      expect(para.getText()).toBe('Hello World');
    });

    test('should set text', () => {
      const para = new Paragraph();
      para.addText('First');
      para.addText('Second');
      para.setText('Replaced');

      expect(para.getRuns().length).toBe(1);
      expect(para.getText()).toBe('Replaced');
    });

    test('should get combined text from multiple runs', () => {
      const para = new Paragraph();
      para.addText('Hello ');
      para.addText('World', { bold: true });
      para.addText('!', { italic: true });

      expect(para.getText()).toBe('Hello World!');
    });

    test('should include hyperlink text in getText', () => {
      const para = new Paragraph();
      para.addText('Click ');
      const link = Hyperlink.createExternal('https://example.com', 'here');
      para.addHyperlink(link);
      para.addText(' for more');

      expect(para.getText()).toBe('Click here for more');
    });

    test('should handle hyperlink-only paragraph', () => {
      const para = new Paragraph();
      const link = Hyperlink.createExternal('https://example.com', 'Link Text');
      para.addHyperlink(link);

      expect(para.getText()).toBe('Link Text');
    });

    test('should handle multiple hyperlinks and runs', () => {
      const para = new Paragraph();
      para.addText('See ');
      para.addHyperlink(
        Hyperlink.createExternal('https://site1.com', 'site 1')
      );
      para.addText(' and ');
      para.addHyperlink(
        Hyperlink.createExternal('https://site2.com', 'site 2')
      );
      para.addText('.');

      expect(para.getText()).toBe('See site 1 and site 2.');
    });

    test('should handle hyperlink before runs', () => {
      const para = new Paragraph();
      para.addHyperlink(
        Hyperlink.createExternal('https://example.com', 'Link')
      );
      para.addText(' followed by text');

      expect(para.getText()).toBe('Link followed by text');
    });

    test('should handle internal hyperlinks in getText', () => {
      const para = new Paragraph();
      para.addText('Go to ');
      para.addHyperlink(Hyperlink.createInternal('Section1', 'Section 1'));
      para.addText('.');

      expect(para.getText()).toBe('Go to Section 1.');
    });
  });

  describe('Formatting methods', () => {
    test('should set alignment', () => {
      const para = new Paragraph();
      para.setAlignment('center');
      expect(para.getFormatting().alignment).toBe('center');
    });

    test('should set left indent', () => {
      const para = new Paragraph();
      para.setLeftIndent(720); // 0.5 inch
      expect(para.getFormatting().indentation?.left).toBe(720);
    });

    test('should set right indent', () => {
      const para = new Paragraph();
      para.setRightIndent(360);
      expect(para.getFormatting().indentation?.right).toBe(360);
    });

    test('should set first line indent', () => {
      const para = new Paragraph();
      para.setFirstLineIndent(720);
      expect(para.getFormatting().indentation?.firstLine).toBe(720);
    });

    test('should set space before', () => {
      const para = new Paragraph();
      para.setSpaceBefore(240);
      expect(para.getFormatting().spacing?.before).toBe(240);
    });

    test('should set space after', () => {
      const para = new Paragraph();
      para.setSpaceAfter(240);
      expect(para.getFormatting().spacing?.after).toBe(240);
    });

    test('should set line spacing', () => {
      const para = new Paragraph();
      para.setLineSpacing(360, 'exact');
      expect(para.getFormatting().spacing?.line).toBe(360);
      expect(para.getFormatting().spacing?.lineRule).toBe('exact');
    });

    test('should set style', () => {
      const para = new Paragraph();
      para.setStyle('Heading1');
      expect(para.getFormatting().style).toBe('Heading1');
    });

    test('should set keep next', () => {
      const para = new Paragraph();
      para.setKeepNext();
      expect(para.getFormatting().keepNext).toBe(true);
    });

    test('should set keep lines', () => {
      const para = new Paragraph();
      para.setKeepLines();
      expect(para.getFormatting().keepLines).toBe(true);
    });

    test('should set page break before', () => {
      const para = new Paragraph();
      para.setPageBreakBefore();
      expect(para.getFormatting().pageBreakBefore).toBe(true);
    });
  });

  describe('Method chaining', () => {
    test('should support method chaining', () => {
      const para = new Paragraph()
        .setAlignment('center')
        .setSpaceBefore(240)
        .setSpaceAfter(240)
        .addText('Centered text');

      const formatting = para.getFormatting();
      expect(formatting.alignment).toBe('center');
      expect(formatting.spacing?.before).toBe(240);
      expect(formatting.spacing?.after).toBe(240);
      expect(para.getText()).toBe('Centered text');
    });
  });

  describe('XML generation', () => {
    test('should generate basic XML', () => {
      const para = new Paragraph();
      para.addText('Hello');
      const xml = para.toXML();

      expect(xml.name).toBe('w:p');
      expect(xml.children).toBeDefined();
    });

    test('should generate XML with empty run if no text', () => {
      const para = new Paragraph();
      const xml = para.toXML();

      const builder = new XMLBuilder();
      builder.element(xml.name, xml.attributes, xml.children);
      const xmlStr = builder.build();

      expect(xmlStr).toContain('<w:r>');
    });

    test('should generate XML with alignment', () => {
      const para = new Paragraph();
      para.setAlignment('center');
      para.addText('Centered');
      const xml = para.toXML();

      const builder = new XMLBuilder();
      builder.element(xml.name, xml.attributes, xml.children);
      const xmlStr = builder.build();

      expect(xmlStr).toContain('<w:jc w:val="center"/>');
    });

    test('should generate XML with multiple formatted runs', () => {
      const para = new Paragraph();
      para.addText('Normal ');
      para.addText('Bold', { bold: true });
      para.addText(' Italic', { italic: true });

      const xml = para.toXML();
      const builder = new XMLBuilder();
      builder.element(xml.name, xml.attributes, xml.children);
      const xmlStr = builder.build();

      expect(xmlStr).toContain('Normal');
      expect(xmlStr).toContain('Bold');
      expect(xmlStr).toContain('Italic');
      // Accept both <w:b/> and <w:b w:val="1"/> (both are valid per ECMA-376)
      expect(xmlStr).toMatch(/<w:b(\s+w:val="1")?\/?>/);
      expect(xmlStr).toMatch(/<w:i(\s+w:val="1")?\/?>/);
    });
  });

  describe('Static methods', () => {
    test('should create paragraph with static method', () => {
      const para = Paragraph.create({ alignment: 'center' });
      expect(para.getFormatting().alignment).toBe('center');
    });
  });

  describe('Detached paragraphs', () => {
    describe('Paragraph.create()', () => {
      test('should create empty detached paragraph', () => {
        const para = Paragraph.create();
        expect(para).toBeInstanceOf(Paragraph);
        expect(para.getText()).toBe('');
        expect(para.getContent()).toHaveLength(0);
      });

      test('should create detached paragraph with text', () => {
        const para = Paragraph.create('Hello World');
        expect(para.getText()).toBe('Hello World');
        expect(para.getRuns()).toHaveLength(1);
      });

      test('should create detached paragraph with text and formatting', () => {
        const para = Paragraph.create('Centered Text', { alignment: 'center' });
        expect(para.getText()).toBe('Centered Text');
        expect(para.getFormatting().alignment).toBe('center');
      });

      test('should create detached paragraph with just formatting', () => {
        const para = Paragraph.create({
          alignment: 'right',
          style: 'Heading1',
        });
        expect(para.getText()).toBe('');
        expect(para.getFormatting().alignment).toBe('right');
        expect(para.getStyle()).toBe('Heading1');
      });

      test('should support method chaining after creation', () => {
        const para = Paragraph.create('Initial')
          .addText(' text', { bold: true })
          .setAlignment('justify')
          .setSpaceBefore(240);

        expect(para.getText()).toBe('Initial text');
        expect(para.getRuns()).toHaveLength(2);
        expect(para.getFormatting().alignment).toBe('justify');
        expect(para.getFormatting().spacing?.before).toBe(240);
      });
    });

    describe('Paragraph.createWithStyle()', () => {
      test('should create detached paragraph with style', () => {
        const para = Paragraph.createWithStyle('Heading Text', 'Heading1');
        expect(para.getText()).toBe('Heading Text');
        expect(para.getStyle()).toBe('Heading1');
      });

      test('should support method chaining with styled paragraph', () => {
        const para = Paragraph.createWithStyle('Title', 'Title')
          .setAlignment('center')
          .addText(' - Subtitle', { italic: true });

        expect(para.getText()).toBe('Title - Subtitle');
        expect(para.getStyle()).toBe('Title');
        expect(para.getFormatting().alignment).toBe('center');
      });
    });

    describe('Paragraph.createEmpty()', () => {
      test('should create empty detached paragraph', () => {
        const para = Paragraph.createEmpty();
        expect(para.getText()).toBe('');
        expect(para.getContent()).toHaveLength(0);
      });

      test('should allow adding content after creation', () => {
        const para = Paragraph.createEmpty()
          .addText('Added later')
          .setAlignment('center');

        expect(para.getText()).toBe('Added later');
        expect(para.getFormatting().alignment).toBe('center');
      });
    });

    describe('Paragraph.createFormatted()', () => {
      test('should create detached paragraph with run and paragraph formatting', () => {
        const para = Paragraph.createFormatted(
          'Important Text',
          { bold: true, color: 'FF0000' },
          { alignment: 'center' }
        );

        expect(para.getText()).toBe('Important Text');
        expect(para.getFormatting().alignment).toBe('center');

        const run = para.getRuns()[0];
        expect(run).toBeDefined();
        expect(run!.getFormatting().bold).toBe(true);
        expect(run!.getFormatting().color).toBe('FF0000');
      });

      test('should work without paragraph formatting', () => {
        const para = Paragraph.createFormatted('Bold Text', { bold: true });

        expect(para.getText()).toBe('Bold Text');
        const run = para.getRuns()[0];
        expect(run).toBeDefined();
        expect(run!.getFormatting().bold).toBe(true);
      });

      test('should work without run formatting', () => {
        const para = Paragraph.createFormatted('Plain Text', undefined, {
          alignment: 'right',
        });

        expect(para.getText()).toBe('Plain Text');
        expect(para.getFormatting().alignment).toBe('right');
      });
    });

    describe('Complex detached paragraph scenarios', () => {
      test('should build complex paragraph with multiple runs', () => {
        const para = Paragraph.create()
          .addText('Normal ', {})
          .addText('bold ', { bold: true })
          .addText('italic ', { italic: true })
          .addText('both', { bold: true, italic: true })
          .setAlignment('justify');

        expect(para.getText()).toBe('Normal bold italic both');
        expect(para.getRuns()).toHaveLength(4);
        expect(para.getFormatting().alignment).toBe('justify');
      });

      test('should clone detached paragraph', () => {
        const original = Paragraph.create('Original Text', {
          alignment: 'center',
        });
        const clone = original.clone();

        // Verify clone has same content
        expect(clone.getText()).toBe('Original Text');
        expect(clone.getFormatting().alignment).toBe('center');

        // Verify they are independent
        clone.addText(' - Modified');
        expect(original.getText()).toBe('Original Text');
        expect(clone.getText()).toBe('Original Text - Modified');
      });

      test('should set complex formatting on detached paragraph', () => {
        const para = Paragraph.create()
          .addText('Complex Paragraph')
          .setAlignment('center')
          .setLeftIndent(720)
          .setRightIndent(720)
          .setSpaceBefore(240)
          .setSpaceAfter(240)
          .setLineSpacing(360, 'exact')
          .setKeepNext(true)
          .setKeepLines(true);

        const formatting = para.getFormatting();
        expect(formatting.alignment).toBe('center');
        expect(formatting.indentation?.left).toBe(720);
        expect(formatting.indentation?.right).toBe(720);
        expect(formatting.spacing?.before).toBe(240);
        expect(formatting.spacing?.after).toBe(240);
        expect(formatting.spacing?.line).toBe(360);
        expect(formatting.spacing?.lineRule).toBe('exact');
        expect(formatting.keepNext).toBe(true);
        expect(formatting.keepLines).toBe(true);
      });

      test('should generate proper XML from detached paragraph', () => {
        const para = Paragraph.create('Test Content', { alignment: 'center' });
        const xml = para.toXML();

        expect(xml.name).toBe('w:p');
        expect(xml.children).toBeDefined();

        // Should have paragraph properties and at least one run
        const children = xml.children || [];
        expect(children.length).toBeGreaterThan(0);
      });
    });

    describe('Style application with formatting control', () => {
      test('should clear all direct run formatting', () => {
        const para = new Paragraph();
        para.addText('Bold text', {
          bold: true,
          color: 'FF0000',
          font: 'Arial',
        });
        para.addText('Italic text', { italic: true, size: 14 });

        // Clear all formatting
        para.clearDirectRunFormatting();

        const runs = para.getRuns();
        expect(runs[0]!.getFormatting().bold).toBeUndefined();
        expect(runs[0]!.getFormatting().color).toBeUndefined();
        expect(runs[0]!.getFormatting().font).toBeUndefined();
        expect(runs[1]!.getFormatting().italic).toBeUndefined();
        expect(runs[1]!.getFormatting().size).toBeUndefined();

        // Text should be preserved
        expect(runs[0]!.getText()).toBe('Bold text');
        expect(runs[1]!.getText()).toBe('Italic text');
      });

      test('should clear only specified run properties', () => {
        const para = new Paragraph();
        para.addText('Formatted', {
          bold: true,
          color: 'FF0000',
          font: 'Arial',
          size: 14,
        });

        // Clear only font and color
        para.clearDirectRunFormatting(['font', 'color']);

        const run = para.getRuns()[0]!;
        expect(run.getFormatting().font).toBeUndefined();
        expect(run.getFormatting().color).toBeUndefined();
        // Bold and size should remain
        expect(run.getFormatting().bold).toBe(true);
        expect(run.getFormatting().size).toBe(14);
      });

      test('should apply style and clear all formatting', () => {
        const para = new Paragraph();
        para.addText('Text with formatting', {
          bold: true,
          italic: true,
          color: 'FF0000',
        });

        // Apply style and clear all formatting
        para.applyStyleAndClearFormatting('Heading1', []);

        expect(para.getStyle()).toBe('Heading1');
        const run = para.getRuns()[0]!;
        expect(run.getFormatting().bold).toBeUndefined();
        expect(run.getFormatting().italic).toBeUndefined();
        expect(run.getFormatting().color).toBeUndefined();
      });

      test('should apply style and clear specific properties', () => {
        const para = new Paragraph();
        para.addText('Text', { bold: true, color: 'FF0000', font: 'Arial' });

        // Apply style and clear only font
        para.applyStyleAndClearFormatting('Normal', ['font']);

        expect(para.getStyle()).toBe('Normal');
        const run = para.getRuns()[0]!;
        expect(run.getFormatting().font).toBeUndefined();
        // Bold and color should remain
        expect(run.getFormatting().bold).toBe(true);
        expect(run.getFormatting().color).toBe('FF0000');
      });

      test('should apply style without clearing formatting when not specified', () => {
        const para = new Paragraph();
        para.addText('Text', { bold: true, color: 'FF0000' });

        // Apply style without clearing (overlay style)
        para.applyStyleAndClearFormatting('Title');

        expect(para.getStyle()).toBe('Title');
        const run = para.getRuns()[0]!;
        // Formatting should be preserved
        expect(run.getFormatting().bold).toBe(true);
        expect(run.getFormatting().color).toBe('FF0000');
      });

      test('should handle paragraph with multiple runs', () => {
        const para = new Paragraph();
        para.addText('Bold ', { bold: true });
        para.addText('Italic ', { italic: true });
        para.addText('Underline', { underline: true });

        para.clearDirectRunFormatting();

        const runs = para.getRuns();
        expect(runs.length).toBe(3);
        expect(runs[0]!.getFormatting().bold).toBeUndefined();
        expect(runs[1]!.getFormatting().italic).toBeUndefined();
        expect(runs[2]!.getFormatting().underline).toBeUndefined();

        // Text should be preserved
        expect(runs[0]!.getText()).toBe('Bold ');
        expect(runs[1]!.getText()).toBe('Italic ');
        expect(runs[2]!.getText()).toBe('Underline');
      });

      test('should support method chaining', () => {
        const para = new Paragraph();
        para
          .addText('Text', { bold: true, color: 'FF0000' })
          .setStyle('Heading1')
          .clearDirectRunFormatting(['color'])
          .setAlignment('center');

        expect(para.getStyle()).toBe('Heading1');
        expect(para.getFormatting().alignment).toBe('center');
        const run = para.getRuns()[0]!;
        expect(run.getFormatting().color).toBeUndefined();
        expect(run.getFormatting().bold).toBe(true);
      });
    });

    describe('Property conflict resolution', () => {
      test('should clear pageBreakBefore when keepNext is set', () => {
        const para = new Paragraph();
        para.setPageBreakBefore(true);

        // Setting keepNext should clear the conflicting pageBreakBefore
        para.setKeepNext(true);

        const formatting = para.getFormatting();
        expect(formatting.keepNext).toBe(true);
        expect(formatting.pageBreakBefore).toBe(false);
      });

      test('should clear pageBreakBefore when keepLines is set', () => {
        const para = new Paragraph();
        para.setPageBreakBefore(true);

        // Setting keepLines should clear the conflicting pageBreakBefore
        para.setKeepLines(true);

        const formatting = para.getFormatting();
        expect(formatting.keepLines).toBe(true);
        expect(formatting.pageBreakBefore).toBe(false);
      });

      test('should not affect pageBreakBefore when keepNext is set to false', () => {
        const para = new Paragraph();
        para.setPageBreakBefore(true);

        // Setting keepNext to false should not affect pageBreakBefore
        para.setKeepNext(false);

        const formatting = para.getFormatting();
        expect(formatting.keepNext).toBe(false);
        expect(formatting.pageBreakBefore).toBe(true);
      });

      test('should work with method chaining', () => {
        const para = new Paragraph()
          .setPageBreakBefore(true)
          .setKeepNext(true) // Should clear pageBreakBefore
          .setKeepLines(true); // pageBreakBefore already cleared

        const formatting = para.getFormatting();
        expect(formatting.keepNext).toBe(true);
        expect(formatting.keepLines).toBe(true);
        expect(formatting.pageBreakBefore).toBe(false);
      });

      test('should work when keepNext/keepLines are set first', () => {
        const para = new Paragraph()
          .setKeepNext(true)
          .setKeepLines(true)
          .setPageBreakBefore(true); // This can be set after

        // User explicitly set pageBreakBefore after keepNext/keepLines
        const formatting = para.getFormatting();
        expect(formatting.pageBreakBefore).toBe(true);
        expect(formatting.keepNext).toBe(true);
        expect(formatting.keepLines).toBe(true);

        // But if keepNext is set again, pageBreakBefore should be cleared
        para.setKeepNext(true);
        const formatting2 = para.getFormatting();
        expect(formatting2.keepNext).toBe(true);
        expect(formatting2.pageBreakBefore).toBe(false);
      });

      test('should produce correct XML without conflicting properties', () => {
        const para = new Paragraph()
          .addText('Content')
          .setPageBreakBefore(true)
          .setKeepNext(true) // Clears pageBreakBefore
          .setKeepLines(true);

        const xmlElement = para.toXML();
        const builder = new XMLBuilder();
        builder.element(
          xmlElement.name,
          xmlElement.attributes,
          xmlElement.children
        );
        const xml = builder.build();

        // Should have keepNext and keepLines
        expect(xml).toContain('<w:keepNext/>');
        expect(xml).toContain('<w:keepLines/>');

        // Should NOT have pageBreakBefore
        expect(xml).not.toContain('<w:pageBreakBefore/>');
      });

      test('should handle conflicts in constructor formatting', () => {
        const para = new Paragraph({
          pageBreakBefore: true,
          keepNext: false,
          keepLines: false,
        });

        // Set keepNext after construction
        para.setKeepNext(true);

        const formatting = para.getFormatting();
        expect(formatting.keepNext).toBe(true);
        expect(formatting.pageBreakBefore).toBe(false);
      });
    });

    describe('getRuns with nested content', () => {
      test('should return runs from inside revisions', () => {
        const para = new Paragraph();
        const run = new Run('Inserted text', { bold: true });

        // Create an insertion revision containing the run
        const revision = Revision.createInsertion('Test Author', run);
        para.addRevision(revision);

        // getRuns should find the run inside the revision
        const runs = para.getRuns();
        expect(runs.length).toBe(1);
        expect(runs[0]!.getText()).toBe('Inserted text');
        expect(runs[0]!.getFormatting().bold).toBe(true);
      });

      test('should return runs from inside hyperlinks', () => {
        const para = new Paragraph();
        para.addHyperlink('https://example.com').setText('Click here');

        // getRuns should find the run inside the hyperlink
        const runs = para.getRuns();
        expect(runs.length).toBe(1);
        expect(runs[0]!.getText()).toBe('Click here');
      });

      test('should allow formatting runs inside revisions', () => {
        const para = new Paragraph();
        const run = new Run('Test text');
        const revision = Revision.createInsertion('Test Author', run);
        para.addRevision(revision);

        // Get the run and modify its formatting
        const runs = para.getRuns();
        expect(runs.length).toBe(1);

        runs[0]!.setFont('Verdana');
        runs[0]!.setSize(8);
        runs[0]!.setBold(true);

        // Verify formatting was applied
        expect(runs[0]!.getFormatting().font).toBe('Verdana');
        expect(runs[0]!.getFormatting().size).toBe(8);
        expect(runs[0]!.getFormatting().bold).toBe(true);
      });

      test('should combine direct runs, revision runs, and hyperlink runs', () => {
        const para = new Paragraph();

        // Add a direct run
        para.addText('Direct run');

        // Add a revision containing a run
        const revisionRun = new Run('Revision run');
        const revision = Revision.createInsertion('Author', revisionRun);
        para.addRevision(revision);

        // Add a hyperlink (contains a run)
        para.addHyperlink('https://example.com').setText('Link text');

        // getRuns should return all 3 runs
        const runs = para.getRuns();
        expect(runs.length).toBe(3);
        expect(runs[0]!.getText()).toBe('Direct run');
        expect(runs[1]!.getText()).toBe('Revision run');
        expect(runs[2]!.getText()).toBe('Link text');
      });
    });
  });
});
