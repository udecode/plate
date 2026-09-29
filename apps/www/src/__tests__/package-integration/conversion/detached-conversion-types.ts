import {
  createEditor,
  serializePlainText,
  type EditorDocumentValue,
  type Value,
  type ValueOf,
} from 'platejs';
import { importDocx } from 'platejs/docx/import';
import { parseHtml, serializeHtml } from 'platejs/html';
import { parseHtml as parseServerHtml } from 'platejs/html/server';
import { parseMarkdown, serializeMarkdown } from 'platejs/markdown';

import { BaseEditorKit } from '@/registry/components/editor/plugins-static';
import type { Editor } from '@/registry/components/editor/plugins.generated';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

const exact = <TCheck extends true>(): TCheck | undefined => undefined;

// Standalone conversion must stay type-usable with a full application kit.
export async function verifyDetachedConversionWithKit() {
  const plugins = BaseEditorKit;
  const editor = createEditor({ plugins });
  const document = editor.read.value();
  const html = parseHtml('<p>Kit</p>', { plugins });
  const markdown = parseMarkdown('# Kit', { plugins });
  const docx = await importDocx(new Blob(), { plugins, retainSource: true });

  if (html.ok) editor.update((tx) => tx.value.replace(html.document));
  if (markdown.ok) editor.update((tx) => tx.value.replace(markdown.document));
  if (docx.ok) {
    editor.update((tx) => tx.value.replace(docx.document));
    docx.source?.dispose();
  }

  void editor.api.html.parseSlice('<p>Kit</p>');
  void parseServerHtml('<p>Kit</p>', { plugins });
  void serializeHtml(document, { plugins });
  void serializeMarkdown(document, { plugins });
  void serializePlainText(document, { plugins });
}

// A generated editor keeps its exact document; standalone results stay broad.
export function verifyExactEditorConversion(editor: Editor) {
  type ExactDocument = EditorDocumentValue<ValueOf<Editor>>;

  exact<Equal<ValueOf<Editor>, Value> extends true ? false : true>();

  const html = editor.api.html.parse('<p>Exact</p>');
  const markdown = editor.api.markdown.parse('# Exact');
  const standalone = parseMarkdown('# Exact', { plugins: BaseEditorKit });

  if (html.ok) exact<Equal<typeof html.document, ExactDocument>>();
  if (markdown.ok) exact<Equal<typeof markdown.document, ExactDocument>>();
  if (standalone.ok) {
    // @ts-expect-error A standalone document is not an exact editor document.
    const document: ExactDocument = standalone.document;

    void document;
  }
}
