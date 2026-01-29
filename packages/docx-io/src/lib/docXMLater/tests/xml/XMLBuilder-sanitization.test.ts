/**
 * XMLBuilder Sanitization Tests
 *
 * Tests for XML 1.0 control character handling in XMLBuilder.
 * Per XML 1.0 spec, characters 0x00-0x08, 0x0B-0x0C, 0x0E-0x1F, 0x7F are invalid.
 * Tab (0x09), newline (0x0A), and CR (0x0D) are valid and must be preserved.
 */

import { XMLBuilder } from '../../src/xml/XMLBuilder';
import {
  removeInvalidXmlChars,
  findInvalidXmlChars,
  hasInvalidXmlChars,
  XML_CONTROL_CHARS,
} from '../../src/utils/xmlSanitization';

describe('XML Sanitization', () => {
  describe('removeInvalidXmlChars', () => {
    it('should remove NULL byte (0x00)', () => {
      const input = 'Hello\x00World';
      const result = removeInvalidXmlChars(input, false);
      expect(result).toBe('HelloWorld');
    });

    it('should remove all invalid control chars (0x00-0x08)', () => {
      const input = 'A\x00B\x01C\x02D\x03E\x04F\x05G\x06H\x07I\x08J';
      const result = removeInvalidXmlChars(input, false);
      expect(result).toBe('ABCDEFGHIJ');
    });

    it('should preserve TAB (0x09)', () => {
      const input = 'Hello\tWorld';
      const result = removeInvalidXmlChars(input, false);
      expect(result).toBe('Hello\tWorld');
    });

    it('should preserve newline (0x0A)', () => {
      const input = 'Hello\nWorld';
      const result = removeInvalidXmlChars(input, false);
      expect(result).toBe('Hello\nWorld');
    });

    it('should remove VERTICAL TAB (0x0B)', () => {
      const input = 'Hello\x0BWorld';
      const result = removeInvalidXmlChars(input, false);
      expect(result).toBe('HelloWorld');
    });

    it('should remove FORM FEED (0x0C)', () => {
      const input = 'Hello\x0CWorld';
      const result = removeInvalidXmlChars(input, false);
      expect(result).toBe('HelloWorld');
    });

    it('should preserve carriage return (0x0D)', () => {
      const input = 'Hello\rWorld';
      const result = removeInvalidXmlChars(input, false);
      expect(result).toBe('Hello\rWorld');
    });

    it('should remove control chars (0x0E-0x1F)', () => {
      // Test a few from the range
      const input = 'A\x0EB\x0FC\x10D\x1FE';
      const result = removeInvalidXmlChars(input, false);
      expect(result).toBe('ABCDE');
    });

    it('should remove DELETE (0x7F)', () => {
      const input = 'Hello\x7FWorld';
      const result = removeInvalidXmlChars(input, false);
      expect(result).toBe('HelloWorld');
    });

    it('should handle empty string', () => {
      const result = removeInvalidXmlChars('', false);
      expect(result).toBe('');
    });

    it('should handle string with only invalid chars', () => {
      const input = '\x00\x01\x02\x7F';
      const result = removeInvalidXmlChars(input, false);
      expect(result).toBe('');
    });

    it('should preserve normal text unchanged', () => {
      const input = 'Normal ASCII text with numbers 12345 and symbols !@#$%';
      const result = removeInvalidXmlChars(input, false);
      expect(result).toBe(input);
    });

    it('should preserve Unicode characters', () => {
      const input = 'Unicode: \u4E2D\u6587 \u0410\u0411\u0412 \u00E9\u00F1';
      const result = removeInvalidXmlChars(input, false);
      expect(result).toBe(input);
    });

    it('should preserve emoji', () => {
      const input = 'Emoji: \uD83D\uDE00 \uD83D\uDC4D';
      const result = removeInvalidXmlChars(input, false);
      expect(result).toBe(input);
    });

    it('should handle mixed valid and invalid characters', () => {
      const input = 'Hello\x00\tWorld\x0B\nTest\x7F';
      const result = removeInvalidXmlChars(input, false);
      expect(result).toBe('Hello\tWorld\nTest');
    });
  });

  describe('findInvalidXmlChars', () => {
    it('should return empty array for valid text', () => {
      const result = findInvalidXmlChars('Normal text');
      expect(result).toEqual([]);
    });

    it('should find NULL byte', () => {
      const result = findInvalidXmlChars('Hello\x00World');
      expect(result).toContain(0x00);
    });

    it('should find multiple invalid chars', () => {
      const result = findInvalidXmlChars('A\x00B\x08C\x7F');
      expect(result).toContain(0x00);
      expect(result).toContain(0x08);
      expect(result).toContain(0x7f);
      expect(result).toHaveLength(3);
    });

    it('should return unique codes only', () => {
      const result = findInvalidXmlChars('\x00\x00\x00');
      expect(result).toEqual([0x00]);
    });

    it('should not include valid control chars (tab, newline, CR)', () => {
      const result = findInvalidXmlChars('\t\n\r');
      expect(result).toEqual([]);
    });
  });

  describe('hasInvalidXmlChars', () => {
    it('should return false for valid text', () => {
      expect(hasInvalidXmlChars('Normal text')).toBe(false);
    });

    it('should return true for text with NULL', () => {
      expect(hasInvalidXmlChars('Hello\x00')).toBe(true);
    });

    it('should return false for valid control chars', () => {
      expect(hasInvalidXmlChars('Tab\tNewline\nCR\r')).toBe(false);
    });

    it('should return true for DELETE char', () => {
      expect(hasInvalidXmlChars('Text\x7F')).toBe(true);
    });
  });

  describe('XML_CONTROL_CHARS constants', () => {
    it('should have correct values for valid chars', () => {
      expect(XML_CONTROL_CHARS.TAB).toBe(0x09);
      expect(XML_CONTROL_CHARS.LF).toBe(0x0a);
      expect(XML_CONTROL_CHARS.CR).toBe(0x0d);
    });

    it('should have correct values for invalid chars', () => {
      expect(XML_CONTROL_CHARS.NULL).toBe(0x00);
      expect(XML_CONTROL_CHARS.BS).toBe(0x08);
      expect(XML_CONTROL_CHARS.VT).toBe(0x0b);
      expect(XML_CONTROL_CHARS.FF).toBe(0x0c);
      expect(XML_CONTROL_CHARS.DEL).toBe(0x7f);
    });
  });

  describe('XMLBuilder.escapeXmlText', () => {
    it('should escape & < > characters', () => {
      const result = XMLBuilder.escapeXmlText('a < b & c > d');
      expect(result).toBe('a &lt; b &amp; c &gt; d');
    });

    it('should NOT escape quotes (text content, not attributes)', () => {
      const result = XMLBuilder.escapeXmlText('Say "hello"');
      expect(result).toBe('Say "hello"');
    });

    it('should remove NULL byte before escaping', () => {
      const result = XMLBuilder.escapeXmlText('Hello\x00<World>');
      expect(result).toBe('Hello&lt;World&gt;');
    });

    it('should preserve tab and newline', () => {
      const result = XMLBuilder.escapeXmlText('Line1\tTab\nLine2');
      expect(result).toBe('Line1\tTab\nLine2');
    });

    it('should remove DELETE char', () => {
      const result = XMLBuilder.escapeXmlText('Text\x7FMore');
      expect(result).toBe('TextMore');
    });

    it('should handle complex mixed content', () => {
      const result = XMLBuilder.escapeXmlText('A\x00<B>\x08&C\x7F');
      expect(result).toBe('A&lt;B&gt;&amp;C');
    });
  });

  describe('XMLBuilder.escapeXmlAttribute', () => {
    it('should escape all XML special chars including quotes', () => {
      const result = XMLBuilder.escapeXmlAttribute('a < b & "c" > d');
      expect(result).toBe('a &lt; b &amp; &quot;c&quot; &gt; d');
    });

    it('should escape single quotes', () => {
      const result = XMLBuilder.escapeXmlAttribute("it's");
      expect(result).toBe('it&apos;s');
    });

    it('should remove NULL byte before escaping', () => {
      const result = XMLBuilder.escapeXmlAttribute('attr="\x00value"');
      expect(result).toBe('attr=&quot;value&quot;');
    });

    it('should remove control chars', () => {
      const result = XMLBuilder.escapeXmlAttribute('val\x0B\x0Cue');
      expect(result).toBe('value');
    });
  });

  describe('XMLBuilder.sanitizeXmlContent', () => {
    it('should remove control chars and escape XML', () => {
      const result = XMLBuilder.sanitizeXmlContent('Hello\x00<World>');
      expect(result).toBe('Hello&lt;World&gt;');
    });

    it('should escape CDATA end marker', () => {
      const result = XMLBuilder.sanitizeXmlContent('data]]>more');
      // CDATA marker `]]>` is first replaced with `]]&gt;`, then `&` is escaped to `&amp;`
      // This is correct - the final XML will render as `]]>` when parsed
      expect(result).toBe('data]]&amp;gt;more');
    });

    it('should preserve valid control chars', () => {
      const result = XMLBuilder.sanitizeXmlContent('Line1\tTab\nLine2');
      expect(result).toBe('Line1\tTab\nLine2');
    });
  });

  describe('Integration: Document round-trip with control chars', () => {
    it('should produce valid XML when text contains control chars', () => {
      // Build XML with text containing control chars
      const builder = new XMLBuilder();
      builder.element('w:t', {}, ['Text\x00with\x08control\x7Fchars']);
      const xml = builder.build();

      // Should not contain any control chars
      expect(xml).not.toMatch(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/);

      // Should contain the cleaned text
      expect(xml).toContain('Textwithcontrolchars');
    });

    it('should produce valid XML in attributes', () => {
      const builder = new XMLBuilder();
      builder.element('w:p', { 'w:id': 'id\x00\x08value' }, []);
      const xml = builder.build();

      // Should not contain control chars
      expect(xml).not.toMatch(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/);

      // Should have cleaned attribute
      expect(xml).toContain('w:id="idvalue"');
    });
  });
});
