/**
 * Tests for Field Types - Phase 4.6
 * Testing all 11 field types with factory methods
 */

import { describe, test, expect } from '@jest/globals';
import { Field } from '../../src/elements/Field';

describe('Field Types - Page Fields', () => {
  test('should create PAGE field', () => {
    const field = Field.createPageNumber();

    expect(field.getType()).toBe('PAGE');
    expect(field.getInstruction()).toContain('PAGE');
    expect(field.getInstruction()).toContain('MERGEFORMAT');
  });

  test('should create NUMPAGES field', () => {
    const field = Field.createTotalPages();

    expect(field.getType()).toBe('NUMPAGES');
    expect(field.getInstruction()).toContain('NUMPAGES');
  });

  test('should create SECTIONPAGES field', () => {
    const field = Field.createSectionPages();

    expect(field.getType()).toBe('SECTIONPAGES');
    expect(field.getInstruction()).toContain('SECTIONPAGES');
  });

  test('should generate XML for page number field', () => {
    const field = Field.createPageNumber({ bold: true });
    const xml = field.toXML();

    expect(xml.name).toBe('w:fldSimple');
    expect(xml.attributes!['w:instr']).toContain('PAGE');
  });
});

describe('Field Types - Reference Fields', () => {
  test('should create REF field with bookmark', () => {
    const field = Field.createRef('bookmark1');

    expect(field.getType()).toBe('REF');
    expect(field.getInstruction()).toContain('REF bookmark1');
    expect(field.getInstruction()).toContain('\\h'); // Default hyperlink format
  });

  test('should create REF field with custom format', () => {
    const field = Field.createRef('bookmark2', '\\p'); // Page number format

    expect(field.getInstruction()).toContain('REF bookmark2');
    expect(field.getInstruction()).toContain('\\p');
  });

  test('should create HYPERLINK field', () => {
    const field = Field.createHyperlink('https://example.com', 'Click here');

    expect(field.getType()).toBe('HYPERLINK');
    expect(field.getInstruction()).toContain('HYPERLINK');
    expect(field.getInstruction()).toContain('https://example.com');
  });

  test('should create HYPERLINK field with tooltip', () => {
    const field = Field.createHyperlink(
      'https://example.com',
      'Link',
      'Visit Example'
    );

    expect(field.getInstruction()).toContain('\\o "Visit Example"');
  });

  test('should create SEQ field', () => {
    const field = Field.createSeq('Figure');

    expect(field.getType()).toBe('SEQ');
    expect(field.getInstruction()).toContain('SEQ Figure');
    expect(field.getInstruction()).toContain('\\* ARABIC');
  });

  test('should create SEQ field with Roman numerals', () => {
    const field = Field.createSeq('Table', '\\* ROMAN');

    expect(field.getInstruction()).toContain('SEQ Table');
    expect(field.getInstruction()).toContain('\\* ROMAN');
  });

  test('should generate XML for REF field', () => {
    const field = Field.createRef('myBookmark');
    const xml = field.toXML();

    expect(xml.name).toBe('w:fldSimple');
    expect(xml.attributes!['w:instr']).toContain('REF myBookmark');
  });
});

describe('Field Types - Document Property Fields', () => {
  test('should create AUTHOR field', () => {
    const field = Field.createAuthor();

    expect(field.getType()).toBe('AUTHOR');
    expect(field.getInstruction()).toContain('AUTHOR');
  });

  test('should create TITLE field', () => {
    const field = Field.createTitle();

    expect(field.getType()).toBe('TITLE');
    expect(field.getInstruction()).toContain('TITLE');
  });

  test('should create FILENAME field', () => {
    const field = Field.createFilename();

    expect(field.getType()).toBe('FILENAME');
    expect(field.getInstruction()).toContain('FILENAME');
  });

  test('should create FILENAME field with path', () => {
    const field = Field.createFilename(true);

    expect(field.getType()).toBe('FILENAMEWITHPATH');
    expect(field.getInstruction()).toContain('FILENAMEWITHPATH');
  });

  test('should create TC entry field', () => {
    const field = Field.createTCEntry('Chapter 1', 1);

    expect(field.getType()).toBe('TC');
    expect(field.getInstruction()).toContain('TC "Chapter 1"');
    expect(field.getInstruction()).toContain('\\l 1');
  });

  test('should create TC entry field with level 3', () => {
    const field = Field.createTCEntry('Section 2', 3);

    expect(field.getInstruction()).toContain('\\l 3');
  });

  test('should throw error for invalid TC level', () => {
    expect(() => Field.createTCEntry('Invalid', 0)).toThrow('TC level must be between 1 and 9');
    expect(() => Field.createTCEntry('Invalid', 10)).toThrow('TC level must be between 1 and 9');
  });

  test('should create XE entry field', () => {
    const field = Field.createXEEntry('Index Term');

    expect(field.getType()).toBe('XE');
    expect(field.getInstruction()).toContain('XE "Index Term"');
  });

  test('should create XE entry field with sub-entry', () => {
    const field = Field.createXEEntry('Main Entry', 'Sub Entry');

    expect(field.getInstruction()).toContain('XE "Main Entry":Sub Entry');
  });
});

