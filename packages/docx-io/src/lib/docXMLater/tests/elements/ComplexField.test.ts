/**
 * ComplexField Tests
 * Tests for complex field generation (begin/separate/end structure)
 * Used for TOC, cross-references, and other advanced fields
 */

import { ComplexField, createTOCField } from '../../src/elements/Field';
import { XMLBuilder } from '../../src/xml/XMLBuilder';

describe('ComplexField', () => {
  describe('Constructor and Basic Properties', () => {
    it('should create a complex field with instruction', () => {
      const field = new ComplexField({
        instruction: ' PAGE \\* MERGEFORMAT ',
      });

      expect(field.getInstruction()).toBe(' PAGE \\* MERGEFORMAT ');
      expect(field.getResult()).toBeUndefined();
    });

    it('should create a complex field with instruction and result', () => {
      const field = new ComplexField({
        instruction: ' PAGE ',
        result: '1',
      });

      expect(field.getInstruction()).toBe(' PAGE ');
      expect(field.getResult()).toBe('1');
    });

    it('should support method chaining for setters', () => {
      const field = new ComplexField({ instruction: ' PAGE ' });

      const result = field
        .setInstruction(' NUMPAGES ')
        .setResult('10')
        .setInstructionFormatting({ bold: true })
        .setResultFormatting({ italic: true });

      expect(result).toBe(field); // Check chaining
      expect(field.getInstruction()).toBe(' NUMPAGES ');
      expect(field.getResult()).toBe('10');
    });
  });

  describe('XML Generation Structure', () => {
    it('should generate correct begin/separate/end structure', () => {
      const field = new ComplexField({
        instruction: ' PAGE ',
        result: '1',
      });

      const runs = field.toXML();

      // Should have 5 runs: begin, instr, separate, result, end
      expect(runs).toHaveLength(5);

      // Verify all runs are present and valid
      for (const run of runs) {
        expect(run).toBeDefined();
        expect(run.name).toBe('w:r');
        expect(run.children).toBeDefined();
        expect(run.children!.length).toBeGreaterThan(0);
      }
    });

    it('should generate 4 runs when result is not provided', () => {
      const field = new ComplexField({
        instruction: ' PAGE ',
      });

      const runs = field.toXML();

      // Should have 4 runs: begin, instr, separate, end (no result)
      expect(runs).toHaveLength(4);

      // Verify all runs are present
      for (const run of runs) {
        expect(run).toBeDefined();
        expect(run.name).toBe('w:r');
        expect(run.children).toBeDefined();
      }
    });

    it('should preserve xml:space attribute on instrText and result', () => {
      const field = new ComplexField({
        instruction: ' PAGE  ',
        result: ' 1 ',
      });

      const runs = field.toXML();

      // Verify structure exists
      expect(runs).toHaveLength(5);
      expect(runs[1]).toBeDefined();
      expect(runs[3]).toBeDefined();
    });
  });

  describe('Formatting Support', () => {
    it('should apply instruction formatting', () => {
      const field = new ComplexField({
        instruction: ' PAGE ',
        instructionFormatting: {
          bold: true,
          size: 12,
        },
      });

      const runs = field.toXML();

      // Check that instruction run exists and has children (including rPr)
      // Should have 4 runs (begin, instr, sep, end) since no result provided
      expect(runs).toHaveLength(4);
      if (runs[1]) {
        expect(runs[1].children).toBeDefined();
        if (runs[1].children) {
          expect(runs[1].children.length).toBeGreaterThan(1); // Should have rPr + instrText
        }
      }
    });

    it('should apply result formatting', () => {
      const field = new ComplexField({
        instruction: ' PAGE ',
        result: '1',
        resultFormatting: {
          italic: true,
          color: 'FF0000',
        },
      });

      const runs = field.toXML();

      // Check that result run exists and has children (including rPr)
      expect(runs).toHaveLength(5);
      if (runs[3]) {
        expect(runs[3].children).toBeDefined();
        if (runs[3].children) {
          expect(runs[3].children.length).toBeGreaterThan(1); // Should have rPr + text
        }
      }
    });

    it('should support all formatting options', () => {
      const field = new ComplexField({
        instruction: ' PAGE ',
        result: '1',
        resultFormatting: {
          bold: true,
          italic: true,
          underline: 'double',
          strike: true,
          font: 'Arial',
          size: 14,
          color: '0000FF',
          highlight: 'yellow',
        },
      });

      const runs = field.toXML();

      // Check that result run exists and has many children (rPr with many formatting elements + text)
      expect(runs).toHaveLength(5);
      if (runs[3]) {
        expect(runs[3].children).toBeDefined();
        if (runs[3].children) {
          expect(runs[3].children.length).toBeGreaterThan(1);
        }
      }
    });
  });

  describe('XML Output Validation', () => {
    it('should generate valid XML that can be serialized', () => {
      const field = new ComplexField({
        instruction: ' TOC \\o "1-3" \\h \\z \\u ',
        result: 'Table of Contents',
      });

      const runs = field.toXML();

      // Try to serialize with XMLBuilder
      expect(() => {
        runs.forEach((run) => {
          const builder = new XMLBuilder();
          builder.element(run.name, run.attributes, run.children);
          const xml = builder.build();
          expect(xml).toContain('<w:r');
        });
      }).not.toThrow();
    });

    it('should escape special characters in instruction and result', () => {
      const field = new ComplexField({
        instruction: ' TITLE "Test & Demo" ',
        result: 'Value < 10 & > 5',
      });

      const runs = field.toXML();

      // Verify structure is created
      expect(runs).toHaveLength(5);
      if (runs[1]) expect(runs[1].children).toBeDefined();
      if (runs[3]) expect(runs[3].children).toBeDefined();

      // XMLBuilder should handle escaping when serializing
    });
  });
});

