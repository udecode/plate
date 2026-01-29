/**
 * Integration test for comment range highlighting end-to-end
 */

import { describe, it, expect } from 'vitest';
import { transformDocumentToHtml } from './docxHtmlTransformer';
import { extractAndHighlightParagraphs } from './commentHighlighting';

describe('Comment Range Highlighting Integration', () => {
  it('should track comment ranges through document transformation', () => {
    // Create a mock document with comment range markers
    const parser = new DOMParser();
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:commentRangeStart w:id="0"/>
            <w:r><w:t>This is </w:t></w:r>
            <w:r><w:t>highlighted text</w:t></w:r>
            <w:commentRangeEnd w:id="0"/>
            <w:r><w:t> and this is not.</w:t></w:r>
            <w:r>
              <w:commentReference w:id="0"/>
            </w:r>
          </w:p>
          <w:p>
            <w:r><w:t>Second paragraph without highlights.</w:t></w:r>
          </w:p>
        </w:body>
      </w:document>`;
    
    const documentXml = parser.parseFromString(xmlString, 'text/xml');
    const result = transformDocumentToHtml(documentXml);
    
    // Verify paragraphs were created
    expect(result.paragraphs).toHaveLength(2);
    
    // Verify comment range was tracked
    expect(result.commentRanges).toBeDefined();
    expect(result.commentRanges?.has('0')).toBe(true);
    
    const ranges = result.commentRanges?.get('0');
    expect(ranges).toBeDefined();
    expect(ranges).toHaveLength(1);
    
    // Verify range details
    const range = ranges![0];
    expect(range.paragraphIndex).toBe(0);
    expect(range.startSpanIndex).toBe(0);
    expect(range.endSpanIndex).toBe(2); // Two spans highlighted
  });

  it('should highlight correct spans when applying highlighting', () => {
    // Create paragraphs similar to what the transformer would produce
    const paragraphs = [
      '<p><span>This is </span><span>highlighted text</span><span> and this is not.</span></p>',
      '<p><span>Second paragraph without highlights.</span></p>'
    ];
    
    const ranges = [
      {
        paragraphIndex: 0,
        startSpanIndex: 0,
        endSpanIndex: 2
      }
    ];
    
    const highlighted = extractAndHighlightParagraphs(paragraphs, [0, 1], ranges);
    
    // Verify highlighting was applied
    expect(highlighted).toContain('<mark');
    expect(highlighted).toContain('comment-highlight');
    expect(highlighted).toContain('This is');
    expect(highlighted).toContain('highlighted text');
    
    // Verify non-highlighted text is still present
    expect(highlighted).toContain('and this is not');
    expect(highlighted).toContain('Second paragraph');
  });

  it('should handle multi-paragraph ranges', () => {
    const parser = new DOMParser();
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:commentRangeStart w:id="1"/>
            <w:r><w:t>Start of range in paragraph 1</w:t></w:r>
          </w:p>
          <w:p>
            <w:r><w:t>Middle paragraph</w:t></w:r>
          </w:p>
          <w:p>
            <w:r><w:t>End of range in paragraph 3</w:t></w:r>
            <w:commentRangeEnd w:id="1"/>
            <w:r>
              <w:commentReference w:id="1"/>
            </w:r>
          </w:p>
        </w:body>
      </w:document>`;
    
    const documentXml = parser.parseFromString(xmlString, 'text/xml');
    const result = transformDocumentToHtml(documentXml);
    
    // Verify paragraphs were created
    expect(result.paragraphs).toHaveLength(3);
    
    // Verify multi-paragraph range is now properly supported
    expect(result.commentToParagraphMap?.get('1')).toEqual(expect.arrayContaining([0, 1, 2]));
    
    // Verify comment ranges are created for all paragraphs in the range
    expect(result.commentRanges).toBeDefined();
    expect(result.commentRanges?.has('1')).toBe(true);
    
    const ranges = result.commentRanges?.get('1');
    expect(ranges).toBeDefined();
    expect(ranges).toHaveLength(3); // Three ranges: start paragraph, middle paragraph, end paragraph
    
    // First paragraph: from startSpanIndex to end of paragraph
    expect(ranges![0]).toMatchObject({
      paragraphIndex: 0,
      startSpanIndex: 0,
      endSpanIndex: 9999 // Will be clamped during highlighting
    });
    
    // Middle paragraph: entire paragraph
    expect(ranges![1]).toMatchObject({
      paragraphIndex: 1,
      startSpanIndex: 0,
      endSpanIndex: 9999
    });
    
    // Last paragraph: from beginning to endSpanIndex
    expect(ranges![2]).toMatchObject({
      paragraphIndex: 2,
      startSpanIndex: 0,
      endSpanIndex: 1 // Ends after first span
    });
  });

  it('should handle multiple overlapping comments', () => {
    const parser = new DOMParser();
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:commentRangeStart w:id="0"/>
            <w:r><w:t>First span</w:t></w:r>
            <w:commentRangeEnd w:id="0"/>
            <w:commentRangeStart w:id="1"/>
            <w:r><w:t>Second span</w:t></w:r>
            <w:r><w:t>Third span</w:t></w:r>
            <w:commentRangeEnd w:id="1"/>
            <w:r>
              <w:commentReference w:id="0"/>
              <w:commentReference w:id="1"/>
            </w:r>
          </w:p>
        </w:body>
      </w:document>`;
    
    const documentXml = parser.parseFromString(xmlString, 'text/xml');
    const result = transformDocumentToHtml(documentXml);
    
    // Verify both comments were tracked
    expect(result.commentRanges?.has('0')).toBe(true);
    expect(result.commentRanges?.has('1')).toBe(true);
    
    const ranges0 = result.commentRanges?.get('0');
    const ranges1 = result.commentRanges?.get('1');
    
    expect(ranges0?.[0].startSpanIndex).toBe(0);
    expect(ranges0?.[0].endSpanIndex).toBe(1);
    
    expect(ranges1?.[0].startSpanIndex).toBe(1);
    expect(ranges1?.[0].endSpanIndex).toBe(3);
  });

  it('should preserve formatting when highlighting', () => {
    const paragraphs = [
      '<p><span style="font-weight: bold">Bold text</span> <span style="font-style: italic">Italic text</span></p>'
    ];
    
    const ranges = [
      {
        paragraphIndex: 0,
        startSpanIndex: 0,
        endSpanIndex: 2
      }
    ];
    
    const highlighted = extractAndHighlightParagraphs(paragraphs, [0], ranges);
    
    // Verify original formatting is preserved
    expect(highlighted).toContain('font-weight: bold');
    expect(highlighted).toContain('font-style: italic');
    expect(highlighted).toContain('<mark');
  });

  it('should handle empty ranges gracefully', () => {
    const paragraphs = [
      '<p><span>Test content</span></p>'
    ];
    
    const highlighted = extractAndHighlightParagraphs(paragraphs, [0], []);
    
    // Should return content without highlighting
    expect(highlighted).not.toContain('<mark');
    expect(highlighted).toContain('Test content');
  });
});
