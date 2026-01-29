/**
 * T095e: Mixed Suggestion Example
 *
 * Demonstrates how to export combined insertion and deletion suggestions
 * to DOCX track changes. This is the most common real-world scenario
 * where text is replaced (delete old + insert new).
 *
 * In OOXML, replacements are represented as:
 * <w:del>old text</w:del><w:ins>new text</w:ins>
 *
 * This example shows:
 * - Text replacements (delete + insert pairs)
 * - Mixed operations from multiple authors
 * - Complex editing scenarios
 * - Reordering and restructuring content
 */

import {
  Document,
  Paragraph,
  Run,
  Revision,
  RevisionManager,
} from '../../docXMLater/src';

/**
 * Plate suggestion for any type
 */
interface PlateSuggestion {
  id: string;
  type: 'insert' | 'delete' | 'update';
  text: string;
  userId: string;
  userName?: string;
  createdAt: number;
  /** For replacements, this groups the delete + insert pair */
  groupId?: string;
}

/**
 * Replacement pair: a deletion and insertion that together form a replacement
 */
interface ReplacementPair {
  deletion: PlateSuggestion;
  insertion: PlateSuggestion;
}

/**
 * Creates a document with a simple text replacement
 *
 * Original: "The old car drove down the road."
 * Changed:  "The new car drove down the highway."
 */
export function createSimpleReplacementDocument(): Document {
  const doc = new Document();
  const revisionManager = new RevisionManager();

  const paragraph = new Paragraph();

  // "The "
  paragraph.addContent(new Run('The '));

  // Replace "old" with "new"
  const del1 = new Revision({
    type: 'delete',
    author: 'Editor',
    date: new Date(),
    content: new Run('old'),
  });
  revisionManager.register(del1);
  paragraph.addRevision(del1);

  const ins1 = new Revision({
    type: 'insert',
    author: 'Editor',
    date: new Date(),
    content: new Run('new'),
  });
  revisionManager.register(ins1);
  paragraph.addRevision(ins1);

  // " car drove down the "
  paragraph.addContent(new Run(' car drove down the '));

  // Replace "road" with "highway"
  const del2 = new Revision({
    type: 'delete',
    author: 'Editor',
    date: new Date(),
    content: new Run('road'),
  });
  revisionManager.register(del2);
  paragraph.addRevision(del2);

  const ins2 = new Revision({
    type: 'insert',
    author: 'Editor',
    date: new Date(),
    content: new Run('highway'),
  });
  revisionManager.register(ins2);
  paragraph.addRevision(ins2);

  paragraph.addContent(new Run('.'));

  doc.addParagraph(paragraph);

  return doc;
}

/**
 * Creates a document with mixed operations from multiple authors
 *
 * Simulates a collaborative editing scenario where:
 * - Author 1 inserts new content
 * - Author 2 deletes some text
 * - Author 1 replaces other text
 */
export function createMultiAuthorMixedDocument(): Document {
  const doc = new Document();
  const revisionManager = new RevisionManager();

  const now = Date.now();
  const suggestions: PlateSuggestion[] = [
    // Author 1 inserts "important "
    {
      id: 's1',
      type: 'insert',
      text: 'important ',
      userId: 'u1',
      userName: 'Alice',
      createdAt: now - 3_600_000,
    },
    // Author 2 deletes "preliminary "
    {
      id: 's2',
      type: 'delete',
      text: 'preliminary ',
      userId: 'u2',
      userName: 'Bob',
      createdAt: now - 1_800_000,
    },
    // Author 1 replaces "draft" with "final version" (grouped)
    {
      id: 's3-del',
      type: 'delete',
      text: 'draft',
      userId: 'u1',
      userName: 'Alice',
      createdAt: now,
      groupId: 'replace-1',
    },
    {
      id: 's3-ins',
      type: 'insert',
      text: 'final version',
      userId: 'u1',
      userName: 'Alice',
      createdAt: now,
      groupId: 'replace-1',
    },
  ];

  const paragraph = new Paragraph();

  // "This is an [+important] [~preliminary] document [~draft ~final version]."
  paragraph.addContent(new Run('This is an '));

  // Insertion: "important "
  const ins1 = createRevisionFromSuggestion(suggestions[0], revisionManager);
  paragraph.addRevision(ins1);

  // Deletion: "preliminary "
  const del1 = createRevisionFromSuggestion(suggestions[1], revisionManager);
  paragraph.addRevision(del1);

  paragraph.addContent(new Run('document '));

  // Replacement: "draft" -> "final version"
  const del2 = createRevisionFromSuggestion(suggestions[2], revisionManager);
  paragraph.addRevision(del2);

  const ins2 = createRevisionFromSuggestion(suggestions[3], revisionManager);
  paragraph.addRevision(ins2);

  paragraph.addContent(new Run('.'));

  doc.addParagraph(paragraph);

  return doc;
}

