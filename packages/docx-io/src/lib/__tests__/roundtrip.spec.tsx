/** @jsx jsx */
/** biome-ignore-all lint/suspicious/noEvolvingTypes: test file */
/** biome-ignore-all lint/suspicious/noImplicitAnyLet: test file */
/** biome-ignore-all lint/suspicious/noAssignInExpressions: test file */
/** biome-ignore-all lint/suspicious/useIterableCallbackReturn: test file */

import fs from 'node:fs';
import path from 'node:path';

import { getCommentKey } from '@platejs/comment';
import { cleanDocx } from '@platejs/docx';
import { jsx } from '@platejs/test-utils';
import JSZip from 'jszip';
import type { SlatePlugin, TNode, Value } from 'platejs';
import { createSlateEditor, KEYS, NodeApi, TextApi } from 'platejs';
import { serializeHtml } from 'platejs/static';
import { BaseEditorKit } from 'www/src/registry/components/editor/editor-base-kit';
import { DocxExportKit } from 'www/src/registry/components/editor/plugins/docx-export-kit';
import { exportToDocx, htmlToDocxBlob } from '../docx-export-plugin';
import type { DocxExportDiscussion } from '../exportTrackChanges';
import {
  applyTrackedCommentsLocal,
  parseDocxTracking,
} from '../importComments';
import { mammoth, preprocessMammothHtml } from '../importDocx';
import { searchRange } from '../searchRange';

jsx;

const editorPlugins = [...BaseEditorKit, ...DocxExportKit] as SlatePlugin[];

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
  const docxTestDir = path.resolve(__dirname, '../mammoth.js/test/test-data');
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
});
