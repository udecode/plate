/**
 * Tests for comment range highlighting utilities
 */

import { describe, it, expect } from 'vitest';
import { applyCommentHighlighting, extractAndHighlightParagraphs } from './commentHighlighting';
import type { CommentRange } from '../types';

describe('Comment Highlighting', () => {
  describe('applyCommentHighlighting', () => {
    it('should return paragraphs unchanged when no ranges provided', () => {
      const paragraphs = [
        '<p><span style="font-weight: bold">Hello</span> <span>World</span></p>'
      ];
      const result = applyCommentHighlighting(paragraphs, []);
      expect(result).toEqual(paragraphs);
    });

    it('should highlight a single span range in a paragraph', () => {
      const paragraphs = [
        '<p><span>Hello</span> <span>World</span> <span>Test</span></p>'
      ];
      const ranges: CommentRange[] = [
        { paragraphIndex: 0, startSpanIndex: 1, endSpanIndex: 2 }
      ];
      
      const result = applyCommentHighlighting(paragraphs, ranges);
      
      // Should wrap the second span (index 1) in a mark element
      expect(result[0]).toContain('<mark');
      expect(result[0]).toContain('comment-highlight');
      expect(result[0]).toContain('World');
    });

    it('should highlight multiple consecutive spans', () => {
      const paragraphs = [
        '<p><span>One</span> <span>Two</span> <span>Three</span> <span>Four</span></p>'
      ];
      const ranges: CommentRange[] = [
        { paragraphIndex: 0, startSpanIndex: 1, endSpanIndex: 3 }
      ];
      
      const result = applyCommentHighlighting(paragraphs, ranges);
      
      // Should wrap spans at indices 1 and 2 (Two and Three)
      expect(result[0]).toContain('<mark');
      expect(result[0]).toContain('Two');
      expect(result[0]).toContain('Three');
      
      // Should not highlight One and Four
      const parser = new DOMParser();
      const doc = parser.parseFromString(result[0], 'text/html');
      const mark = doc.querySelector('mark.comment-highlight');
      expect(mark).toBeTruthy();
      expect(mark?.textContent).toContain('Two');
      expect(mark?.textContent).toContain('Three');
      expect(mark?.textContent).not.toContain('Four');
    });

    it('should handle multiple ranges in different paragraphs', () => {
      const paragraphs = [
        '<p><span>Para1 Span1</span> <span>Para1 Span2</span></p>',
        '<p><span>Para2 Span1</span> <span>Para2 Span2</span></p>'
      ];
      const ranges: CommentRange[] = [
        { paragraphIndex: 0, startSpanIndex: 0, endSpanIndex: 1 },
        { paragraphIndex: 1, startSpanIndex: 1, endSpanIndex: 2 }
      ];
      
      const result = applyCommentHighlighting(paragraphs, ranges);
      
      // First paragraph should have highlighting on first span
      expect(result[0]).toContain('<mark');
      expect(result[0]).toContain('Para1 Span1');
      
      // Second paragraph should have highlighting on second span
      expect(result[1]).toContain('<mark');
      expect(result[1]).toContain('Para2 Span2');
    });

    it('should skip numbering-text spans when counting', () => {
      const paragraphs = [
        '<p><span class="numbering-text">1. </span><span>Content</span> <span>More</span></p>'
      ];
      const ranges: CommentRange[] = [
        { paragraphIndex: 0, startSpanIndex: 0, endSpanIndex: 1 }
      ];
      
      const result = applyCommentHighlighting(paragraphs, ranges);
      
      // Should highlight "Content" (first non-numbering span)
      expect(result[0]).toContain('<mark');
      expect(result[0]).toContain('Content');
    });

    it('should handle invalid range indices gracefully', () => {
      const paragraphs = [
        '<p><span>One</span> <span>Two</span></p>'
      ];
      const ranges: CommentRange[] = [
        { paragraphIndex: 0, startSpanIndex: 5, endSpanIndex: 10 } // Out of bounds
      ];
      
      const result = applyCommentHighlighting(paragraphs, ranges);
      
      // Should return unchanged paragraph
      expect(result[0]).not.toContain('<mark');
    });

    it('should handle empty paragraphs', () => {
      const paragraphs = ['<p></p>'];
      const ranges: CommentRange[] = [
        { paragraphIndex: 0, startSpanIndex: 0, endSpanIndex: 1 }
      ];
      
      const result = applyCommentHighlighting(paragraphs, ranges);
      
      // Should return unchanged
      expect(result[0]).toBe('<p></p>');
    });

    it('should preserve existing span styles when highlighting', () => {
      const paragraphs = [
        '<p><span style="font-weight: bold; color: red;">Bold Red</span> <span style="font-style: italic;">Italic</span></p>'
      ];
      const ranges: CommentRange[] = [
        { paragraphIndex: 0, startSpanIndex: 0, endSpanIndex: 2 }
      ];
      
      const result = applyCommentHighlighting(paragraphs, ranges);
      
      // Should preserve original styles
      expect(result[0]).toContain('font-weight: bold');
      expect(result[0]).toContain('color: red');
      expect(result[0]).toContain('font-style: italic');
      expect(result[0]).toContain('<mark');
    });
  });

  describe('extractAndHighlightParagraphs', () => {
    it('should extract and highlight specific paragraphs', () => {
      const paragraphs = [
        '<p><span>Para0</span></p>',
        '<p><span>Para1 A</span> <span>Para1 B</span></p>',
        '<p><span>Para2</span></p>',
        '<p><span>Para3</span></p>'
      ];
      const paragraphIndices = [1, 3];
      const ranges: CommentRange[] = [
        { paragraphIndex: 1, startSpanIndex: 0, endSpanIndex: 1 }
      ];
      
      const result = extractAndHighlightParagraphs(paragraphs, paragraphIndices, ranges);
      
      // Should contain only paragraphs 1 and 3
      expect(result).toContain('Para1 A');
      expect(result).toContain('Para3');
      expect(result).not.toContain('Para0');
      expect(result).not.toContain('Para2');
      
      // Should have highlighting on paragraph 1
      expect(result).toContain('<mark');
    });

    it('should handle empty paragraph indices', () => {
      const paragraphs = ['<p><span>Test</span></p>'];
      const result = extractAndHighlightParagraphs(paragraphs, [], []);
      expect(result).toBe('');
    });

    it('should adjust range indices for extracted paragraphs', () => {
      const paragraphs = [
        '<p><span>Para0</span></p>',
        '<p><span>Para1</span></p>',
        '<p><span>Para2 A</span> <span>Para2 B</span></p>'
      ];
      const paragraphIndices = [2]; // Extract only paragraph 2
      const ranges: CommentRange[] = [
        { paragraphIndex: 2, startSpanIndex: 1, endSpanIndex: 2 } // Highlight second span
      ];
      
      const result = extractAndHighlightParagraphs(paragraphs, paragraphIndices, ranges);
      
      // Should only contain paragraph 2
      expect(result).toContain('Para2 A');
      expect(result).toContain('Para2 B');
      expect(result).not.toContain('Para0');
      expect(result).not.toContain('Para1');
      
      // Should have highlighting
      expect(result).toContain('<mark');
      expect(result).toContain('Para2 B');
    });

    it('should handle ranges that span multiple paragraphs', () => {
      const paragraphs = [
        '<p><span>Para0 A</span> <span>Para0 B</span></p>',
        '<p><span>Para1 A</span> <span>Para1 B</span></p>',
        '<p><span>Para2 A</span> <span>Para2 B</span></p>'
      ];
      const paragraphIndices = [0, 1, 2];
      const ranges: CommentRange[] = [
        { paragraphIndex: 0, startSpanIndex: 1, endSpanIndex: 2 },
        { paragraphIndex: 1, startSpanIndex: 0, endSpanIndex: 2 },
        { paragraphIndex: 2, startSpanIndex: 0, endSpanIndex: 1 }
      ];
      
      const result = extractAndHighlightParagraphs(paragraphs, paragraphIndices, ranges);
      
      // Should contain all three paragraphs
      expect(result).toContain('Para0');
      expect(result).toContain('Para1');
      expect(result).toContain('Para2');
      
      // Should have multiple highlights
      const markCount = (result.match(/<mark/g) || []).length;
      expect(markCount).toBe(3);
    });
  });
});
