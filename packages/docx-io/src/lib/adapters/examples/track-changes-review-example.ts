/**
 * T095g: Track Changes Review Workflow Example
 *
 * Demonstrates the complete workflow for exporting Plate editor content
 * with track changes to a DOCX document that can be reviewed in
 * Microsoft Word, Google Docs, or LibreOffice.
 *
 * Full workflow:
 * 1. Parse Plate editor HTML with suggestions and comments
 * 2. Build docXMLater Document with RevisionManager
 * 3. Register all tracked changes (insertions, deletions, property changes)
 * 4. Register all comments with CommentManager
 * 5. Validate revision IDs and move pairs
 * 6. Generate the DOCX file
 *
 * This example integrates all the components from T082-T095.
 */

import {
  Document,
  Paragraph,
  Run,
  Revision,
  type RevisionManager,
  Comment,
  CommentManager,
  RangeMarker,
} from '../../docXMLater/src';

import type { TrackingOptions } from '../tracking-bridge';

import {
  integrateRevisionManager,
  getRevisionStats,
  validateRevisions,
} from '../tracking-bridge';

/**
 * Complete Plate export data structure
 */
interface PlateExportData {
  /** HTML content from Plate editor */
  html: string;
  /** Suggestion marks from the suggestion plugin */
  suggestions: PlateExportSuggestion[];
  /** Comments from the comment plugin */
  comments: PlateExportComment[];
  /** Document metadata */
  metadata: {
    title: string;
    author: string;
    lastModified: Date;
  };
}

interface PlateExportSuggestion {
  id: string;
  type: 'insert' | 'delete' | 'update';
  text: string;
  userId: string;
  userName: string;
  createdAt: number;
  /** Range of the suggestion in the document */
  range?: {
    anchor: { path: number[]; offset: number };
    focus: { path: number[]; offset: number };
  };
}

interface PlateExportComment {
  id: string;
  value: string;
  userId: string;
  userName: string;
  userInitials: string;
  createdAt: number;
  parentId?: string;
  /** Range of the comment in the document */
  range?: {
    anchor: { path: number[]; offset: number };
    focus: { path: number[]; offset: number };
  };
}

/**
 * Result of the complete export workflow
 */
interface ExportWorkflowResult {
  document: Document;
  revisionManager: RevisionManager;
  commentManager: CommentManager;
  stats: {
    paragraphCount: number;
    revisionCount: number;
    commentCount: number;
    insertions: number;
    deletions: number;
    propertyChanges: number;
    authors: string[];
  };
  validation: {
    revisionsValid: boolean;
    issues: string[];
  };
}

/**
 * Complete track changes review workflow
 *
 * This function orchestrates the entire export process from Plate data
 * to a reviewable DOCX document.
 */
export function executeReviewWorkflow(
  data: PlateExportData,
  options?: Partial<TrackingOptions>
): ExportWorkflowResult {
  // Step 1: Create document and managers
  const doc = new Document();
  const trackingOptions: TrackingOptions = {
    enableTracking: true,
    defaultAuthor: data.metadata.author,
    defaultDate: data.metadata.lastModified,
    preserveIds: true,
    ...options,
  };

  // Step 2: Integrate RevisionManager
  const revisionResult = integrateRevisionManager(doc, {
    enableTracking: trackingOptions.enableTracking,
    defaultAuthor: trackingOptions.defaultAuthor,
    defaultDate: trackingOptions.defaultDate,
    preserveIds: trackingOptions.preserveIds,
  });
  const { manager: revisionManager } = revisionResult;

  // Step 3: Set up CommentManager
  const commentManager = new CommentManager();

  // Step 4: Process suggestions into revisions
  const revisionMap = processSuggestions(
    data.suggestions,
    revisionManager,
    trackingOptions
  );

  // Step 5: Process comments
  const commentMap = processComments(data.comments, commentManager);

  // Step 6: Build document paragraphs
  // (In a real implementation, this would parse the HTML and integrate revisions)
  const paragraphCount = buildDocumentContent(
    doc,
    data,
    revisionMap,
    commentMap,
    revisionManager,
    commentManager
  );

  // Step 7: Validate
  const validationResult = validateRevisions(revisionManager);

  // Step 8: Gather stats
  const stats = getRevisionStats(revisionManager);

  return {
    document: doc,
    revisionManager,
    commentManager,
    stats: {
      paragraphCount,
      revisionCount: stats.total,
      commentCount: commentMap.size,
      insertions: stats.insertions,
      deletions: stats.deletions,
      propertyChanges: stats.propertyChanges,
      authors: stats.authors,
    },
    validation: validationResult,
  };
}

