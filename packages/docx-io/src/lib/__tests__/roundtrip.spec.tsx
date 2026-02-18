/** biome-ignore-all lint/suspicious/noEvolvingTypes: test file */
/** biome-ignore-all lint/suspicious/noImplicitAnyLet: test file */
/** biome-ignore-all lint/suspicious/noAssignInExpressions: test file */
/** biome-ignore-all lint/suspicious/useIterableCallbackReturn: test file */

import fs from 'node:fs';
import path from 'node:path';

import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
  BaseHorizontalRulePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from '@platejs/basic-nodes';
import { BaseTextAlignPlugin } from '@platejs/basic-styles';
import { BaseCommentPlugin, getCommentKey } from '@platejs/comment';
import { cleanDocx } from '@platejs/docx';
import { BaseLinkPlugin } from '@platejs/link';
import { BaseListPlugin } from '@platejs/list';
import { BaseSuggestionPlugin } from '@platejs/suggestion';
import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';
import JSZip from 'jszip';
import type { TNode, Value } from 'platejs';
import {
  BaseParagraphPlugin,
  createSlateEditor,
  KEYS,
  NodeApi,
  TextApi,
} from 'platejs';
import { serializeHtml } from 'platejs/static';
import { DocxExportPlugin } from '../docx-export-plugin';
import { exportToDocx, htmlToDocxBlob } from '../docx-export-plugin';
import type { DocxExportDiscussion } from '../exportTrackChanges';
import {
  applyTrackedCommentsLocal,
  parseDocxTracking,
} from '../importComments';
import { mammoth, preprocessMammothHtml } from '../importDocx';
import { searchRange } from '../searchRange';

/** Minimal editor kit for roundtrip tests (no registry dependency). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const editorPlugins: any[] = [
  BaseParagraphPlugin,
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseCodePlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseTablePlugin.configure({ render: { as: 'table' } }),
  BaseTableRowPlugin.configure({ render: { as: 'tr' } }),
  BaseTableCellPlugin.configure({ render: { as: 'td' } }),
  BaseTableCellHeaderPlugin.configure({ render: { as: 'th' } }),
  BaseLinkPlugin.configure({ render: { as: 'a' } }),
  BaseListPlugin,
  BaseTextAlignPlugin,
  BaseCommentPlugin,
  BaseSuggestionPlugin,
  DocxExportPlugin,
];

const createTestEditor = (value?: Value) =>
  createSlateEditor({
    plugins: editorPlugins,
    value,
  });

const readDocxFixture = (filename: string): Buffer => {
  const docxTestDir = path.resolve(
    __dirname,
    '../../../../docx/src/lib/__tests__'
  );
  const filepath = path.join(docxTestDir, `${filename}.docx`);

  return fs.readFileSync(filepath);
};

const readMammothFixture = (filename: string): Buffer => {
  // Mammoth test fixtures live in the mammoth npm package
  const docxTestDir = path.resolve(
    require.resolve('mammoth/package.json'),
    '../test/test-data'
  );
  const filepath = path.join(docxTestDir, `${filename}.docx`);

  return fs.readFileSync(filepath);
};

const importDocxBuffer = async (
  editor: ReturnType<typeof createTestEditor>,
  buffer: Buffer
): Promise<TNode[]> => {
  // Convert Node Buffer to ArrayBuffer for mammoth
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
  const mammothResult = await mammoth.convertToHtml(
    { arrayBuffer },
    { styleMap: ['comment-reference => sup'] }
  );

  const { html: preprocessedHtml } = preprocessMammothHtml(mammothResult.value);
  const cleanedHtml = cleanDocx(preprocessedHtml, '');

  const doc = new DOMParser().parseFromString(cleanedHtml, 'text/html');

  return editor.api.html.deserialize({ element: doc.body }) as TNode[];
};

const exportNodesToDocx = async (nodes: TNode[]): Promise<Buffer> => {
  // Create a static editor for serialization with registered components
  const staticEditor = createTestEditor(nodes as Value);

  // Serialize nodes to HTML using platejs/static
  const html = await serializeHtml(staticEditor);

  // Convert HTML to DOCX blob
  const blob = await htmlToDocxBlob(html);

  // Convert Blob to Buffer for reimport
  const arrayBuffer = await blob.arrayBuffer();

  return Buffer.from(arrayBuffer);
};

const loadZipFromBlob = async (blob: Blob): Promise<JSZip> => {
  const arrayBuffer = await blob.arrayBuffer();
  return JSZip.loadAsync(arrayBuffer);
};

const hasCommentMark = (nodes: TNode[]): boolean => {
  let found = false;

  const visit = (node: TNode) => {
    if (found) return;
    if (typeof node.text === 'string') {
      if (Object.keys(node).some((key) => key.startsWith('comment_'))) {
        found = true;
      }
      return;
    }

    if ('children' in node && Array.isArray(node.children)) {
      node.children.forEach((child) => visit(child as TNode));
    }
  };

  nodes.forEach((node) => visit(node));

  return found;
};

/**
 * Roundtrip test: import → export → reimport
 *
 * Verifies that export doesn't lose data that import can parse.
 * B === D means the roundtrip preserves data.
 *
 * Original .docx → import → Plate nodes (B) → export → new .docx → reimport → Plate nodes (D)
 *
 * Known limitations in roundtrip:
 * - inline_formatting: loses some marks due to HTML serialization/deserialization
 * - Line breaks (\n) may be converted to spaces
 */
