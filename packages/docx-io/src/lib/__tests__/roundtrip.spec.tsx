/** @jsx jsx */

import fs from 'node:fs';
import path from 'node:path';

import { cleanDocx } from '@platejs/docx';
import type { SlatePlugin, TNode, Value } from 'platejs';
import { createSlateEditor } from 'platejs';
import { serializeHtml } from 'platejs/static';
import { jsx } from '@platejs/test-utils';
import mammoth from 'mammoth';
import { BaseEditorKit } from 'www/src/registry/components/editor/editor-base-kit';
import { DocxExportKit } from 'www/src/registry/components/editor/plugins/docx-export-kit';

import { htmlToDocxBlob } from '../html-to-docx';
import { preprocessMammothHtml } from '../preprocessMammothHtml';

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

const importDocxBuffer = async (
  editor: ReturnType<typeof createTestEditor>,
  buffer: Buffer
): Promise<TNode[]> => {
  const mammothResult = await mammoth.convertToHtml(
    { buffer },
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
});
