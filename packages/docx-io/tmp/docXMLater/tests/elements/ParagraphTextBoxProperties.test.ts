/**
 * Tests for Paragraph Text Box & Advanced Properties (Phase 4.2 Batch 3)
 * Tests 5 text box and advanced paragraph properties with full round-trip verification
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';

describe('Paragraph - Text Box & Advanced Properties (Batch 3)', () => {
  /**
   * Test 1: framePr (Text Frame Properties)
   */
  describe('framePr (Text Frame Properties)', () => {
    it('should set and serialize basic frame properties (w, h, hRule)', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Text in a frame');
      para.setFrameProperties({
        w: 2880, // 2 inches
        h: 1440, // 1 inch
        hRule: 'exact'
      });

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.framePr).toBeDefined();
      expect(loadedPara.formatting.framePr!.w).toBe(2880);
      expect(loadedPara.formatting.framePr!.h).toBe(1440);
      expect(loadedPara.formatting.framePr!.hRule).toBe('exact');
    });

    it('should set and serialize positioning properties (x, y, anchors)', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Positioned frame');
      para.setFrameProperties({
        x: 720,  // 0.5 inch from anchor
        y: 1440, // 1 inch from anchor
        hAnchor: 'page',
        vAnchor: 'text',
        xAlign: 'left',
        yAlign: 'top'
      });

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.framePr).toBeDefined();
      expect(loadedPara.formatting.framePr!.x).toBe(720);
      expect(loadedPara.formatting.framePr!.y).toBe(1440);
      expect(loadedPara.formatting.framePr!.hAnchor).toBe('page');
      expect(loadedPara.formatting.framePr!.vAnchor).toBe('text');
      expect(loadedPara.formatting.framePr!.xAlign).toBe('left');
      expect(loadedPara.formatting.framePr!.yAlign).toBe('top');
    });

    it('should set and serialize drop cap properties', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('D');
      para.setFrameProperties({
        dropCap: 'drop',
        lines: 3,
        w: 720,
        h: 720
      });

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.framePr).toBeDefined();
      expect(loadedPara.formatting.framePr!.dropCap).toBe('drop');
      expect(loadedPara.formatting.framePr!.lines).toBe(3);
    });

    it('should set and serialize all frame properties combined', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Complex frame');
      para.setFrameProperties({
        w: 2880,
        h: 1440,
        hRule: 'atLeast',
        x: 720,
        y: 1440,
        xAlign: 'center',
        yAlign: 'center',
        hAnchor: 'margin',
        vAnchor: 'margin',
        hSpace: 180,
        vSpace: 180,
        wrap: 'around',
        anchorLock: true
      });

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify all properties
      const loadedPara = loaded.getParagraphs()[0]!;
      const frame = loadedPara.formatting.framePr!;
      expect(frame).toBeDefined();
      expect(frame.w).toBe(2880);
      expect(frame.h).toBe(1440);
      expect(frame.hRule).toBe('atLeast');
      expect(frame.x).toBe(720);
      expect(frame.y).toBe(1440);
      expect(frame.xAlign).toBe('center');
      expect(frame.yAlign).toBe('center');
      expect(frame.hAnchor).toBe('margin');
      expect(frame.vAnchor).toBe('margin');
      expect(frame.hSpace).toBe(180);
      expect(frame.vSpace).toBe(180);
      expect(frame.wrap).toBe('around');
      expect(frame.anchorLock).toBe(true);
    });

    it('should handle undefined framePr', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('No frame properties');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.framePr).toBeUndefined();
    });
  });

  /**
   * Test 2: suppressAutoHyphens
   */
  describe('suppressAutoHyphens', () => {
    it('should set and serialize suppressAutoHyphens=true', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph with hyphenation suppressed');
      para.setSuppressAutoHyphens(true);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.suppressAutoHyphens).toBe(true);
    });

    it('should handle default (undefined) suppressAutoHyphens', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Normal hyphenation');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.suppressAutoHyphens).toBeUndefined();
    });
  });

  /**
   * Test 3: suppressOverlap
   */
  describe('suppressOverlap', () => {
    it('should set and serialize suppressOverlap=true', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Paragraph preventing frame overlap');
      para.setSuppressOverlap(true);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.suppressOverlap).toBe(true);
    });

    it('should handle default (undefined) suppressOverlap', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Normal overlap behavior');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.suppressOverlap).toBeUndefined();
    });
  });

  /**
   * Test 4: textboxTightWrap
   */
  describe('textboxTightWrap', () => {
    it('should set and serialize textboxTightWrap=none', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('No tight wrapping');
      para.setTextboxTightWrap('none');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.textboxTightWrap).toBe('none');
    });

    it('should set and serialize textboxTightWrap=allLines', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Tight wrap all lines');
      para.setTextboxTightWrap('allLines');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.textboxTightWrap).toBe('allLines');
    });

    it('should set and serialize textboxTightWrap=firstAndLastLine', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Tight wrap first and last');
      para.setTextboxTightWrap('firstAndLastLine');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.textboxTightWrap).toBe('firstAndLastLine');
    });

    it('should set and serialize textboxTightWrap=firstLineOnly', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Tight wrap first line');
      para.setTextboxTightWrap('firstLineOnly');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.textboxTightWrap).toBe('firstLineOnly');
    });

    it('should set and serialize textboxTightWrap=lastLineOnly', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Tight wrap last line');
      para.setTextboxTightWrap('lastLineOnly');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.textboxTightWrap).toBe('lastLineOnly');
    });

    it('should handle undefined textboxTightWrap', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Default wrap mode');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.textboxTightWrap).toBeUndefined();
    });
  });

  /**
   * Test 5: divId (HTML div association)
   */
  describe('divId', () => {
    it('should set and serialize divId with positive number', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Associated with div 1234567');
      para.setDivId(1234567);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.divId).toBe(1234567);
    });

    it('should handle divId round-trip with large number', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Large div ID');
      para.setDivId(1785730240);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.divId).toBe(1785730240);
    });

    it('should handle undefined divId', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('No div association');

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.divId).toBeUndefined();
    });
  });

  /**
   * Combined Tests
   */
  describe('Combined Properties', () => {
    it('should handle multiple text box properties together', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Frame with multiple properties');
      para.setFrameProperties({
        w: 2880,
        h: 1440,
        wrap: 'around'
      });
      para.setSuppressAutoHyphens(true);
      para.setSuppressOverlap(true);
      para.setTextboxTightWrap('allLines');
      para.setDivId(999888);

      doc.addParagraph(para);

      // Save and load
      const buffer = await doc.toBuffer();
      const loaded = await Document.loadFromBuffer(buffer);

      // Verify all properties
      const loadedPara = loaded.getParagraphs()[0]!;
      expect(loadedPara.formatting.framePr).toBeDefined();
      expect(loadedPara.formatting.framePr!.w).toBe(2880);
      expect(loadedPara.formatting.framePr!.h).toBe(1440);
      expect(loadedPara.formatting.framePr!.wrap).toBe('around');
      expect(loadedPara.formatting.suppressAutoHyphens).toBe(true);
      expect(loadedPara.formatting.suppressOverlap).toBe(true);
      expect(loadedPara.formatting.textboxTightWrap).toBe('allLines');
      expect(loadedPara.formatting.divId).toBe(999888);
    });

    it('should preserve all properties across multiple save/load cycles', async () => {
      let doc = Document.create();
      const para = new Paragraph();
      para.addText('Multi-cycle test');
      para.setFrameProperties({ w: 1440, h: 720, hRule: 'auto' });
      para.setSuppressAutoHyphens(true);
      para.setTextboxTightWrap('firstAndLastLine');
      para.setDivId(123456);

      doc.addParagraph(para);

      // Cycle 1: Save and load
      let buffer = await doc.toBuffer();
      doc = await Document.loadFromBuffer(buffer);

      // Cycle 2: Save and load again
      buffer = await doc.toBuffer();
      doc = await Document.loadFromBuffer(buffer);

      // Cycle 3: Save and load one more time
      buffer = await doc.toBuffer();
      const final = await Document.loadFromBuffer(buffer);

      // Verify all properties survived 3 cycles
      const loadedPara = final.getParagraphs()[0]!;
      expect(loadedPara.formatting.framePr!.w).toBe(1440);
      expect(loadedPara.formatting.framePr!.h).toBe(720);
      expect(loadedPara.formatting.framePr!.hRule).toBe('auto');
      expect(loadedPara.formatting.suppressAutoHyphens).toBe(true);
      expect(loadedPara.formatting.textboxTightWrap).toBe('firstAndLastLine');
      expect(loadedPara.formatting.divId).toBe(123456);
    });
  });
});