describe('docx roundtrip', () => {
  // Fixtures that pass full roundtrip (B === D)
  // Note: 'links' has minor URL normalization (trailing slash) so tested separately
  const roundtripFixtures = ['headers', 'block_quotes', 'tables'];

  roundtripFixtures.forEach((name) => {
    it(`should preserve data for ${name}`, async () => {
      const editor = createTestEditor();

      // 1. Import original .docx
      const buffer = readDocxFixture(name);
      const nodesB = await importDocxBuffer(editor, buffer);

      // 2. Export to new .docx
      const exportedBuffer = await exportNodesToDocx(nodesB);

      // 3. Reimport the exported .docx
      const nodesD = await importDocxBuffer(editor, exportedBuffer);

      // 4. Compare - should be identical
      expect(nodesD).toEqual(nodesB);
    });
  });

  // Test links - passes but with minor URL normalization (trailing slash added)
  it('should preserve data for links (with URL normalization)', async () => {
    const editor = createTestEditor();

    const buffer = readDocxFixture('links');
    const nodesB = await importDocxBuffer(editor, buffer);
    const exportedBuffer = await exportNodesToDocx(nodesB);
    const nodesD = await importDocxBuffer(editor, exportedBuffer);

    // Normalize URLs for comparison (add trailing slash to domain-only URLs)
    const normalizeUrls = (nodes: TNode[]) =>
      JSON.parse(
        JSON.stringify(nodes).replaceAll(
          /"url":"(https?:\/\/[^"/]+)"/g,
          '"url":"$1/"'
        )
      );

    expect(normalizeUrls(nodesD)).toEqual(normalizeUrls(nodesB));
  });

  // Test that inline_formatting can be exported and reimported (with known data loss)
  it('should export and reimport inline_formatting (with known loss)', async () => {
    const editor = createTestEditor();

    // 1. Import original .docx
    const buffer = readDocxFixture('inline_formatting');
    const nodesB = await importDocxBuffer(editor, buffer);

    // 2. Export to new .docx
    const exportedBuffer = await exportNodesToDocx(nodesB);

    // 3. Reimport the exported .docx - should not throw
    const nodesD = await importDocxBuffer(editor, exportedBuffer);

    // 4. Verify we got some content back (not empty)
    expect(nodesD.length).toBeGreaterThan(0);
    // Note: nodesD won't equal nodesB due to mark/linebreak loss
  });

  it('should roundtrip comments without ref tokens and with non-empty ranges', async () => {
    const buffer = readMammothFixture('comments');
    const editor = createTestEditor();

    // Convert Node Buffer to ArrayBuffer for mammoth
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;
    const mammothResult = await mammoth.convertToHtml(
      { arrayBuffer },
      { styleMap: ['comment-reference => sup'] }
    );

    const { html: preprocessedHtml } = preprocessMammothHtml(
      mammothResult.value
    );

    expect(preprocessedHtml).not.toContain('DOCX_COMMENT_REF');
    expect(preprocessedHtml).not.toContain('comment-ref-');

    const cleanedHtml = cleanDocx(preprocessedHtml, '');
    const doc = new DOMParser().parseFromString(cleanedHtml, 'text/html');
    const nodes = editor.api.html.deserialize({ element: doc.body }) as TNode[];

    expect(JSON.stringify(nodes)).not.toContain('DOCX_COMMENT_REF');

    const tracking = parseDocxTracking(mammothResult.value);
    const commentEditor = createTestEditor(nodes as Value);
    let discussionIndex = 0;

    const commentsResult = applyTrackedCommentsLocal({
      editor: commentEditor as Parameters<
        typeof applyTrackedCommentsLocal
      >[0]['editor'],
      comments: tracking.comments.comments,
      searchRange: (_editor, search) =>
        searchRange(commentEditor as Parameters<typeof searchRange>[0], search),
      commentKey: KEYS.comment,
      getCommentKey,
      isText: TextApi.isText,
      generateId: () => `discussion-${(discussionIndex += 1)}`,
      documentDate: new Date(),
    });

    expect(commentsResult.discussions.length).toBeGreaterThan(0);
    expect(hasCommentMark(commentEditor.children as TNode[])).toBe(true);

    const docxDiscussions: DocxExportDiscussion[] =
      commentsResult.discussions.map((discussion) => ({
        id: discussion.id,
        comments: discussion.comments?.map((comment) => ({
          contentRich: comment.contentRich,
          createdAt: comment.createdAt,
          userId: comment.userId,
          user: comment.user,
        })),
        createdAt: discussion.createdAt,
        documentContent: discussion.documentContent,
        userId: discussion.userId,
        user: discussion.user,
      }));

    const exportBlob = await exportToDocx(commentEditor.children as Value, {
      editorPlugins,
      tracking: {
        discussions: docxDiscussions,
        nodeToString: (node: unknown) => {
          try {
            return NodeApi.string(node as Parameters<typeof NodeApi.string>[0]);
          } catch {
            return '';
          }
        },
      },
    });

    const zip = await loadZipFromBlob(exportBlob);
    const docXml = await zip.file('word/document.xml')!.async('string');

    expect(docXml).toContain('<w:commentRangeStart');
    expect(docXml).toContain('<w:commentRangeEnd');

    const startRegex = /<w:commentRangeStart[^>]*w:id="(\d+)"/g;
    let match;

    while ((match = startRegex.exec(docXml)) !== null) {
      const id = match[1];
      const remaining = docXml.slice(match.index);
      const endMatch = new RegExp(`<w:commentRangeEnd[^>]*w:id="${id}"`).exec(
        remaining
      );

      expect(endMatch).not.toBeNull();
      if (!endMatch) continue;

      const endIndex = match.index + endMatch.index;
      const between = docXml.slice(match.index, endIndex);
      expect(between).toMatch(/<w:t\b|<w:delText\b|<w:ins\b|<w:del\b/);
    }
  });

  it('should contain all 5 comment XML files in exported DOCX ZIP', async () => {
    // Create editor value with a comment mark
    const discussionId = 'disc-1';
    const value: Value = [
      {
        type: 'p',
        children: [
          {
            text: 'Hello commented world',
            [`comment_${discussionId}`]: true,
          },
        ],
      },
    ];

    // Discussion with 1 parent comment + 1 reply
    const docxDiscussions: DocxExportDiscussion[] = [
      {
        id: discussionId,
        comments: [
          {
            contentRich: [
              { type: 'p', children: [{ text: 'Parent comment' }] },
            ],
            createdAt: new Date('2025-01-01T00:00:00Z'),
            userId: 'user-1',
            user: { id: 'user-1', name: 'Alice' },
          },
          {
            contentRich: [{ type: 'p', children: [{ text: 'Reply comment' }] }],
            createdAt: new Date('2025-01-01T01:00:00Z'),
            userId: 'user-2',
            user: { id: 'user-2', name: 'Bob' },
          },
        ],
        createdAt: new Date('2025-01-01T00:00:00Z'),
        documentContent: 'Hello commented world',
        userId: 'user-1',
        user: { id: 'user-1', name: 'Alice' },
      },
    ];

    const exportBlob = await exportToDocx(value, {
      editorPlugins,
      tracking: {
        discussions: docxDiscussions,
        nodeToString: (node: unknown) => {
          try {
            return NodeApi.string(node as Parameters<typeof NodeApi.string>[0]);
          } catch {
            return '';
          }
        },
      },
    });

    const zip = await loadZipFromBlob(exportBlob);

    const expectedFiles = [
      'word/comments.xml',
      'word/commentsExtended.xml',
      'word/commentsIds.xml',
      'word/commentsExtensible.xml',
      'word/people.xml',
    ];

    for (const filePath of expectedFiles) {
      expect(
        zip.file(filePath),
        `Expected ZIP to contain ${filePath}`
      ).not.toBeNull();
    }
  });

  it('should produce people.xml with unique authors only', async () => {
    // Build a minimal editor value with a comment mark on "Hello"
    const value: Value = [
      {
        type: 'p',
        children: [{ text: 'Hello', comment_disc1: true }, { text: ' world' }],
      },
    ];

    // Discussion: parent by Alice, reply by Bob
    const docxDiscussions: DocxExportDiscussion[] = [
      {
        id: 'disc1',
        userId: 'alice-id',
        user: { id: 'alice-id', name: 'Alice' },
        createdAt: new Date('2026-01-01T00:00:00Z'),
        documentContent: 'Hello',
        comments: [
          {
            userId: 'alice-id',
            user: { id: 'alice-id', name: 'Alice' },
            createdAt: new Date('2026-01-01T00:00:00Z'),
            contentRich: [
              { type: 'p', children: [{ text: 'Parent comment' }] },
            ],
          },
          {
            userId: 'bob-id',
            user: { id: 'bob-id', name: 'Bob' },
            createdAt: new Date('2026-01-01T00:01:00Z'),
            contentRich: [{ type: 'p', children: [{ text: 'Reply comment' }] }],
          },
        ],
      },
    ];

    const exportBlob = await exportToDocx(value, {
      editorPlugins,
      tracking: {
        discussions: docxDiscussions,
        nodeToString: (node: unknown) => {
          try {
            return NodeApi.string(node as Parameters<typeof NodeApi.string>[0]);
          } catch {
            return '';
          }
        },
      },
    });

    const zip = await loadZipFromBlob(exportBlob);
    const peopleFile = zip.file('word/people.xml');

    expect(peopleFile).not.toBeNull();

    const peopleXml = await peopleFile!.async('string');

    // Extract all <w15:person> elements with their w15:author attributes
    const personRegex = /<w15:person\b[^>]*w15:author="([^"]*)"/g;
    const authors: string[] = [];
    let personMatch;

    while ((personMatch = personRegex.exec(peopleXml)) !== null) {
      authors.push(personMatch[1]);
    }

    // Exactly 2 unique authors: Alice and Bob
    expect(authors).toHaveLength(2);
    expect(authors).toContain('Alice');
    expect(authors).toContain('Bob');

    // Verify uniqueness -- no duplicates
    const uniqueAuthors = [...new Set(authors)];
    expect(uniqueAuthors).toHaveLength(authors.length);
  });

  it('should export commentsExtended.xml with correct paraIdParent linking for replies', async () => {
    // Create editor value with a comment mark on text
    const discussionId = 'disc-parent-reply';
    const value: Value = [
      {
        type: 'p',
        children: [
          {
            text: 'Hello world with comment',
            [`comment_${discussionId}`]: true,
          },
        ],
      },
    ];

    // Discussion with parent comment (comments[0]) and a reply (comments[1])
    const discussions: DocxExportDiscussion[] = [
      {
        id: discussionId,
        comments: [
          {
            contentRich: [
              { type: 'p', children: [{ text: 'Parent comment' }] },
            ],
            createdAt: new Date('2024-01-01T00:00:00Z'),
            user: { id: 'user1', name: 'Alice' },
            userId: 'user1',
          },
          {
            contentRich: [
              { type: 'p', children: [{ text: 'Reply to parent' }] },
            ],
            createdAt: new Date('2024-01-01T01:00:00Z'),
            user: { id: 'user2', name: 'Bob' },
            userId: 'user2',
          },
        ],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        documentContent: 'Hello world with comment',
        user: { id: 'user1', name: 'Alice' },
        userId: 'user1',
      },
    ];

    const exportBlob = await exportToDocx(value, {
      editorPlugins,
      tracking: {
        discussions,
        nodeToString: (node: unknown) => {
          try {
            return NodeApi.string(node as Parameters<typeof NodeApi.string>[0]);
          } catch {
            return '';
          }
        },
      },
    });

    const zip = await loadZipFromBlob(exportBlob);

    // commentsExtended.xml must exist
    const commentsExtFile = zip.file('word/commentsExtended.xml');
    expect(commentsExtFile).not.toBeNull();

    const commentsExtXml = await commentsExtFile!.async('string');

    // Parse all w15:commentEx elements (self-closing or with body)
    const commentExRegex = /<w15:commentEx[^/>]*\/?>/g;
    const commentExElements: string[] = [];
    let ceMatch;

    while ((ceMatch = commentExRegex.exec(commentsExtXml)) !== null) {
      commentExElements.push(ceMatch[0]);
    }

    // Should have at least 2 commentEx elements (parent + reply)
    expect(commentExElements.length).toBeGreaterThanOrEqual(2);

    // Helper: extract an attribute value from an XML element string
    const parseAttr = (el: string, attr: string): string | null => {
      const attrRegex = new RegExp(`${attr}="([^"]+)"`);
      const m = attrRegex.exec(el);
      return m ? m[1] : null;
    };

    // Find the parent commentEx (has w15:paraId but NO w15:paraIdParent)
    const parentElements = commentExElements.filter(
      (el) => parseAttr(el, 'w15:paraId') && !parseAttr(el, 'w15:paraIdParent')
    );
    expect(parentElements.length).toBeGreaterThanOrEqual(1);

    const parentParaId = parseAttr(parentElements[0], 'w15:paraId');
    expect(parentParaId).toBeTruthy();

    // Find the reply commentEx (has w15:paraIdParent matching parent's w15:paraId)
    const replyElements = commentExElements.filter(
      (el) => parseAttr(el, 'w15:paraIdParent') === parentParaId
    );
    expect(replyElements.length).toBeGreaterThanOrEqual(1);

    // Reply must also have its own paraId
    const replyParaId = parseAttr(replyElements[0], 'w15:paraId');
    expect(replyParaId).toBeTruthy();

    // Parent and reply paraIds must be different
    expect(replyParaId).not.toBe(parentParaId);
  });

  it('should round-trip comment date through export', async () => {
    const inputDate = '2025-01-15T10:30:00Z';
    const discussionId = 'date-roundtrip-disc';

    const value: Value = [
      {
        type: 'p',
        children: [
          { text: 'Before ' },
          { text: 'dated comment', [`comment_${discussionId}`]: true },
          { text: ' after.' },
        ],
      },
    ];

    const discussions: DocxExportDiscussion[] = [
      {
        id: discussionId,
        comments: [
          {
            contentRich: [
              { type: 'p', children: [{ text: 'Comment with date' }] },
            ],
            createdAt: inputDate,
            user: { id: 'user-1', name: 'Test User' },
            userId: 'user-1',
          },
        ],
        createdAt: inputDate,
        documentContent: 'dated comment',
        user: { id: 'user-1', name: 'Test User' },
        userId: 'user-1',
      },
    ];

    const exportBlob = await exportToDocx(value, {
      editorPlugins,
      tracking: {
        discussions,
        nodeToString: (node: unknown) => {
          try {
            return NodeApi.string(node as Parameters<typeof NodeApi.string>[0]);
          } catch {
            return '';
          }
        },
      },
    });

    const zip = await loadZipFromBlob(exportBlob);
    const commentsFile = zip.file('word/comments.xml');
    expect(commentsFile).not.toBeNull();

    const commentsXml = await commentsFile!.async('string');

    // Extract all w:date attributes from w:comment elements
    const commentDateRegex = /<w:comment[^>]*w:date="([^"]*)"/g;
    const dates: string[] = [];
    let dateMatch;

    while ((dateMatch = commentDateRegex.exec(commentsXml)) !== null) {
      dates.push(dateMatch[1]);
    }

    expect(dates.length).toBeGreaterThan(0);

    // Verify the exported date represents the same instant as input (may differ in tz offset)
    const inputMs = new Date(inputDate).getTime();
    const matchesInstant = dates.some((d) => new Date(d).getTime() === inputMs);
    expect(matchesInstant).toBe(true);
  });
});
