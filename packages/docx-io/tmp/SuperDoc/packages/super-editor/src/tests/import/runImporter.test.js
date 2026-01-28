import { expect, describe, it } from 'vitest';
import { handleRunNode } from '@core/super-converter/v2/importer/runNodeImporter.js';

// Helper functions to create common mocks
const createMockDocx = (styles = []) => ({
  'word/styles.xml': {
    elements: [
      {
        elements: styles,
      },
    ],
  },
});

const createMockStyle = (styleId, runProperties = []) => ({
  name: 'w:style',
  attributes: { 'w:styleId': styleId },
  elements: [
    {
      name: 'w:rPr',
      elements: runProperties,
    },
  ],
});

const createMockRunProperty = (name, attributes = {}) => ({
  name,
  attributes,
});

const createMockRunNode = (runProperties = [], text = 'Test text') => ({
  name: 'w:r',
  elements: [
    {
      name: 'w:rPr',
      elements: runProperties,
    },
    {
      name: 'w:t',
      elements: [{ text }],
    },
  ],
});

const createMockNodeListHandler = (returnType = 'text', returnText = 'Test text') => ({
  handler: () => [{ type: returnType, text: returnText, marks: [] }],
});

const createMockRunStyle = (styleId) => createMockRunProperty('w:rStyle', { 'w:val': styleId });

const createMockFont = (fontFamily) => createMockRunProperty('w:rFonts', { 'w:ascii': fontFamily });

const createMockSize = (size) => createMockRunProperty('w:sz', { 'w:val': size });

const createMockColor = (color) => createMockRunProperty('w:color', { 'w:val': color });

const createMockBold = () => createMockRunProperty('w:b', {});

const createMockItalic = () => createMockRunProperty('w:i', {});

