/**
 * T095d: Suggestion Delete Example
 *
 * Demonstrates how to export Plate deletion suggestions to DOCX track changes.
 * Deletions in OOXML are represented by <w:del> elements containing
 * <w:delText> elements with the deleted content.
 *
 * Key differences from insertions:
 * - Uses <w:del> instead of <w:ins>
 * - Text wrapped in <w:delText> instead of <w:t>
 * - Deleted text is typically shown with strikethrough in Word
 */

import {
  Document,
  Paragraph,
  Run,
  Revision,
  RevisionManager,
} from '../../docXMLater/src';

/**
 * Plate suggestion structure for deletions
 */
interface PlateSuggestionDelete {
  id: string;
  type: 'delete';
  text: string;
  userId: string;
  userName?: string;
  createdAt: number;
}

/**
 * Creates a document with a simple deletion track change
 */
export function createSimpleDeletionDocument(): Document {
  const doc = new Document();
  const revisionManager = new RevisionManager();

  const paragraph = new Paragraph();

  // Normal text
  paragraph.addContent(new Run('The quick '));

  // Create deletion revision
  const deletedRun = new Run('brown ');
  const deletion = new Revision({
    type: 'delete',
    author: 'Editor',
    date: new Date(),
    content: deletedRun,
  });

  revisionManager.register(deletion);
  paragraph.addRevision(deletion);

  // Remaining text
  paragraph.addContent(new Run('fox jumps over the lazy dog.'));

  doc.addParagraph(paragraph);

  return doc;
}

/**
 * Creates a document with multiple deletions
 */
export function createMultipleDeletionDocument(): Document {
  const doc = new Document();
  const revisionManager = new RevisionManager();

  // Simulate suggestions from Plate editor
  const deletions: PlateSuggestionDelete[] = [
    {
      id: 'del1',
      type: 'delete',
      text: 'unnecessary ',
      userId: 'user1',
      userName: 'Editor Alice',
      createdAt: Date.now() - 3_600_000,
    },
    {
      id: 'del2',
      type: 'delete',
      text: 'redundant ',
      userId: 'user2',
      userName: 'Editor Bob',
      createdAt: Date.now() - 1_800_000,
    },
    {
      id: 'del3',
      type: 'delete',
      text: ' that nobody reads',
      userId: 'user1',
      userName: 'Editor Alice',
      createdAt: Date.now(),
    },
  ];

  const paragraph = new Paragraph();

  // "This is an [unnecessary] [redundant] important document [that nobody reads]."
  paragraph.addContent(new Run('This is an '));

  // First deletion
  const del1 = createDeletionFromSuggestion(deletions[0], revisionManager);
  paragraph.addRevision(del1);

  // Second deletion
  const del2 = createDeletionFromSuggestion(deletions[1], revisionManager);
  paragraph.addRevision(del2);

  paragraph.addContent(new Run('important document'));

  // Third deletion
  const del3 = createDeletionFromSuggestion(deletions[2], revisionManager);
  paragraph.addRevision(del3);

  paragraph.addContent(new Run('.'));

  doc.addParagraph(paragraph);

  return doc;
}

/**
 * Creates a deletion revision from a Plate suggestion
 */
export function createDeletionFromSuggestion(
  suggestion: PlateSuggestionDelete,
  manager: RevisionManager
): Revision {
  const run = new Run(suggestion.text);

  const revision = new Revision({
    type: 'delete',
    author: suggestion.userName || suggestion.userId,
    date: new Date(suggestion.createdAt),
    content: run,
  });

  return manager.register(revision);
}

/**
 * Generates the XML for a deletion
 * Example output:
 * <w:del w:id="0" w:author="Editor" w:date="2025-01-15T10:30:00Z">
 *   <w:r>
 *     <w:delText>deleted text</w:delText>
 *   </w:r>
 * </w:del>
 */
export function generateDeletionXml(
  text: string,
  author: string,
  date: Date,
  id: number
): string {
  const isoDate = date.toISOString();
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const escapedAuthor = author
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return `<w:del w:id="${id}" w:author="${escapedAuthor}" w:date="${isoDate}">
  <w:r>
    <w:delText>${escapedText}</w:delText>
  </w:r>
</w:del>`;
}

/**
 * Creates a document showing word-level deletion
 * (Common editing scenario: removing individual words)
 */
export function createWordDeletionDocument(): Document {
  const doc = new Document();
  const revisionManager = new RevisionManager();

  const paragraph = new Paragraph();

  // Original: "This is a very important and significant document."
  // After deletion: "This is an important document."

  paragraph.addContent(new Run('This is a'));

  // Delete "very "
  const del1Run = new Run(' very');
  const del1 = new Revision({
    type: 'delete',
    author: 'Concise Editor',
    date: new Date(),
    content: del1Run,
  });
  revisionManager.register(del1);
  paragraph.addRevision(del1);

  paragraph.addContent(new Run('n important'));

  // Delete " and significant"
  const del2Run = new Run(' and significant');
  const del2 = new Revision({
    type: 'delete',
    author: 'Concise Editor',
    date: new Date(),
    content: del2Run,
  });
  revisionManager.register(del2);
  paragraph.addRevision(del2);

  paragraph.addContent(new Run(' document.'));

  doc.addParagraph(paragraph);

  return doc;
}

/**
 * Creates a document showing paragraph deletion
 * (When an entire paragraph is marked for removal)
 */
export function createParagraphDeletionDocument(): Document {
  const doc = new Document();
  const revisionManager = new RevisionManager();

  // First paragraph (remains)
  const para1 = new Paragraph();
  para1.addContent(new Run('This is the first paragraph that stays.'));
  doc.addParagraph(para1);

  // Second paragraph (deleted)
  const para2 = new Paragraph();
  const deletedRun = new Run('This entire paragraph is marked for deletion.');
  const deletion = new Revision({
    type: 'delete',
    author: 'Restructure Bot',
    date: new Date(),
    content: deletedRun,
  });
  revisionManager.register(deletion);
  para2.addRevision(deletion);
  doc.addParagraph(para2);

  // Third paragraph (remains)
  const para3 = new Paragraph();
  para3.addContent(new Run('This is the third paragraph that stays.'));
  doc.addParagraph(para3);

  return doc;
}

/**
 * Batch conversion of Plate deletions to DOCX revisions
 */
export function convertPlateSuggestionsToDeletions(
  suggestions: PlateSuggestionDelete[],
  manager: RevisionManager
): Map<string, Revision> {
  const result = new Map<string, Revision>();

  suggestions.forEach((suggestion) => {
    if (suggestion.type === 'delete') {
      const revision = createDeletionFromSuggestion(suggestion, manager);
      result.set(suggestion.id, revision);
    }
  });

  return result;
}

/**
 * Utility to count deletions in a document
 */
export function countDeletions(manager: RevisionManager): number {
  const summary = manager.getSummary();
  return summary.byType.deletions;
}

/**
 * Generates statistics about deletions
 */
export function getDeletionStats(manager: RevisionManager): {
  total: number;
  byAuthor: Map<string, number>;
  totalCharsDeleted: number;
} {
  const deletions = manager
    .getAllRevisions()
    .filter((r) => r.getType() === 'delete');

  const byAuthor = new Map<string, number>();
  let totalChars = 0;

  deletions.forEach((deletion) => {
    const author = deletion.getAuthor();
    byAuthor.set(author, (byAuthor.get(author) || 0) + 1);

    deletion.getRuns().forEach((run) => {
      totalChars += run.getText().length;
    });
  });

  return {
    total: deletions.length,
    byAuthor,
    totalCharsDeleted: totalChars,
  };
}
