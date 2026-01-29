/**
 * T095b: Threaded Comments Example
 *
 * Demonstrates how to export Plate's nested/threaded comments to DOCX format.
 * OOXML supports comment threading through:
 * - w:comment elements with w:id attributes
 * - Reply associations through comment IDs
 * - Timestamp ordering for thread display
 *
 * Note: Word's native threading uses People.xml and commentsExtended.xml
 * for full threading support in modern Word versions.
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
 * Plate comment with threading support
 */
interface PlateThreadedComment {
  id: string;
  value: string;
  createdAt: number;
  userId: string;
  userName?: string;
  userInitials?: string;
  parentId?: string; // Links to parent comment for replies
  isResolved?: boolean;
}

/**
 * Thread structure for organizing comments
 */
interface CommentThread {
  rootComment: PlateThreadedComment;
  replies: PlateThreadedComment[];
}

/**
 * Creates a document with a threaded comment discussion
 */
export function createThreadedCommentDocument(): Document {
  const doc = new Document();
  const commentManager = new CommentManager();

  // Simulate a threaded discussion
  const threadedComments: PlateThreadedComment[] = [
    // Root comment
    {
      id: 'thread1-root',
      value: 'Should we use a different approach here?',
      createdAt: Date.now() - 7_200_000, // 2 hours ago
      userId: 'user1',
      userName: 'Alice Johnson',
      userInitials: 'AJ',
    },
    // Reply 1
    {
      id: 'thread1-reply1',
      value:
        'I think the current approach is fine. What specifically concerns you?',
      createdAt: Date.now() - 5_400_000, // 1.5 hours ago
      userId: 'user2',
      userName: 'Bob Wilson',
      userInitials: 'BW',
      parentId: 'thread1-root',
    },
    // Reply 2
    {
      id: 'thread1-reply2',
      value:
        'Performance might be an issue with large datasets. Can we add benchmarks?',
      createdAt: Date.now() - 3_600_000, // 1 hour ago
      userId: 'user1',
      userName: 'Alice Johnson',
      userInitials: 'AJ',
      parentId: 'thread1-root',
    },
    // Reply 3
    {
      id: 'thread1-reply3',
      value: "Good point. I'll add benchmarks in the next commit.",
      createdAt: Date.now() - 1_800_000, // 30 min ago
      userId: 'user2',
      userName: 'Bob Wilson',
      userInitials: 'BW',
      parentId: 'thread1-root',
    },
  ];

  // Convert to DOCX comments with threading metadata
  // In OOXML, threading is represented through commentsExtended.xml
  // For basic support, we concatenate replies into a single comment

  const thread = organizeIntoThreads(threadedComments)[0];
  const combinedText = formatThreadAsText(thread);

  const comment = new Comment({
    id: 1,
    author: thread.rootComment.userName || 'Unknown',
    initials: thread.rootComment.userInitials || 'UN',
    date: new Date(thread.rootComment.createdAt),
    text: combinedText,
  });

  commentManager.add(comment);

  // Create document with commented section
  const paragraph = new Paragraph();
  paragraph.addContent(new RangeMarker({ type: 'commentRangeStart', id: 1 }));
  paragraph.addContent(
    new Run('This implementation uses a specific algorithm for processing.')
  );
  paragraph.addContent(new RangeMarker({ type: 'commentRangeEnd', id: 1 }));
  paragraph.addContent(new RangeMarker({ type: 'commentReference', id: 1 }));

  doc.addParagraph(paragraph);

  return doc;
}

/**
 * Organizes flat comment list into thread structures
 */
export function organizeIntoThreads(
  comments: PlateThreadedComment[]
): CommentThread[] {
  const threads: CommentThread[] = [];
  const replyMap = new Map<string, PlateThreadedComment[]>();

  // First pass: separate root comments from replies
  const rootComments = comments.filter((c) => !c.parentId);

  comments.forEach((comment) => {
    if (comment.parentId) {
      const existing = replyMap.get(comment.parentId) || [];
      existing.push(comment);
      replyMap.set(comment.parentId, existing);
    }
  });

  // Build threads
  rootComments.forEach((root) => {
    const replies = replyMap.get(root.id) || [];
    // Sort replies by creation time
    replies.sort((a, b) => a.createdAt - b.createdAt);

    threads.push({
      rootComment: root,
      replies,
    });
  });

  return threads;
}

