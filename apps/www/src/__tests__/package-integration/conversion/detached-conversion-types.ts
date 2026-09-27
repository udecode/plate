import { createEditor, serializePlainText } from 'platejs';
import { importDocx } from 'platejs/docx/import';
import { parseHtml, parseHtmlSlice, serializeHtml } from 'platejs/html';
import {
  parseHtml as parseServerHtml,
  parseHtmlSlice as parseServerHtmlSlice,
} from 'platejs/html/server';
import {
  parseMarkdown,
  parseMarkdownInline,
  parseMarkdownSlice,
  serializeMarkdown,
} from 'platejs/markdown';

import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

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
    docx.source.dispose();
  }

  void parseHtmlSlice('<p>Kit</p>', { plugins });
  void parseServerHtml('<p>Kit</p>', { plugins });
  void parseServerHtmlSlice('<p>Kit</p>', { plugins });
  void parseMarkdownSlice('Kit', { plugins });
  void parseMarkdownInline('Kit', { plugins });
  void serializeHtml(document, { plugins });
  void serializeMarkdown(document, { plugins });
  void serializePlainText(document, { plugins });
}
