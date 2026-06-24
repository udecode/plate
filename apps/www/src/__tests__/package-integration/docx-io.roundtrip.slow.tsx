/** @jsx jsx */

import fs from 'node:fs';
import path from 'node:path';

import type { Node as PliteNode } from '@platejs/plite';

import { cleanDocx } from '@platejs/docx';
import { htmlToDocxBlob, preprocessMammothHtml } from '@platejs/docx-io';
import { jsx } from '@platejs/test-utils';
import mammoth from 'mammoth';
import type { EditorPlugin, Value } from 'platejs';
import { createBasePlateEditor } from 'platejs';
import { serializeHtml } from 'platejs/static';

import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';
import { DocxExportKit } from '@/registry/components/editor/plugins/docx-export-kit';

jsx;

const editorPlugins = [...BaseEditorKit, ...DocxExportKit] as EditorPlugin[];

const createTestEditor = (value?: Value) =>
  createBasePlateEditor({
    plugins: editorPlugins,
    value,
  });

const readDocxFixture = (filename: string): Buffer => {
  const docxTestDir = path.resolve(__dirname, './docx');

  return fs.readFileSync(path.join(docxTestDir, `${filename}.docx`));
};

const importDocxBuffer = async (
  editor: ReturnType<typeof createTestEditor>,
  buffer: Buffer
): Promise<PliteNode[]> => {
  const mammothResult = await mammoth.convertToHtml(
    { buffer },
    { styleMap: ['comment-reference => sup'] }
  );
  const { html: preprocessedHtml } = preprocessMammothHtml(mammothResult.value);
  const cleanedHtml = cleanDocx(preprocessedHtml, '');
  const doc = new DOMParser().parseFromString(cleanedHtml, 'text/html');

  return editor.api.html.deserialize({ element: doc.body }) as PliteNode[];
};

const exportNodesToDocx = async (nodes: PliteNode[]): Promise<Buffer> => {
  const html = await serializeHtml(createTestEditor(nodes as Value));
  const blob = await htmlToDocxBlob(html);

  return Buffer.from(await blob.arrayBuffer());
};

describe('docx roundtrip', () => {
  it.each([
    'headers',
    'block_quotes',
    'tables',
  ])('preserves data for %s', async (name) => {
    const editor = createTestEditor();
    const importedNodes = await importDocxBuffer(editor, readDocxFixture(name));
    const roundtrippedNodes = await importDocxBuffer(
      editor,
      await exportNodesToDocx(importedNodes)
    );

    expect(roundtrippedNodes).toEqual(importedNodes);
  });

  it('preserves data for links with URL normalization', async () => {
    const editor = createTestEditor();
    const importedNodes = await importDocxBuffer(
      editor,
      readDocxFixture('links')
    );
    const roundtrippedNodes = await importDocxBuffer(
      editor,
      await exportNodesToDocx(importedNodes)
    );

    const normalizeUrls = (nodes: PliteNode[]) =>
      JSON.parse(
        JSON.stringify(nodes).replaceAll(
          /"url":"(https?:\/\/[^"/]+)"/g,
          '"url":"$1/"'
        )
      );

    expect(normalizeUrls(roundtrippedNodes)).toEqual(
      normalizeUrls(importedNodes)
    );
  });

  it('reimports inline formatting after export without dropping all content', async () => {
    const editor = createTestEditor();
    const importedNodes = await importDocxBuffer(
      editor,
      readDocxFixture('inline_formatting')
    );
    const roundtrippedNodes = await importDocxBuffer(
      editor,
      await exportNodesToDocx(importedNodes)
    );

    expect(roundtrippedNodes.length).toBeGreaterThan(0);
  });
});
