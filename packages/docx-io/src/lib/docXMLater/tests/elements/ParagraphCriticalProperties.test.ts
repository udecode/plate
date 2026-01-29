/**
 * Tests for Paragraph Critical Properties (Phase 4.2 Batch 1)
 * Tests 8 critical paragraph properties with full round-trip verification
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';

describe('Paragraph - Critical Properties (Batch 1)', () => {
  /**
   * Test 1: widowControl property
   */
  describe('widowControl', () => {
    it('should set and serialize widowControl=true', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with widow control enabled');
      para.setWidowControl(true);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.widowControl).toBe(true);
    });

    it('should set and serialize widowControl=false', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with widow control disabled');
      para.setWidowControl(false);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.widowControl).toBe(false);
    });

    it('should handle undefined widowControl', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with default widow control');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.widowControl).toBeUndefined();
    });
  });

  /**
   * Test 2: outlineLevel property
   */
  describe('outlineLevel', () => {
    it('should set and serialize outlineLevel=0 (highest level)', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Heading 1');
      para.setOutlineLevel(0);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.outlineLevel).toBe(0);
    });

    it('should set and serialize outlineLevel=5 (mid-level)', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Heading 6');
      para.setOutlineLevel(5);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.outlineLevel).toBe(5);
    });

    it('should set and serialize outlineLevel=9 (lowest level)', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Deep heading');
      para.setOutlineLevel(9);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.outlineLevel).toBe(9);
    });

    it('should reject outline level < 0', () => {
      const para = new Paragraph();
      expect(() => para.setOutlineLevel(-1)).toThrow(
        'Outline level must be between 0 and 9'
      );
    });

    it('should reject outline level > 9', () => {
      const para = new Paragraph();
      expect(() => para.setOutlineLevel(10)).toThrow(
        'Outline level must be between 0 and 9'
      );
    });
  });

  /**
   * Test 3: suppressLineNumbers property
   */
  describe('suppressLineNumbers', () => {
    it('should set and serialize suppressLineNumbers=true', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph without line numbers');
      para.setSuppressLineNumbers(true);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.suppressLineNumbers).toBe(true);
    });

    it('should handle default suppressLineNumbers', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Normal paragraph');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.suppressLineNumbers).toBeUndefined();
    });
  });

  /**
   * Test 4: bidi (bidirectional) property
   */
  describe('bidi', () => {
    it('should set and serialize bidi=true (RTL layout)', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('مرحبا بك في العالم'); // Arabic text
      para.setBidi(true);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.bidi).toBe(true);
    });

    it('should set and serialize bidi=false (LTR layout)', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Hello World');
      para.setBidi(false);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.bidi).toBe(false);
    });

    it('should handle mixed LTR and RTL text', async () => {
      const doc = Document.create();
      const para1 = new Paragraph();
      para1.addText('English text');
      para1.setBidi(false);

      const para2 = new Paragraph();
      para2.addText('שלום עולם'); // Hebrew text
      para2.setBidi(true);

      doc.addParagraph(para1);
      doc.addParagraph(para2);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      expect(loaded.getParagraphs()[0]!.formatting.bidi).toBe(false);
      expect(loaded.getParagraphs()[1]!.formatting.bidi).toBe(true);
    });
  });

  /**
   * Test 5: textDirection property
   */
  describe('textDirection', () => {
    it('should set and serialize textDirection=lrTb (left-to-right, top-to-bottom)', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('English text');
      para.setTextDirection('lrTb');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.textDirection).toBe('lrTb');
    });

    it('should set and serialize textDirection=tbRl (vertical text)', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('縦書き'); // Japanese vertical text
      para.setTextDirection('tbRl');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.textDirection).toBe('tbRl');
    });

    it('should set and serialize textDirection=btLr (Mongolian)', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('ᠮᠣᠩᠭᠣᠯ'); // Mongolian text
      para.setTextDirection('btLr');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.textDirection).toBe('btLr');
    });

    it('should handle all text direction values', async () => {
      const doc = Document.create();
      const directions: (
        | 'lrTb'
        | 'tbRl'
        | 'btLr'
        | 'lrTbV'
        | 'tbRlV'
        | 'tbLrV'
      )[] = ['lrTb', 'tbRl', 'btLr', 'lrTbV', 'tbRlV', 'tbLrV'];

      for (const direction of directions) {
        const para = new Paragraph();
        para.addText(`Text with direction: ${direction}`);
        para.setTextDirection(direction);
        doc.addParagraph(para);
      }

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify all directions
      const paragraphs = loaded.getParagraphs();
      expect(paragraphs.length).toBe(6);
      for (let i = 0; i < directions.length; i++) {
        expect(paragraphs[i]!.formatting.textDirection).toBe(directions[i]);
      }
    });
  });

  /**
   * Test 6: textAlignment property
   */
  describe('textAlignment', () => {
    it('should set and serialize textAlignment=top', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Top-aligned text');
      para.setTextAlignment('top');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.textAlignment).toBe('top');
    });

    it('should set and serialize textAlignment=center', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Center-aligned text');
      para.setTextAlignment('center');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.textAlignment).toBe('center');
    });

    it('should handle all text alignment values', async () => {
      const doc = Document.create();
      const alignments: ('top' | 'center' | 'baseline' | 'bottom' | 'auto')[] =
        ['top', 'center', 'baseline', 'bottom', 'auto'];

      for (const alignment of alignments) {
        const para = new Paragraph();
        para.addText(`Text with alignment: ${alignment}`);
        para.setTextAlignment(alignment);
        doc.addParagraph(para);
      }

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify all alignments
      const paragraphs = loaded.getParagraphs();
      expect(paragraphs.length).toBe(5);
      for (let i = 0; i < alignments.length; i++) {
        expect(paragraphs[i]!.formatting.textAlignment).toBe(alignments[i]);
      }
    });
  });

  /**
   * Test 7: mirrorIndents property
   */
  describe('mirrorIndents', () => {
    it('should set and serialize mirrorIndents=true', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with mirror indents for double-sided printing');
      para.setMirrorIndents(true);
      para.setLeftIndent(720); // Will become inside indent
      para.setRightIndent(360); // Will become outside indent

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.mirrorIndents).toBe(true);
      expect(loadedPara.formatting.indentation?.left).toBe(720);
      expect(loadedPara.formatting.indentation?.right).toBe(360);
    });

    it('should handle default mirrorIndents', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Normal indents');
      para.setLeftIndent(720);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.mirrorIndents).toBeUndefined();
      expect(loadedPara.formatting.indentation?.left).toBe(720);
    });
  });

  /**
   * Test 8: adjustRightInd property
   */
  describe('adjustRightInd', () => {
    it('should set and serialize adjustRightInd=true', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with auto-adjusted right indent');
      para.setAdjustRightInd(true);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.adjustRightInd).toBe(true);
    });

    it('should set and serialize adjustRightInd=false', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph without auto-adjusted right indent');
      para.setAdjustRightInd(false);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.adjustRightInd).toBe(false);
    });
  });

  /**
   * Combined test: Multiple properties together
   */
  describe('combined properties', () => {
    it('should handle multiple critical properties together', async () => {
      const doc = Document.create();

      const para = new Paragraph();
      para.addText('Complex paragraph with all Batch 1 properties');
      para.setWidowControl(false);
      para.setOutlineLevel(2);
      para.setSuppressLineNumbers(true);
      para.setBidi(true);
      para.setTextDirection('tbRl');
      para.setTextAlignment('center');
      para.setMirrorIndents(true);
      para.setAdjustRightInd(true);

      // Also add some existing properties
      para.setAlignment('center');
      para.setSpaceBefore(240);
      para.setLeftIndent(720);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify all properties
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.widowControl).toBe(false);
      expect(loadedPara.formatting.outlineLevel).toBe(2);
      expect(loadedPara.formatting.suppressLineNumbers).toBe(true);
      expect(loadedPara.formatting.bidi).toBe(true);
      expect(loadedPara.formatting.textDirection).toBe('tbRl');
      expect(loadedPara.formatting.textAlignment).toBe('center');
      expect(loadedPara.formatting.mirrorIndents).toBe(true);
      expect(loadedPara.formatting.adjustRightInd).toBe(true);

      // Existing properties
      expect(loadedPara.formatting.alignment).toBe('center');
      expect(loadedPara.formatting.spacing?.before).toBe(240);
      expect(loadedPara.formatting.indentation?.left).toBe(720);
    });

    it('should preserve all properties across multiple save/load cycles', async () => {
      const doc = Document.create();

      const para = new Paragraph();
      para.addText('Paragraph for multiple save/load test');
      para.setOutlineLevel(1);
      para.setBidi(true);
      para.setTextDirection('tbRl');
      para.setMirrorIndents(true);

      doc.addParagraph(para);

      // First cycle
      const buffer1 = await doc.toBuffer();
      const loaded1 = await Document.loadFromBuffer(buffer1);

      // Second cycle
      const buffer2 = await loaded1.toBuffer();
      const loaded2 = await Document.loadFromBuffer(buffer2);

      // Third cycle
      const buffer3 = await loaded2.toBuffer();
      const loaded3 = await Document.loadFromBuffer(buffer3);

      // Verify after 3 cycles
      const loadedPara = loaded3.getParagraphs()[0]!;
      expect(loadedPara.formatting.outlineLevel).toBe(1);
      expect(loadedPara.formatting.bidi).toBe(true);
      expect(loadedPara.formatting.textDirection).toBe('tbRl');
      expect(loadedPara.formatting.mirrorIndents).toBe(true);
    });
  });
});