/**
 * Formats a thread as text for single-comment representation
 * Used when targeting older Word formats without full threading support
 */
export function formatThreadAsText(thread: CommentThread): string {
  const lines: string[] = [];

  // Root comment
  lines.push(thread.rootComment.value);

  // Replies with attribution
  thread.replies.forEach((reply) => {
    const author = reply.userName || reply.userId;
    const timestamp = new Date(reply.createdAt).toLocaleString();
    lines.push(`\n---\n${author} (${timestamp}):\n${reply.value}`);
  });

  return lines.join('');
}

/**
 * Extended comment export for modern Word (2016+)
 *
 * Modern Word uses commentsExtended.xml for proper threading.
 * This function generates the extended comments structure.
 */
export function generateCommentsExtendedXml(
  threads: CommentThread[],
  baseCommentId = 0
): string {
  const nsWe = 'http://schemas.microsoft.com/office/word/2012/wordml';
  const nsW15 = 'http://schemas.microsoft.com/office/word/2012/wordml';

  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    `<w15:commentsEx xmlns:w15="${nsW15}" xmlns:wne="${nsWe}" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="w15 wne">`,
  ];

  let currentId = baseCommentId;

  threads.forEach((thread) => {
    // Root comment (not a reply)
    lines.push(
      `  <w15:commentEx w15:paraId="${generateParaId()}" w15:done="0"/>`
    );
    currentId++;

    // Replies reference their parent
    thread.replies.forEach(() => {
      lines.push(
        `  <w15:commentEx w15:paraId="${generateParaId()}" w15:paraIdParent="${generateParaId()}" w15:done="0"/>`
      );
      currentId++;
    });
  });

  lines.push('</w15:commentsEx>');

  return lines.join('\n');
}

/**
 * Generates a unique paragraph ID for comment extended references
 */
function generateParaId(): string {
  return Math.random()
    .toString(16)
    .substring(2, 10)
    .toUpperCase()
    .padStart(8, '0');
}

/**
 * Complete threaded comment export with both basic and extended formats
 */
export function exportThreadedComments(comments: PlateThreadedComment[]): {
  threads: CommentThread[];
  commentsXml: string;
  commentsExtendedXml: string;
  commentManager: CommentManager;
} {
  const threads = organizeIntoThreads(comments);
  const commentManager = new CommentManager();

  let commentId = 1;

  threads.forEach((thread) => {
    // Root comment
    const rootComment = new Comment({
      id: commentId++,
      author: thread.rootComment.userName || thread.rootComment.userId,
      initials:
        thread.rootComment.userInitials ||
        thread.rootComment.userId.slice(0, 2).toUpperCase(),
      date: new Date(thread.rootComment.createdAt),
      text: thread.rootComment.value,
    });
    commentManager.add(rootComment);

    // Replies as separate comments (for full threading in modern Word)
    thread.replies.forEach((reply) => {
      const replyComment = new Comment({
        id: commentId++,
        author: reply.userName || reply.userId,
        initials: reply.userInitials || reply.userId.slice(0, 2).toUpperCase(),
        date: new Date(reply.createdAt),
        text: reply.value,
      });
      commentManager.add(replyComment);
    });
  });

  return {
    threads,
    commentsXml: commentManager.toXML(),
    commentsExtendedXml: generateCommentsExtendedXml(threads),
    commentManager,
  };
}

/**
 * Example: Resolving a comment thread
 */
export function markThreadResolved(thread: CommentThread): CommentThread {
  return {
    ...thread,
    rootComment: {
      ...thread.rootComment,
      isResolved: true,
    },
  };
}