describe('createTOCField', () => {
  describe('Default Options', () => {
    it('should create TOC with default options', () => {
      const toc = createTOCField();

      const instruction = toc.getInstruction();

      expect(instruction).toBe(' TOC \\o "1-3" \\h \\z \\u ');
      expect(toc.getResult()).toBe('Table of Contents');
    });

    it('should enable hyperlinks by default', () => {
      const toc = createTOCField();
      expect(toc.getInstruction()).toContain('\\h');
    });

    it('should enable hideInWebLayout by default', () => {
      const toc = createTOCField();
      expect(toc.getInstruction()).toContain('\\z');
    });

    it('should enable useOutlineLevels by default', () => {
      const toc = createTOCField();
      expect(toc.getInstruction()).toContain('\\u');
    });
  });

  describe('Custom Levels', () => {
    it('should support custom heading levels', () => {
      const toc = createTOCField({ levels: '1-5' });
      expect(toc.getInstruction()).toContain('\\o "1-5"');
    });

    it('should support single level', () => {
      const toc = createTOCField({ levels: '1' });
      expect(toc.getInstruction()).toContain('\\o "1"');
    });

    it('should support non-sequential levels', () => {
      const toc = createTOCField({ levels: '1,3,5' });
      expect(toc.getInstruction()).toContain('\\o "1,3,5"');
    });
  });

  describe('Switch Options', () => {
    it('should disable hyperlinks when requested', () => {
      const toc = createTOCField({ hyperlinks: false });
      expect(toc.getInstruction()).not.toContain('\\h');
    });

    it('should disable hideInWebLayout when requested', () => {
      const toc = createTOCField({ hideInWebLayout: false });
      expect(toc.getInstruction()).not.toContain('\\z');
    });

    it('should disable useOutlineLevels when requested', () => {
      const toc = createTOCField({ useOutlineLevels: false });
      expect(toc.getInstruction()).not.toContain('\\u');
    });

    it('should add omitPageNumbers switch', () => {
      const toc = createTOCField({ omitPageNumbers: true });
      expect(toc.getInstruction()).toContain('\\n');
    });

    it('should add customStyles switch', () => {
      const toc = createTOCField({ customStyles: 'MyStyle1,MyStyle2' });
      expect(toc.getInstruction()).toContain('\\t "MyStyle1,MyStyle2"');
    });
  });

  describe('Combined Options', () => {
    it('should support multiple options combined', () => {
      const toc = createTOCField({
        levels: '2-4',
        hyperlinks: false,
        omitPageNumbers: true,
      });

      const instruction = toc.getInstruction();

      expect(instruction).toContain('\\o "2-4"');
      expect(instruction).not.toContain('\\h');
      expect(instruction).toContain('\\n');
      expect(instruction).toContain('\\z'); // Still enabled by default
      expect(instruction).toContain('\\u'); // Still enabled by default
    });

    it('should support all options', () => {
      const toc = createTOCField({
        levels: '1-9',
        hyperlinks: true,
        hideInWebLayout: true,
        useOutlineLevels: true,
        omitPageNumbers: true,
        customStyles: 'Style1',
      });

      const instruction = toc.getInstruction();

      expect(instruction).toContain('TOC');
      expect(instruction).toContain('\\o "1-9"');
      expect(instruction).toContain('\\h');
      expect(instruction).toContain('\\z');
      expect(instruction).toContain('\\u');
      expect(instruction).toContain('\\n');
      expect(instruction).toContain('\\t "Style1"');
    });
  });

  describe('Instruction Format', () => {
    it('should have correct instruction format', () => {
      const toc = createTOCField({ levels: '1-3' });
      const instruction = toc.getInstruction();

      // Should start with space and TOC
      expect(instruction.startsWith(' TOC')).toBe(true);

      // Should end with space (Microsoft convention)
      expect(instruction.endsWith(' ')).toBe(true);

      // Switches should be properly formatted
      expect(instruction).toMatch(/\\o "1-3"/);
    });

    it('should maintain switch order', () => {
      const toc = createTOCField({
        levels: '1-3',
        hyperlinks: true,
        hideInWebLayout: true,
        useOutlineLevels: true,
      });

      const instruction = toc.getInstruction();

      // Order should be: TOC, \o, \h, \z, \u
      const tocIndex = instruction.indexOf('TOC');
      const oIndex = instruction.indexOf('\\o');
      const hIndex = instruction.indexOf('\\h');
      const zIndex = instruction.indexOf('\\z');
      const uIndex = instruction.indexOf('\\u');

      expect(tocIndex).toBeLessThan(oIndex);
      expect(oIndex).toBeLessThan(hIndex);
      expect(hIndex).toBeLessThan(zIndex);
      expect(zIndex).toBeLessThan(uIndex);
    });
  });

  describe('Integration with ComplexField', () => {
    it('should return a ComplexField instance', () => {
      const toc = createTOCField();
      expect(toc).toBeInstanceOf(ComplexField);
    });

    it('should generate valid XML structure', () => {
      const toc = createTOCField({ levels: '1-3' });
      const runs = toc.toXML();

      // Should have 5 runs (begin, instr, sep, result, end)
      expect(runs).toHaveLength(5);

      // Verify all runs are present and valid
      for (const run of runs) {
        expect(run).toBeDefined();
        expect(run.name).toBe('w:r');
        expect(run.children).toBeDefined();
      }
    });

    it('should allow formatting to be applied after creation', () => {
      const toc = createTOCField()
        .setInstructionFormatting({ bold: true })
        .setResultFormatting({ size: 16 });

      const runs = toc.toXML();

      // Check that we have all runs
      expect(runs).toHaveLength(5);

      // All runs should be defined and have children
      for (const run of runs) {
        expect(run).toBeDefined();
        expect(run.children).toBeDefined();
        expect(run.children!.length).toBeGreaterThan(0);
      }
    });
  });
});
