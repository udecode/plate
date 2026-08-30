/** @jsx jsx */

import fs from 'node:fs';
import path from 'node:path';

import { jsx } from '@platejs/test';
import {
  BaseCodeHighlightPlugin,
  type Node as PliteNode,
  createEditor,
  type Value,
} from 'platejs';
import { htmlToDocxBlob, DocxImportPlugin } from 'platejs/docx';
import { renderStaticHtml } from 'platejs/static';

import { CodeSyntaxLeafDocx } from '@/registry/components/editor/code-block-static';
import { DocxExportKit } from '@/registry/components/editor/docx-export';
import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

jsx;

const createTestEditor = (value?: Value) =>
  createEditor({
    plugins: [...BaseEditorKit, DocxImportPlugin, ...DocxExportKit],
    initialValue: value,
  });

const readDocxFixture = (filename: string): Buffer => {
  const docxTestDir = path.resolve(import.meta.dirname, './docx');

  return fs.readFileSync(path.join(docxTestDir, `${filename}.docx`));
};

const importDocxBuffer = async (
  editor: ReturnType<typeof createTestEditor>,
  buffer: Buffer
): Promise<PliteNode[]> => {
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(arrayBuffer).set(buffer);

  const result = await editor.plugin(DocxImportPlugin).api.import(arrayBuffer);

  return result.nodes;
};

const exportNodesToDocx = async (nodes: PliteNode[]): Promise<Buffer> => {
  const html = await renderStaticHtml(createTestEditor(nodes as Value));
  const blob = await htmlToDocxBlob(html);

  return Buffer.from(await blob.arrayBuffer());
};

describe('docx roundtrip', () => {
  it('keeps existing plugin state when DOCX renderers override components', () => {
    const codeSyntax = createTestEditor().plugin(BaseCodeHighlightPlugin);

    expect(codeSyntax.initialState.lowlight?.registered('typescript')).toBe(
      true
    );
    expect(codeSyntax.render.node).toBe(CodeSyntaxLeafDocx);
  });

  it('pairs TOC links with export-local heading bookmarks without persisted ids', async () => {
    const html = await renderStaticHtml(
      createTestEditor([
        { children: [{ text: '' }], type: 'toc' },
        { children: [{ text: 'Introduction' }], level: 1, type: 'heading' },
      ])
    );
    const document = new DOMParser().parseFromString(html, 'text/html');
    const href = document.querySelector('a')?.getAttribute('href');

    expect(href).toMatch(/^#plate_/);
    expect(document.querySelector(href!)).not.toBeNull();
  });

  it.each(['headers', 'block_quotes', 'tables'])(
    'preserves data for %s',
    async (name) => {
      const editor = createTestEditor();
      const importedNodes = await importDocxBuffer(
        editor,
        readDocxFixture(name)
      );
      const roundtrippedNodes = await importDocxBuffer(
        editor,
        await exportNodesToDocx(importedNodes)
      );

      expect(roundtrippedNodes).toEqual(importedNodes);
    }
  );

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