/**
 * Processes Plate suggestions into DOCX revisions
 */
function processSuggestions(
  suggestions: PlateExportSuggestion[],
  manager: RevisionManager,
  options: TrackingOptions
): Map<string, Revision> {
  const revisionMap = new Map<string, Revision>();

  suggestions.forEach((suggestion) => {
    const revisionType =
      suggestion.type === 'delete'
        ? 'delete'
        : suggestion.type === 'update'
          ? 'runPropertiesChange'
          : 'insert';

    const run = new Run(suggestion.text);
    const revision = new Revision({
      type: revisionType,
      author:
        suggestion.userName ||
        suggestion.userId ||
        options.defaultAuthor ||
        'Unknown',
      date: new Date(suggestion.createdAt),
      content: run,
    });

    manager.register(revision);
    revisionMap.set(suggestion.id, revision);
  });

  return revisionMap;
}

/**
 * Processes Plate comments into DOCX comments
 */
function processComments(
  comments: PlateExportComment[],
  manager: CommentManager
): Map<string, Comment> {
  const commentMap = new Map<string, Comment>();
  let commentId = 1;

  // Sort by creation time so IDs are sequential
  const sorted = [...comments].sort((a, b) => a.createdAt - b.createdAt);

  sorted.forEach((plateComment) => {
    const comment = new Comment({
      id: commentId++,
      author: plateComment.userName || plateComment.userId,
      initials:
        plateComment.userInitials ||
        plateComment.userId.slice(0, 2).toUpperCase(),
      date: new Date(plateComment.createdAt),
      text: plateComment.value,
    });

    manager.add(comment);
    commentMap.set(plateComment.id, comment);
  });

  return commentMap;
}

/**
 * Builds the document content with integrated revisions and comments
 */
function buildDocumentContent(
  doc: Document,
  data: PlateExportData,
  revisionMap: Map<string, Revision>,
  commentMap: Map<string, Comment>,
  _revisionManager: RevisionManager,
  _commentManager: CommentManager
): number {
  let paragraphCount = 0;

  // In a real implementation, this would parse the HTML and create paragraphs
  // with properly placed revisions and comment markers.
  //
  // For this example, we create a simplified structure:

  // Title paragraph
  const titlePara = new Paragraph();
  titlePara.addContent(
    new Run(data.metadata.title, { bold: true, fontSize: 28 })
  );
  doc.addParagraph(titlePara);
  paragraphCount++;

  // Content with revisions
  if (revisionMap.size > 0) {
    const revPara = new Paragraph();
    revisionMap.forEach((revision) => {
      revPara.addRevision(revision);
    });
    doc.addParagraph(revPara);
    paragraphCount++;
  }

  // Content with comments
  if (commentMap.size > 0) {
    const commentPara = new Paragraph();
    commentMap.forEach((comment) => {
      const id = comment.getId();
      commentPara.addContent(
        new RangeMarker({ type: 'commentRangeStart', id })
      );
      commentPara.addContent(new Run('Commented text'));
      commentPara.addContent(new RangeMarker({ type: 'commentRangeEnd', id }));
      commentPara.addContent(new RangeMarker({ type: 'commentReference', id }));
    });
    doc.addParagraph(commentPara);
    paragraphCount++;
  }

  return paragraphCount;
}

/**
 * Example: Complete review workflow with sample data
 */
