/**
 * Tests for Run instructionText preservation
 * Verifies that setText() preserves instructionText content type
 *
 * This is critical for TOC field instructions and other field codes.
 * Without this fix, calling setText() on a run with instrText converts it to w:t,
 * which causes field instruction codes to appear as visible text in Word.
 */

import { Run } from '../../src/elements/Run';

describe('Run InstructionText Preservation', () => {
  describe('setText() content type preservation', () => {
    it('should preserve instructionText type when calling setText() on instrText run', () => {
      // Create a run with instructionText content (simulating parsed TOC field)
      const run = Run.createFromContent(
        [{ type: 'instructionText', value: ' TOC \\o "1-3" \\h \\z \\u ' }],
        {}
      );

      // Verify initial state
      const initialContent = run.getContent();
      expect(initialContent).toHaveLength(1);
      expect(initialContent[0]!.type).toBe('instructionText');
      expect(initialContent[0]!.value).toBe(' TOC \\o "1-3" \\h \\z \\u ');

      // Call setText with modified text (simulating whitespace cleanup)
      run.setText('TOC \\o "1-3" \\h \\z \\u');

      // Verify instructionText type is preserved
      const updatedContent = run.getContent();
      expect(updatedContent).toHaveLength(1);
      expect(updatedContent[0]!.type).toBe('instructionText');
      expect(updatedContent[0]!.value).toBe('TOC \\o "1-3" \\h \\z \\u');
    });

    it('should convert to text type when calling setText() on regular text run', () => {
      // Create a normal text run
      const run = new Run('Hello World');

      // Verify initial state is text type
      const initialContent = run.getContent();
      expect(initialContent[0]!.type).toBe('text');

      // Call setText with new text
      run.setText('Hello Modified World');

      // Verify text type is maintained
      const updatedContent = run.getContent();
      expect(updatedContent[0]!.type).toBe('text');
      expect(updatedContent[0]!.value).toBe('Hello Modified World');
    });

    it('should convert mixed content run to text type', () => {
      // Create a run with mixed content (text + tab + text)
      const run = Run.createFromContent(
        [
          { type: 'text', value: 'Hello' },
          { type: 'tab' },
          { type: 'text', value: 'World' },
        ],
        {}
      );

      // Call setText - should replace with text type
      run.setText('Hello World');

      // Verify content is now text type
      const updatedContent = run.getContent();
      expect(updatedContent[0]!.type).toBe('text');
    });

    it('should preserve instructionText even when new value has special characters', () => {
      // Create a run with instructionText
      const run = Run.createFromContent(
        [
          {
            type: 'instructionText',
            value: ' HYPERLINK "http://example.com" ',
          },
        ],
        {}
      );

      // Call setText with special characters that would normally create tabs/breaks
      run.setText('HYPERLINK "http://example.com"');

      // Verify instructionText type is preserved
      const updatedContent = run.getContent();
      expect(updatedContent).toHaveLength(1);
      expect(updatedContent[0]!.type).toBe('instructionText');
    });

    it('should handle empty instructionText run correctly', () => {
      // Create a run with instructionText
      const run = Run.createFromContent(
        [{ type: 'instructionText', value: ' TOC \\o "1-3" ' }],
        {}
      );

      // Call setText with empty string
      run.setText('');

      // Should preserve instructionText type with empty value
      const updatedContent = run.getContent();
      expect(updatedContent).toHaveLength(1);
      expect(updatedContent[0]!.type).toBe('instructionText');
      expect(updatedContent[0]!.value).toBe('');
    });
  });

  describe('toXML() output verification', () => {
    it('should output w:instrText for instructionText content', () => {
      const run = Run.createFromContent(
        [{ type: 'instructionText', value: ' TOC \\o "1-3" ' }],
        {}
      );

      // Modify text via setText
      run.setText('TOC \\o "1-3"');

      // Generate XML
      const xml = run.toXML();
      const xmlString = JSON.stringify(xml);

      // Should contain instrText, not just t
      expect(xmlString).toContain('instrText');
    });

    it('should output w:t for regular text content', () => {
      const run = new Run('Hello World');

      // Generate XML
      const xml = run.toXML();
      const xmlString = JSON.stringify(xml);

      // Should contain w:t
      expect(xmlString).toContain('"name":"w:t"');
    });
  });
});