describe('Field Types - Date and Time Fields', () => {
  test('should create DATE field', () => {
    const field = Field.createDate();

    expect(field.getType()).toBe('DATE');
    expect(field.getInstruction()).toContain('DATE');
  });

  test('should create DATE field with format', () => {
    const field = Field.createDate('MMMM d, yyyy');

    expect(field.getInstruction()).toContain('\\@ "MMMM d, yyyy"');
  });

  test('should create TIME field', () => {
    const field = Field.createTime();

    expect(field.getType()).toBe('TIME');
    expect(field.getInstruction()).toContain('TIME');
  });

  test('should create TIME field with format', () => {
    const field = Field.createTime('h:mm:ss');

    expect(field.getInstruction()).toContain('\\@ "h:mm:ss"');
  });
});

describe('Field Types - Formatting', () => {
  test('should apply bold formatting to field', () => {
    const field = Field.createPageNumber({ bold: true });
    const xml = field.toXML();

    const rPr = xml.children!.find(
      (child) => typeof child !== 'string' && child.name === 'w:rPr'
    );
    expect(rPr).toBeDefined();

    if (rPr && typeof rPr !== 'string') {
      const bold = rPr.children!.find(
        (child) => typeof child !== 'string' && child.name === 'w:b'
      );
      expect(bold).toBeDefined();
    }
  });

  test('should apply multiple formatting options', () => {
    const field = Field.createPageNumber({
      bold: true,
      italic: true,
      color: 'FF0000',
      size: 14,
    });

    const xml = field.toXML();
    const rPr = xml.children!.find(
      (child) => typeof child !== 'string' && child.name === 'w:rPr'
    );

    expect(rPr).toBeDefined();
    if (rPr && typeof rPr !== 'string') {
      expect(rPr.children!.length).toBeGreaterThan(1);
    }
  });
});

describe('Field Types - XML Generation', () => {
  test('should generate correct XML structure for all field types', () => {
    const fields = [
      Field.createPageNumber(),
      Field.createTotalPages(),
      Field.createSectionPages(),
      Field.createRef('bookmark1'),
      Field.createHyperlink('https://test.com'),
      Field.createSeq('Figure'),
      Field.createAuthor(),
      Field.createTitle(),
      Field.createFilename(),
      Field.createDate(),
      Field.createTime(),
    ];

    fields.forEach((field) => {
      const xml = field.toXML();
      expect(xml.name).toBe('w:fldSimple');
      expect(xml.attributes).toHaveProperty('w:instr');
      expect(xml.children).toBeDefined();
      expect(xml.children!.length).toBeGreaterThan(0);
    });
  });

  test('should include placeholder text in XML', () => {
    const field = Field.createPageNumber();
    const xml = field.toXML();

    const textElement = xml.children!.find(
      (child) => typeof child !== 'string' && child.name === 'w:t'
    );
    expect(textElement).toBeDefined();

    if (textElement && typeof textElement !== 'string') {
      expect(textElement.children).toBeDefined();
      expect(textElement.children!.length).toBeGreaterThan(0);
    }
  });
});

describe('Field Types - Factory Methods', () => {
  test('should create field using generic create method', () => {
    const field = Field.create({
      type: 'PAGE',
      format: '\\* MERGEFORMAT',
    });

    expect(field.getType()).toBe('PAGE');
  });

  test('should create custom field', () => {
    const field = Field.createCustom('CUSTOM \\* MERGEFORMAT');

    expect(field.getInstruction()).toBe('CUSTOM \\* MERGEFORMAT');
  });
});

describe('Field Types - Integration', () => {
  test('should support method chaining for formatting', () => {
    const field = Field.createPageNumber();
    field.setFormatting({ bold: true, italic: true });

    const formatting = field.getFormatting();
    expect(formatting).toBeDefined();
    expect(formatting!.bold).toBe(true);
    expect(formatting!.italic).toBe(true);
  });

  test('should preserve field instruction when formatting changes', () => {
    const field = Field.createRef('bookmark1');
    const originalInstruction = field.getInstruction();

    field.setFormatting({ bold: true });

    expect(field.getInstruction()).toBe(originalInstruction);
  });

  test('should generate valid field codes for all types', () => {
    const testCases = [
      { field: Field.createPageNumber(), expected: 'PAGE' },
      { field: Field.createTotalPages(), expected: 'NUMPAGES' },
      { field: Field.createSectionPages(), expected: 'SECTIONPAGES' },
      { field: Field.createRef('test'), expected: 'REF test' },
      { field: Field.createHyperlink('http://test.com'), expected: 'HYPERLINK' },
      { field: Field.createSeq('Fig'), expected: 'SEQ Fig' },
      { field: Field.createAuthor(), expected: 'AUTHOR' },
      { field: Field.createTitle(), expected: 'TITLE' },
      { field: Field.createFilename(), expected: 'FILENAME' },
      { field: Field.createTCEntry('Test', 1), expected: 'TC "Test"' },
      { field: Field.createXEEntry('Index'), expected: 'XE "Index"' },
    ];

    testCases.forEach(({ field, expected }) => {
      expect(field.getInstruction()).toContain(expected);
    });
  });
});