describe('runImporter', () => {
  describe('runStyle attributes override paragraphStyleAttributes', () => {
    it('should override paragraph style attributes with run style attributes', () => {
      // Create styles with paragraph and run styles
      const paragraphStyle = createMockStyle('ParagraphStyle', [
        createMockFont('Times New Roman'),
        createMockSize('24'), // 12pt
      ]);

      const runStyle = createMockStyle('RunStyle', [
        createMockFont('Arial'),
        createMockSize('32'), // 16pt
      ]);

      const mockDocx = createMockDocx([paragraphStyle, runStyle]);
      const mockRunNode = createMockRunNode([createMockRunStyle('RunStyle')]);
      const mockNodeListHandler = createMockNodeListHandler();

      const result = handleRunNode({
        nodes: [mockRunNode],
        nodeListHandler: mockNodeListHandler,
        parentStyleId: 'ParagraphStyle',
        docx: mockDocx,
      });

      expect(result.nodes).toHaveLength(1);
      expect(result.consumed).toBe(1);

      const textNode = result.nodes[0];
      expect(textNode.type).toBe('text');
      expect(textNode.text).toBe('Test text');

      // Check that run style attributes override paragraph style attributes
      const textStyleMark = textNode.marks.find((mark) => mark.type === 'textStyle');
      expect(textStyleMark).toBeDefined();
      expect(textStyleMark.attrs.fontFamily).toBe('Arial'); // Run style font
      expect(textStyleMark.attrs.fontSize).toBe('16pt'); // Run style size
      expect(textStyleMark.attrs.styleId).toBe('RunStyle'); // Run style ID
    });

    it('should combine paragraph and run styles with correct precedence', () => {
      // Create styles with paragraph and run styles
      const paragraphStyle = createMockStyle('ParagraphStyle', [
        createMockFont('Times New Roman'),
        createMockSize('24'), // 12pt
        createMockBold(),
      ]);

      const runStyle = createMockStyle('RunStyle', [createMockFont('Arial'), createMockItalic()]);

      const mockDocx = createMockDocx([paragraphStyle, runStyle]);
      const mockRunNode = createMockRunNode([createMockRunStyle('RunStyle')]);
      const mockNodeListHandler = createMockNodeListHandler();

      const result = handleRunNode({
        nodes: [mockRunNode],
        nodeListHandler: mockNodeListHandler,
        parentStyleId: 'ParagraphStyle',
        docx: mockDocx,
      });

      expect(result.nodes).toHaveLength(1);
      const textNode = result.nodes[0];

      // Check that all marks are present with correct precedence
      const textStyleMark = textNode.marks.find((mark) => mark.type === 'textStyle');
      const boldMark = textNode.marks.find((mark) => mark.type === 'bold');
      const italicMark = textNode.marks.find((mark) => mark.type === 'italic');

      expect(textStyleMark).toBeDefined();
      expect(boldMark).toBeDefined();
      expect(italicMark).toBeDefined();

      // Run style should override paragraph style for font properties
      expect(textStyleMark.attrs.fontFamily).toBe('Arial'); // Run style overrides
      expect(textStyleMark.attrs.fontSize).toBe('12pt'); // Paragraph style (no override)
    });

    it('should handle run nodes without run styles', () => {
      // Create style with only paragraph styles
      const paragraphStyle = createMockStyle('ParagraphStyle', [
        createMockFont('Times New Roman'),
        createMockSize('24'), // 12pt
      ]);

      const mockDocx = createMockDocx([paragraphStyle]);
      const mockRunNode = createMockRunNode([createMockBold()]);
      const mockNodeListHandler = createMockNodeListHandler();

      const result = handleRunNode({
        nodes: [mockRunNode],
        nodeListHandler: mockNodeListHandler,
        parentStyleId: 'ParagraphStyle',
        docx: mockDocx,
      });

      expect(result.nodes).toHaveLength(1);
      const textNode = result.nodes[0];

      // Should have paragraph style attributes
      const textStyleMark = textNode.marks.find((mark) => mark.type === 'textStyle');
      const boldMark = textNode.marks.find((mark) => mark.type === 'bold');

      expect(textStyleMark).toBeDefined();
      expect(textStyleMark.attrs.fontFamily).toBe('Times New Roman');
      expect(textStyleMark.attrs.fontSize).toBe('12pt');
      expect(boldMark).toBeDefined();

      // Should not have styleId since no run style was applied
      expect(textStyleMark.attrs.styleId).toBeUndefined();
    });
  });

  describe('textStyle mark stores the styleId', () => {
    it('should store run style ID in textStyle mark', () => {
      const runStyle = createMockStyle('CustomRunStyle', [createMockFont('Calibri')]);

      const mockDocx = createMockDocx([runStyle]);
      const mockRunNode = createMockRunNode([createMockRunStyle('CustomRunStyle')]);
      const mockNodeListHandler = createMockNodeListHandler('text', 'Styled text');

      const result = handleRunNode({
        nodes: [mockRunNode],
        nodeListHandler: mockNodeListHandler,
        parentStyleId: null,
        docx: mockDocx,
      });

      expect(result.nodes).toHaveLength(1);
      const textNode = result.nodes[0];

      // Check that styleId is stored in textStyle mark
      const textStyleMark = textNode.marks.find((mark) => mark.type === 'textStyle');
      expect(textStyleMark).toBeDefined();
      expect(textStyleMark.attrs.styleId).toBe('CustomRunStyle');
      expect(textStyleMark.attrs.fontFamily).toBe('Calibri');
    });

    it('should not add styleId when no run style is present', () => {
      const mockDocx = createMockDocx([]);
      const mockRunNode = createMockRunNode([createMockBold()]);
      const mockNodeListHandler = createMockNodeListHandler('text', 'Plain text');

      const result = handleRunNode({
        nodes: [mockRunNode],
        nodeListHandler: mockNodeListHandler,
        parentStyleId: null,
        docx: mockDocx,
      });

      expect(result.nodes).toHaveLength(1);
      const textNode = result.nodes[0];

      // Should not have textStyle mark with styleId
      const textStyleMark = textNode.marks.find((mark) => mark.type === 'textStyle');
      if (textStyleMark) {
        expect(textStyleMark.attrs.styleId).toBeUndefined();
      }
    });

    it('should handle multiple textStyle marks correctly', () => {
      const runStyle = createMockStyle('MultiStyle', [
        createMockFont('Verdana'),
        createMockSize('40'), // 20pt
      ]);

      const mockDocx = createMockDocx([runStyle]);
      const mockRunNode = createMockRunNode([createMockRunStyle('MultiStyle'), createMockColor('FF0000')]);
      const mockNodeListHandler = createMockNodeListHandler('text', 'Multi-styled text');

      const result = handleRunNode({
        nodes: [mockRunNode],
        nodeListHandler: mockNodeListHandler,
        parentStyleId: null,
        docx: mockDocx,
      });

      expect(result.nodes).toHaveLength(1);
      const textNode = result.nodes[0];

      // Should have combined textStyle mark with all attributes
      const textStyleMark = textNode.marks.find((mark) => mark.type === 'textStyle');
      expect(textStyleMark).toBeDefined();
      expect(textStyleMark.attrs.styleId).toBe('MultiStyle');
      expect(textStyleMark.attrs.fontFamily).toBe('Verdana');
      expect(textStyleMark.attrs.fontSize).toBe('20pt');
      expect(textStyleMark.attrs.color).toBe('#FF0000');
    });
  });

  describe('integration with real document structure', () => {
    it('should handle run nodes with complex style hierarchies', () => {
      // Create a more complex document structure
      const headingStyle = createMockStyle('Heading1', [
        createMockFont('Georgia'),
        createMockSize('48'), // 24pt
        createMockBold(),
      ]);

      const emphasisStyle = createMockStyle('Emphasis', [createMockItalic(), createMockColor('0000FF')]);

      const mockDocx = createMockDocx([headingStyle, emphasisStyle]);
      const mockRunNode = createMockRunNode([createMockRunStyle('Emphasis')], 'emphasized text');
      const mockNodeListHandler = createMockNodeListHandler('text', 'emphasized text');

      const result = handleRunNode({
        nodes: [mockRunNode],
        nodeListHandler: mockNodeListHandler,
        parentStyleId: 'Heading1',
        docx: mockDocx,
      });

      expect(result.nodes).toHaveLength(1);
      const textNode = result.nodes[0];

      // Should have both paragraph and run styles with correct precedence
      const textStyleMark = textNode.marks.find((mark) => mark.type === 'textStyle');
      const boldMark = textNode.marks.find((mark) => mark.type === 'bold');
      const italicMark = textNode.marks.find((mark) => mark.type === 'italic');

      expect(textStyleMark).toBeDefined();
      expect(textStyleMark.attrs.styleId).toBe('Emphasis'); // Run style ID
      expect(textStyleMark.attrs.fontFamily).toBe('Georgia'); // From paragraph style
      expect(textStyleMark.attrs.fontSize).toBe('24pt'); // From paragraph style
      expect(textStyleMark.attrs.color).toBe('#0000FF'); // From run style
      expect(boldMark).toBeDefined(); // From paragraph style
      expect(italicMark).toBeDefined(); // From run style
    });
  });
});
