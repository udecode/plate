import { describe, it, expect } from 'vitest';
import { extractParagraphsById, extractParagraphsByIndex, getParagraphIdsFromComment, getParagraphIndicesFromComment } from './paragraphExtractor';
import type { DocumentComment } from '../types';

describe('paragraphExtractor', () => {
  describe('extractParagraphsByIndex', () => {
    it('should extract paragraphs by their indices', () => {
      const paragraphs = [
        '<p>First paragraph</p>',
        '<p>Second paragraph</p>',
        '<p>Third paragraph</p>'
      ];
      
      const result = extractParagraphsByIndex(paragraphs, [0, 2]);
      
      expect(result).toContain('First paragraph');
      expect(result).toContain('Third paragraph');
      expect(result).not.toContain('Second paragraph');
    });

    it('should preserve paragraph styling', () => {
      const paragraphs = [
        '<p style="color: red; font-weight: bold;">Styled paragraph</p>',
        '<p>Normal paragraph</p>'
      ];
      
      const result = extractParagraphsByIndex(paragraphs, [0]);
      
      expect(result).toContain('style="color: red; font-weight: bold;"');
      expect(result).toContain('Styled paragraph');
    });

    it('should return empty string when no valid indices', () => {
      const paragraphs = [
        '<p>First paragraph</p>',
        '<p>Second paragraph</p>'
      ];
      
      const result = extractParagraphsByIndex(paragraphs, [5, 10]);
      
      expect(result).toBe('');
    });

    it('should return empty string when paragraphs array is empty', () => {
      const result = extractParagraphsByIndex([], [0, 1]);
      expect(result).toBe('');
    });

    it('should return empty string when indices array is empty', () => {
      const paragraphs = ['<p>First paragraph</p>'];
      const result = extractParagraphsByIndex(paragraphs, []);
      expect(result).toBe('');
    });

    it('should extract paragraphs in the order of indices provided', () => {
      const paragraphs = [
        '<p>First</p>',
        '<p>Second</p>',
        '<p>Third</p>'
      ];
      
      // Request in different order
      const result = extractParagraphsByIndex(paragraphs, [2, 0, 1]);
      
      // Should be extracted in the order they appear in the provided array
      const lines = result.split('\n').filter(line => line.trim());
      expect(lines[0]).toContain('Third');
      expect(lines[1]).toContain('First');
      expect(lines[2]).toContain('Second');
    });

    it('should handle complex HTML with nested elements', () => {
      const paragraphs = [
        '<p>Paragraph with <strong>bold</strong> and <em>italic</em> text</p>',
        '<p>Normal paragraph</p>'
      ];
      
      const result = extractParagraphsByIndex(paragraphs, [0]);
      
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<em>italic</em>');
    });

    it('should skip invalid indices', () => {
      const paragraphs = [
        '<p>First</p>',
        '<p>Second</p>'
      ];
      
      const result = extractParagraphsByIndex(paragraphs, [-1, 0, 5, 1]);
      
      expect(result).toContain('First');
      expect(result).toContain('Second');
      const lines = result.split('\n').filter(line => line.trim());
      expect(lines).toHaveLength(2);
    });
  });

  describe('extractParagraphsById (deprecated)', () => {
    it('should extract paragraphs by their IDs', () => {
      const html = `
        <p data-para-id="para1">First paragraph</p>
        <p data-para-id="para2">Second paragraph</p>
        <p data-para-id="para3">Third paragraph</p>
      `;
      
      const result = extractParagraphsById(html, ['para1', 'para3']);
      
      expect(result).toContain('First paragraph');
      expect(result).toContain('Third paragraph');
      expect(result).not.toContain('Second paragraph');
    });

    it('should preserve paragraph styling', () => {
      const html = `
        <p data-para-id="para1" style="color: red; font-weight: bold;">Styled paragraph</p>
        <p data-para-id="para2">Normal paragraph</p>
      `;
      
      const result = extractParagraphsById(html, ['para1']);
      
      expect(result).toContain('style="color: red; font-weight: bold;"');
      expect(result).toContain('Styled paragraph');
    });

    it('should return empty string when no paragraphs match', () => {
      const html = `
        <p data-para-id="para1">First paragraph</p>
        <p data-para-id="para2">Second paragraph</p>
      `;
      
      const result = extractParagraphsById(html, ['para3', 'para4']);
      
      expect(result).toBe('');
    });

    it('should return empty string when html is empty', () => {
      const result = extractParagraphsById('', ['para1']);
      expect(result).toBe('');
    });

    it('should return empty string when paragraphIds is empty', () => {
      const html = '<p data-para-id="para1">First paragraph</p>';
      const result = extractParagraphsById(html, []);
      expect(result).toBe('');
    });

    it('should handle multiple paragraphs with same ID gracefully', () => {
      const html = `
        <p data-para-id="para1">First occurrence</p>
        <p data-para-id="para1">Second occurrence</p>
        <p data-para-id="para2">Different paragraph</p>
      `;
      
      const result = extractParagraphsById(html, ['para1']);
      
      // Should only extract the first matching paragraph
      expect(result).toContain('First occurrence');
    });

    it('should extract paragraphs in the order they appear in HTML', () => {
      const html = `
        <p data-para-id="para1">First</p>
        <p data-para-id="para2">Second</p>
        <p data-para-id="para3">Third</p>
      `;
      
      // Request in different order
      const result = extractParagraphsById(html, ['para3', 'para1', 'para2']);
      
      // Should be extracted in the order they appear in the provided array
      const lines = result.split('\n').filter(line => line.trim());
      expect(lines[0]).toContain('Third');
      expect(lines[1]).toContain('First');
      expect(lines[2]).toContain('Second');
    });

    it('should handle complex HTML with nested elements', () => {
      const html = `
        <p data-para-id="para1">
          Paragraph with <strong>bold</strong> and <em>italic</em> text
        </p>
        <p data-para-id="para2">Normal paragraph</p>
      `;
      
      const result = extractParagraphsById(html, ['para1']);
      
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<em>italic</em>');
    });
  });

  describe('getParagraphIndicesFromComment', () => {
    it('should return paragraphIds (indices) from comment', () => {
      const comment = {
        id: 'test-comment',
        author: 'Test Author',
        date: new Date(),
        plainText: 'Test',
        content: '<p>Test</p>',
        documentId: 'test-doc',
        paragraphIds: [0, 2]
      } as DocumentComment;
      
      const result = getParagraphIndicesFromComment(comment);
      expect(result).toEqual([0, 2]);
    });

    it('should return empty array when paragraphIds is undefined', () => {
      const comment = {
        id: 'test-comment',
        author: 'Test Author',
        date: new Date(),
        plainText: 'Test',
        content: '<p>Test</p>',
        documentId: 'test-doc'
      } as DocumentComment;
      
      const result = getParagraphIndicesFromComment(comment);
      expect(result).toEqual([]);
    });

    it('should return empty array when comment has empty paragraphIds', () => {
      const comment = {
        id: 'test-comment',
        author: 'Test Author',
        date: new Date(),
        plainText: 'Test',
        content: '<p>Test</p>',
        documentId: 'test-doc',
        paragraphIds: []
      } as DocumentComment;
      
      const result = getParagraphIndicesFromComment(comment);
      expect(result).toEqual([]);
    });
  });

  describe('getParagraphIdsFromComment (deprecated)', () => {
    it('should return paragraphIds from comment', () => {
      const comment = {
        id: 'test-comment',
        author: 'Test Author',
        date: new Date(),
        plainText: 'Test',
        content: '<p>Test</p>',
        documentId: 'test-doc',
        paragraphIds: ['para1', 'para2']
      };
      
      const result = getParagraphIdsFromComment(comment);
      expect(result).toEqual(['para1', 'para2']);
    });

    it('should return empty array when paragraphIds is undefined', () => {
      const comment = {} as { paragraphIds?: string[] | number[] };
      
      const result = getParagraphIdsFromComment(comment);
      expect(result).toEqual([]);
    });

    it('should return empty array when comment has empty paragraphIds', () => {
      const comment = {
        id: 'test-comment',
        author: 'Test Author',
        date: new Date(),
        plainText: 'Test',
        content: '<p>Test</p>',
        documentId: 'test-doc',
        paragraphIds: []
      } as DocumentComment;
      
      const result = getParagraphIdsFromComment(comment);
      expect(result).toEqual([]);
    });
  });
});