export function runSampleReviewWorkflow(): ExportWorkflowResult {
  const sampleData: PlateExportData = {
    html: '<p>The quick <span data-suggestion-insert>brown </span>fox.</p>',
    suggestions: [
      {
        id: 'sugg-1',
        type: 'insert',
        text: 'brown ',
        userId: 'user1',
        userName: 'Alice',
        createdAt: Date.now() - 7_200_000,
      },
      {
        id: 'sugg-2',
        type: 'delete',
        text: 'lazy ',
        userId: 'user2',
        userName: 'Bob',
        createdAt: Date.now() - 3_600_000,
      },
      {
        id: 'sugg-3',
        type: 'insert',
        text: 'energetic ',
        userId: 'user2',
        userName: 'Bob',
        createdAt: Date.now() - 1_800_000,
      },
    ],
    comments: [
      {
        id: 'com-1',
        value: 'Should we keep this adjective?',
        userId: 'user1',
        userName: 'Alice',
        userInitials: 'AJ',
        createdAt: Date.now() - 5_400_000,
      },
      {
        id: 'com-2',
        value: 'I prefer "energetic" over "lazy".',
        userId: 'user2',
        userName: 'Bob',
        userInitials: 'BW',
        createdAt: Date.now() - 2_700_000,
        parentId: 'com-1',
      },
    ],
    metadata: {
      title: 'Sample Review Document',
      author: 'Document System',
      lastModified: new Date(),
    },
  };

  return executeReviewWorkflow(sampleData);
}

/**
 * Generates a human-readable review summary
 */
export function generateReviewSummary(result: ExportWorkflowResult): string {
  const lines: string[] = [
    '=== Track Changes Review Summary ===',
    '',
    `Paragraphs: ${result.stats.paragraphCount}`,
    `Total Revisions: ${result.stats.revisionCount}`,
    `  Insertions: ${result.stats.insertions}`,
    `  Deletions: ${result.stats.deletions}`,
    `  Property Changes: ${result.stats.propertyChanges}`,
    `Comments: ${result.stats.commentCount}`,
    `Authors: ${result.stats.authors.join(', ')}`,
    '',
    `Validation: ${result.validation.revisionsValid ? 'PASSED' : 'FAILED'}`,
  ];

  if (result.validation.issues.length > 0) {
    lines.push('Issues:');
    result.validation.issues.forEach((issue) => {
      lines.push(`  - ${issue}`);
    });
  }

  return lines.join('\n');
}

/**
 * Firefox DevTools Verification Steps (T095h-T095m)
 *
 * These steps document what would be verified using Firefox DevTools
 * when testing the DOCX export in a browser environment:
 *
 * T095h - Comment Export Verification:
 *   1. Open the exported DOCX in the browser viewer
 *   2. Check Console for: No errors during comment XML generation
 *   3. Network tab: Verify comments.xml is properly included in the ZIP
 *   4. Elements: Comment markers (commentRangeStart/End) present in document.xml
 *
 * T095i - Suggestion Insert Verification:
 *   1. Network tab: Verify document.xml contains <w:ins> elements
 *   2. Console: Log revision IDs to verify sequential assignment
 *   3. Elements: Verify w:ins has correct w:author and w:date attributes
 *
 * T095j - Suggestion Delete Verification:
 *   1. Network tab: Verify document.xml contains <w:del> elements
 *   2. Console: Verify <w:delText> is used instead of <w:t>
 *   3. Elements: Verify w:del has correct w:author and w:date attributes
 *
 * T095k - Mixed Suggestion Verification:
 *   1. Network tab: Verify both <w:ins> and <w:del> in document.xml
 *   2. Console: Log that replacement pairs have sequential IDs
 *   3. Elements: Verify deletions precede insertions in replacements
 *
 * T095l - Diff Export Verification:
 *   1. Network tab: Verify diff-generated revisions in document.xml
 *   2. Console: Log diff statistics (insertions, deletions, unchanged)
 *   3. Elements: Verify diff author is "Diff Engine" or configured value
 *
 * T095m - Full Review Workflow Verification:
 *   1. Open exported DOCX in Word/LibreOffice
 *   2. Verify Review > Track Changes shows all changes
 *   3. Verify Review > Comments shows all comments
 *   4. Accept/reject individual changes to verify proper structure
 *   5. Verify revision IDs are unique and sequential
 *   6. Verify move pairs are properly linked (if any)
 *   7. Console: Run validation and confirm no issues
 */
