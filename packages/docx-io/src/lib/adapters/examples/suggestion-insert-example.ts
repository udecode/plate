/**
 * T095c: Suggestion Insert Example
 *
 * Demonstrates how to export Plate insertion suggestions to DOCX track changes.
 * Insertions in OOXML are represented by <w:ins> elements containing the
 * inserted content with author and date attributes.
 *
 * This example shows:
 * - Simple text insertions
 * - Formatted text insertions
 * - Multi-run insertions
 * - Integration with RevisionManager
 */

import {
  Document,
  Paragraph,
  Run,
  Revision,
  RevisionManager,
} from '../../docXMLater/src';

/**
 * Plate suggestion structure for insertions
 */
interface PlateSuggestionInsert {
  id: string;
  type: 'insert';
  text: string;
  userId: string;
  userName?: string;
  createdAt: number;
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  };
}

/**
 * Creates a document with a simple insertion track change
 */
export function createSimpleInsertionDocument(): Document {
  const doc = new Document();
  const revisionManager = new RevisionManager();

  // Create a paragraph with normal text and an insertion
  const paragraph = new Paragraph();

  // Normal text
  paragraph.addContent(new Run('The quick '));

  // Create insertion revision
  const insertedRun = new Run('brown ');
  const insertion = new Revision({
    type: 'insert',
    author: 'Editor',
    date: new Date(),
    content: insertedRun,
  });

  // Register with manager to get proper ID
  revisionManager.register(insertion);

  // Add the revision to the paragraph
  paragraph.addRevision(insertion);

  // More normal text
  paragraph.addContent(new Run('fox jumps over the lazy dog.'));

  doc.addParagraph(paragraph);

  return doc;
}

/**
 * Creates a document with multiple insertions from different authors
 */
export function createMultiAuthorInsertionDocument(): Document {
  const doc = new Document();
  const revisionManager = new RevisionManager();

  // Simulate suggestions from Plate editor
  const suggestions: PlateSuggestionInsert[] = [
    {
      id: 'sugg1',
      type: 'insert',
      text: 'important ',
      userId: 'user1',
      userName: 'Alice',
      createdAt: Date.now() - 3_600_000,
    },
    {
      id: 'sugg2',
      type: 'insert',
      text: 'very ',
      userId: 'user2',
      userName: 'Bob',
      createdAt: Date.now() - 1_800_000,
    },
    {
      id: 'sugg3',
      type: 'insert',
      text: ' (pending review)',
      userId: 'user1',
      userName: 'Alice',
      createdAt: Date.now(),
    },
  ];

  const paragraph = new Paragraph();

  // "This is an [important] [very] significant document [pending review]."
  paragraph.addContent(new Run('This is an '));

  // First insertion: "important"
  const ins1 = createInsertionFromSuggestion(suggestions[0], revisionManager);
  paragraph.addRevision(ins1);

  // Second insertion: "very"
  const ins2 = createInsertionFromSuggestion(suggestions[1], revisionManager);
  paragraph.addRevision(ins2);

  paragraph.addContent(new Run('significant document'));

  // Third insertion: "(pending review)"
  const ins3 = createInsertionFromSuggestion(suggestions[2], revisionManager);
  paragraph.addRevision(ins3);

  paragraph.addContent(new Run('.'));

  doc.addParagraph(paragraph);

  return doc;
}

/**
 * Creates a document with formatted insertion
 */
export function createFormattedInsertionDocument(): Document {
  const doc = new Document();
  const revisionManager = new RevisionManager();

  const paragraph = new Paragraph();

  paragraph.addContent(new Run('Regular text, then '));

  // Create formatted inserted run
  const formattedRun = new Run('bold and italic inserted text', {
    bold: true,
    italic: true,
  });

  const insertion = new Revision({
    type: 'insert',
    author: 'Formatter',
    date: new Date(),
    content: formattedRun,
  });

  revisionManager.register(insertion);
  paragraph.addRevision(insertion);

  paragraph.addContent(new Run(', and back to regular.'));

  doc.addParagraph(paragraph);

  return doc;
}

/**
 * Creates an insertion revision from a Plate suggestion
 */
export function createInsertionFromSuggestion(
  suggestion: PlateSuggestionInsert,
  manager: RevisionManager
): Revision {
  const formatting = suggestion.formatting || {};

  const run = new Run(suggestion.text, {
    bold: formatting.bold,
    italic: formatting.italic,
    underline: formatting.underline ? 'single' : undefined,
  });

  const revision = new Revision({
    type: 'insert',
    author: suggestion.userName || suggestion.userId,
    date: new Date(suggestion.createdAt),
    content: run,
  });

  return manager.register(revision);
}

/**
 * Generates the XML for an insertion
 * Example output:
 * <w:ins w:id="0" w:author="Editor" w:date="2025-01-15T10:30:00Z">
 *   <w:r>
 *     <w:t>inserted text</w:t>
 *   </w:r>
 * </w:ins>
 */
export function generateInsertionXml(
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

  return `<w:ins w:id="${id}" w:author="${escapedAuthor}" w:date="${isoDate}">
  <w:r>
    <w:t>${escapedText}</w:t>
  </w:r>
</w:ins>`;
}

/**
 * Batch conversion of Plate insertions to DOCX revisions
 */
export function convertPlateSuggestionsToInsertions(
  suggestions: PlateSuggestionInsert[],
  manager: RevisionManager
): Map<string, Revision> {
  const result = new Map<string, Revision>();

  suggestions.forEach((suggestion) => {
    if (suggestion.type === 'insert') {
      const revision = createInsertionFromSuggestion(suggestion, manager);
      result.set(suggestion.id, revision);
    }
  });

  return result;
}

/**
 * Example showing paragraph-level insertion
 * (When an entire new paragraph is inserted)
 */
export function createParagraphInsertionDocument(): Document {
  const doc = new Document();
  const revisionManager = new RevisionManager();

  // First paragraph (existing)
  const para1 = new Paragraph();
  para1.addContent(new Run('This is the first paragraph.'));
  doc.addParagraph(para1);

  // Second paragraph (inserted)
  const para2 = new Paragraph();

  const insertedRun = new Run(
    'This entire paragraph was inserted during editing.'
  );
  const insertion = new Revision({
    type: 'insert',
    author: 'Reviewer',
    date: new Date(),
    content: insertedRun,
  });

  revisionManager.register(insertion);
  para2.addRevision(insertion);
  doc.addParagraph(para2);

  // Third paragraph (existing)
  const para3 = new Paragraph();
  para3.addContent(new Run('This is the third paragraph.'));
  doc.addParagraph(para3);

  return doc;
}

/**
 * Utility to count insertions in a document
 */
export function countInsertions(manager: RevisionManager): number {
  const summary = manager.getSummary();
  return summary.byType.insertions;
}