/**
 * Creates a document showing a complex editing workflow
 *
 * Multiple paragraphs with various tracked changes
 */
export function createComplexEditingDocument(): Document {
  const doc = new Document();
  const revisionManager = new RevisionManager();
  const author = 'Senior Editor';
  const date = new Date('2025-06-15T14:00:00Z');

  // Paragraph 1: Simple insertion
  const para1 = new Paragraph();
  para1.addContent(new Run('Introduction to '));
  const ins1 = new Revision({
    type: 'insert',
    author,
    date,
    content: new Run('Advanced '),
  });
  revisionManager.register(ins1);
  para1.addRevision(ins1);
  para1.addContent(new Run('Document Processing'));
  doc.addParagraph(para1);

  // Paragraph 2: Deletion
  const para2 = new Paragraph();
  para2.addContent(new Run('This chapter covers '));
  const del1 = new Revision({
    type: 'delete',
    author,
    date,
    content: new Run('basic and '),
  });
  revisionManager.register(del1);
  para2.addRevision(del1);
  para2.addContent(new Run('advanced techniques for editing documents.'));
  doc.addParagraph(para2);

  // Paragraph 3: Replacement
  const para3 = new Paragraph();
  para3.addContent(new Run('The '));
  const del2 = new Revision({
    type: 'delete',
    author,
    date,
    content: new Run('old method'),
  });
  revisionManager.register(del2);
  para3.addRevision(del2);
  const ins2 = new Revision({
    type: 'insert',
    author,
    date,
    content: new Run('modern approach'),
  });
  revisionManager.register(ins2);
  para3.addRevision(ins2);
  para3.addContent(new Run(' provides better results.'));
  doc.addParagraph(para3);

  return doc;
}

/**
 * Helper to create a revision from a Plate suggestion
 */
function createRevisionFromSuggestion(
  suggestion: PlateSuggestion,
  manager: RevisionManager
): Revision {
  const run = new Run(suggestion.text);
  const revisionType = suggestion.type === 'delete' ? 'delete' : 'insert';

  const revision = new Revision({
    type: revisionType,
    author: suggestion.userName || suggestion.userId,
    date: new Date(suggestion.createdAt),
    content: run,
  });

  return manager.register(revision);
}

/**
 * Groups suggestions into replacement pairs and standalone operations
 */
export function groupSuggestions(suggestions: PlateSuggestion[]): {
  replacements: ReplacementPair[];
  standalone: PlateSuggestion[];
} {
  const replacements: ReplacementPair[] = [];
  const standalone: PlateSuggestion[] = [];
  const groupedIds = new Set<string>();

  // Find replacement pairs by groupId
  const groups = new Map<string, PlateSuggestion[]>();

  suggestions.forEach((s) => {
    if (s.groupId) {
      const group = groups.get(s.groupId) || [];
      group.push(s);
      groups.set(s.groupId, group);
    }
  });

  groups.forEach((group) => {
    const del = group.find((s) => s.type === 'delete');
    const ins = group.find((s) => s.type === 'insert');

    if (del && ins) {
      replacements.push({ deletion: del, insertion: ins });
      groupedIds.add(del.id);
      groupedIds.add(ins.id);
    }
  });

  // Remaining suggestions are standalone
  suggestions.forEach((s) => {
    if (!groupedIds.has(s.id)) {
      standalone.push(s);
    }
  });

  return { replacements, standalone };
}

/**
 * Generates XML for a replacement (delete + insert pair)
 */
export function generateReplacementXml(
  oldText: string,
  newText: string,
  author: string,
  date: Date,
  delId: number,
  insId: number
): string {
  const isoDate = date.toISOString();
  const escText = (t: string) =>
    t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escAttr = (t: string) => escText(t).replace(/"/g, '&quot;');

  return (
    `<w:del w:id="${delId}" w:author="${escAttr(author)}" w:date="${isoDate}">` +
    `<w:r><w:delText>${escText(oldText)}</w:delText></w:r></w:del>` +
    `<w:ins w:id="${insId}" w:author="${escAttr(author)}" w:date="${isoDate}">` +
    `<w:r><w:t>${escText(newText)}</w:t></w:r></w:ins>`
  );
}

/**
 * Gets a summary of all mixed operations
 */
export function getMixedOperationSummary(manager: RevisionManager): {
  insertions: number;
  deletions: number;
  total: number;
  authors: string[];
  replacementPairsEstimate: number;
} {
  const summary = manager.getSummary();

  // Estimate replacement pairs: min of insertions and deletions
  const replacementPairsEstimate = Math.min(
    summary.byType.insertions,
    summary.byType.deletions
  );

  return {
    insertions: summary.byType.insertions,
    deletions: summary.byType.deletions,
    total: summary.total,
    authors: summary.authors,
    replacementPairsEstimate,
  };
}
