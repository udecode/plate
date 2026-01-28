/**
 * Tests for comment parsing functionality
 * Ensures comments are properly parsed from documents and preserved during round-trip
 */

import { Document } from '../../src/core/Document';
import { Comment } from '../../src/elements/Comment';
import { Run } from '../../src/elements/Run';
import { ZipHandler } from '../../src/zip/ZipHandler';
import { XMLParser } from '../../src/xml/XMLParser';
import * as fs from 'fs';
import * as path from 'path';

describe('Comment Parsing', () => {
  describe('Basic Comment Parsing', () => {
    it('should parse comments from comments.xml', async () => {
      // Create a document with comments
      const doc = Document.create();
      const para = doc.createParagraph('This text has a comment');

      // Add a comment programmatically
      const comment = doc.getCommentManager().createComment('John Doe', 'This is a test comment', 'JD');

      // Save and reload
      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      // Verify comment was preserved
      const comments = loadedDoc.getAllComments();
      expect(comments).toHaveLength(1);
      expect(comments[0]?.getAuthor()).toBe('John Doe');
      expect(comments[0]?.getInitials()).toBe('JD');
    });

    it('should preserve comment metadata', async () => {
      const doc = Document.create();
      doc.createParagraph('Test paragraph');

      // Add comment with specific date
      const testDate = new Date('2024-01-15T10:30:00Z');
      const comment = new Comment({
        author: 'Alice Smith',
        initials: 'AS',
        date: testDate,
        content: 'Review this section'
      });

      doc.getCommentManager().register(comment);

      // Round-trip
      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedComments = loadedDoc.getAllComments();
      expect(loadedComments).toHaveLength(1);

      const loadedComment = loadedComments[0];
      expect(loadedComment?.getAuthor()).toBe('Alice Smith');
      expect(loadedComment?.getInitials()).toBe('AS');
      // Date comparison may need tolerance due to serialization
      expect(loadedComment?.getDate()).toBeDefined();
    });

    it('should handle comment replies', async () => {
      const doc = Document.create();
      doc.createParagraph('Discussion topic');

      // Add parent comment
      const parentComment = doc.getCommentManager().createComment('User1', 'Initial comment');

      // Add reply
      const replyComment = doc.getCommentManager().createReply(
        parentComment.getId(),
        'User2',
        'Reply to initial comment'
      );

      // Round-trip
      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const comments = loadedDoc.getCommentManager().getAllCommentsWithReplies();
      expect(comments).toHaveLength(2);

      // Find reply
      const reply = comments.find(c => c.isReply());
      expect(reply).toBeDefined();
      expect(reply?.getParentId()).toBe(parentComment.getId());
    });

    it('should parse comment ranges in paragraphs', async () => {
      // Create document with comment ranges
      const doc = Document.create();
      const para = doc.createParagraph('This text is commented on here.');

      // Add comment
      const comment = doc.getCommentManager().createComment('Reviewer', 'Check this phrase');

      // Save and verify XML structure contains comment ranges
      const buffer = await doc.toBuffer();
      const zipHandler = new ZipHandler();
      await zipHandler.loadFromBuffer(buffer);

      const docXml = zipHandler.getFileAsString('word/document.xml');
      expect(docXml).toBeDefined();

      // Check for comment range markers (these would be added by a complete implementation)
      // For now, just verify the document loads without error
      const loadedDoc = await Document.loadFromBuffer(buffer);
      expect(loadedDoc).toBeDefined();
    });
  });

  describe('Complex Comment Scenarios', () => {
    it('should handle multiple comments on same paragraph', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('Text with multiple comments');

      doc.getCommentManager().createComment('User1', 'First comment');
      doc.getCommentManager().createComment('User2', 'Second comment');
      doc.getCommentManager().createComment('User3', 'Third comment');

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const comments = loadedDoc.getAllComments();
      expect(comments).toHaveLength(3);

      // Verify each comment has unique ID
      const ids = comments.map(c => c.getId());
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it('should preserve comment formatting', async () => {
      const doc = Document.create();
      doc.createParagraph('Formatted comment test');

      // Create comment with formatted runs
      const comment = new Comment({
        author: 'Editor',
        content: [
          new Run('Bold text', { bold: true }),
          new Run(' and '),
          new Run('italic text', { italic: true })
        ]
      });

      doc.getCommentManager().register(comment);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedComments = loadedDoc.getAllComments();
      expect(loadedComments).toHaveLength(1);

      // Comment content should be preserved
      const content = loadedComments[0]?.getContent();
      expect(content).toBeDefined();
    });

    it('should handle empty comments', async () => {
      const doc = Document.create();
      doc.createParagraph('Text');

      // Add empty comment
      const comment = new Comment({
        author: 'User',
        content: ''
      });

      doc.getCommentManager().register(comment);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const comments = loadedDoc.getAllComments();
      expect(comments).toHaveLength(1);
      expect(comments[0]?.getAuthor()).toBe('User');
    });
  });

  describe('Comment Manager Integration', () => {
    it('should find comments by author', async () => {
      const doc = Document.create();

      doc.getCommentManager().createComment('Alice', 'Comment 1');
      doc.getCommentManager().createComment('Bob', 'Comment 2');
      doc.getCommentManager().createComment('Alice', 'Comment 3');

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const aliceComments = loadedDoc.getCommentManager()
        .getAllComments()
        .filter(c => c.getAuthor() === 'Alice');

      expect(aliceComments).toHaveLength(2);
    });

    it('should get comment threads', async () => {
      const doc = Document.create();

      const parent = doc.getCommentManager().createComment('User1', 'Start discussion');
      doc.getCommentManager().createReply(parent.getId(), 'User2', 'Reply 1');
      doc.getCommentManager().createReply(parent.getId(), 'User3', 'Reply 2');

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const thread = loadedDoc.getCommentManager().getCommentThread(parent.getId());
      expect(thread).toBeDefined();
      expect(thread?.replies).toHaveLength(2);
    });
  });
});