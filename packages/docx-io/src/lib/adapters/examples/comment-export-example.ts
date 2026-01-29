/**
 * T095a: Comment Export Example
 *
 * Demonstrates how to export Plate comments to DOCX format using
 * docXMLater's CommentManager and Comment classes.
 *
 * This example shows:
 * - Simple single-author comments
 * - Multiple-author comments
 * - Comment range markers (start/end)
 * - OOXML-compliant comment XML generation
 */

import {
  Document,
  Paragraph,
  Run,
  Comment,
  CommentManager,
  RangeMarker,
} from '../../docXMLater/src';

/**
 * Plate comment structure (from plate/comments plugin)
 */
interface PlateComment {
  id: string;
  value: string;
  createdAt: number;
  userId: string;
  userName?: string;
  userInitials?: string;
  parentId?: string; // For threaded comments (see comment-threaded-example.ts)
}

/**
 * Simple comment export example
 *
 * Creates a document with a single paragraph containing a comment.
 */
export function createSimpleCommentDocument(): Document {
  const doc = new Document();
  const commentManager = new CommentManager();

  // Create a comment
  const comment = new Comment({
    id: 1,
    author: 'John Smith',
    initials: 'JS',
    date: new Date('2025-01-15T10:30:00Z'),
    text: 'This needs clarification.',
  });

  commentManager.add(comment);

  // Create paragraph with comment markers
  const paragraph = new Paragraph();

  // Add comment range start marker
  paragraph.addContent(
    new RangeMarker({
      type: 'commentRangeStart',
      id: 1,
    })
  );

  // Add the commented text
  paragraph.addContent(new Run('This text has a comment attached.'));

  // Add comment range end marker
  paragraph.addContent(
    new RangeMarker({
      type: 'commentRangeEnd',
      id: 1,
    })
  );

  // Add comment reference (w:commentReference)
  paragraph.addContent(
    new RangeMarker({
      type: 'commentReference',
      id: 1,
    })
  );

  doc.addParagraph(paragraph);

  return doc;
}

/**
 * Multiple author comment example
 *
 * Creates a document with comments from multiple reviewers.
 */
export function createMultiAuthorCommentDocument(): Document {
  const doc = new Document();
  const commentManager = new CommentManager();

  // Create comments from different authors
  const comments: PlateComment[] = [
    {
      id: 'c1',
      value: 'Great introduction!',
      createdAt: Date.now() - 3_600_000, // 1 hour ago
      userId: 'user1',
      userName: 'Alice Johnson',
      userInitials: 'AJ',
    },
    {
      id: 'c2',
      value: 'Can we add more details here?',
      createdAt: Date.now() - 1_800_000, // 30 min ago
      userId: 'user2',
      userName: 'Bob Wilson',
      userInitials: 'BW',
    },
    {
      id: 'c3',
      value: 'Approved. Good work!',
      createdAt: Date.now(),
      userId: 'user3',
      userName: 'Carol Davis',
      userInitials: 'CD',
    },
  ];

  // Convert Plate comments to DOCX comments
  comments.forEach((plateComment, index) => {
    const comment = new Comment({
      id: index + 1,
      author: plateComment.userName || plateComment.userId,
      initials:
        plateComment.userInitials ||
        plateComment.userId.slice(0, 2).toUpperCase(),
      date: new Date(plateComment.createdAt),
      text: plateComment.value,
    });

    commentManager.add(comment);
  });

  // Create paragraphs with comment markers
  const para1 = new Paragraph();
  para1.addContent(new RangeMarker({ type: 'commentRangeStart', id: 1 }));
  para1.addContent(new Run('This is the introduction paragraph.'));
  para1.addContent(new RangeMarker({ type: 'commentRangeEnd', id: 1 }));
  para1.addContent(new RangeMarker({ type: 'commentReference', id: 1 }));

  const para2 = new Paragraph();
  para2.addContent(new RangeMarker({ type: 'commentRangeStart', id: 2 }));
  para2.addContent(
    new Run('This section needs more details according to reviewer.')
  );
  para2.addContent(new RangeMarker({ type: 'commentRangeEnd', id: 2 }));
  para2.addContent(new RangeMarker({ type: 'commentReference', id: 2 }));

  const para3 = new Paragraph();
  para3.addContent(new RangeMarker({ type: 'commentRangeStart', id: 3 }));
  para3.addContent(new Run('The conclusion is well written.'));
  para3.addContent(new RangeMarker({ type: 'commentRangeEnd', id: 3 }));
  para3.addContent(new RangeMarker({ type: 'commentReference', id: 3 }));

  doc.addParagraph(para1);
  doc.addParagraph(para2);
  doc.addParagraph(para3);

  return doc;
}

/**
 * Comment with formatted content example
 *
 * Shows comments on text with various formatting (bold, italic, etc.)
 */
export function createFormattedTextCommentDocument(): Document {
  const doc = new Document();
  const commentManager = new CommentManager();

  const comment = new Comment({
    id: 1,
    author: 'Editor',
    initials: 'Ed',
    date: new Date(),
    text: 'Check if this emphasis is appropriate.',
  });

  commentManager.add(comment);

  const paragraph = new Paragraph();

  paragraph.addContent(new Run('Normal text, then '));

  // Comment spans formatted text
  paragraph.addContent(new RangeMarker({ type: 'commentRangeStart', id: 1 }));
  paragraph.addContent(
    new Run('emphasized text', { bold: true, italic: true })
  );
  paragraph.addContent(new RangeMarker({ type: 'commentRangeEnd', id: 1 }));
  paragraph.addContent(new RangeMarker({ type: 'commentReference', id: 1 }));

  paragraph.addContent(new Run(', and more normal text.'));

  doc.addParagraph(paragraph);

  return doc;
}

/**
 * Export helper that generates the comment.xml content
 *
 * In a full implementation, this would be called during document save
 * to create the word/comments.xml file.
 */
export function generateCommentsXml(commentManager: CommentManager): string {
  return commentManager.toXML();
}

/**
 * Usage example for integrating with Plate export
 */
export function plateCommentsToDocx(plateComments: PlateComment[]): {
  comments: Comment[];
  commentsXml: string;
} {
  const commentManager = new CommentManager();
  const comments: Comment[] = [];

  plateComments.forEach((plateComment, index) => {
    const comment = new Comment({
      id: index + 1,
      author: plateComment.userName || plateComment.userId,
      initials:
        plateComment.userInitials ||
        plateComment.userId.slice(0, 2).toUpperCase(),
      date: new Date(plateComment.createdAt),
      text: plateComment.value,
    });

    commentManager.add(comment);
    comments.push(comment);
  });

  return {
    comments,
    commentsXml: commentManager.toXML(),
  };
}
