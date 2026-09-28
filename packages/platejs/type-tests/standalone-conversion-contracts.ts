import {
  createEditor,
  type ContentSlice,
  type EditorDocumentValue,
  type Value,
  type ValueOf,
} from 'platejs';
import { importDocx, type DocxImportOptions } from 'platejs/docx/import';
import { parseHtml, parseHtmlSlice, serializeHtml } from 'platejs/html';
import {
  parseHtml as parseServerHtml,
  parseHtmlSlice as parseServerHtmlSlice,
} from 'platejs/html/server';
import {
  MarkdownPlugin,
  parseMarkdown,
  serializeMarkdown,
} from 'platejs/markdown';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

const exact = <TCheck extends true>(): TCheck | undefined => undefined;

const plugins = [MarkdownPlugin] as const;
const editor = createEditor({ plugins });
type EditorDocument = EditorDocumentValue<ValueOf<typeof editor>>;

// Editor methods carry the editor's own value type.
const editorDocument = editor.api.markdown.parse('# Title');
const editorSlice = editor.api.markdown.parseSlice('Title');
const htmlEditorDocument = editor.api.html.parse('<p>Title</p>');

if (editorDocument.ok) {
  exact<Equal<typeof editorDocument.document, EditorDocument>>();
}
if (editorSlice.ok) {
  exact<
    Equal<typeof editorSlice.slice, ContentSlice<ValueOf<typeof editor>>>
  >();
}
if (htmlEditorDocument.ok) {
  exact<Equal<typeof htmlEditorDocument.document, EditorDocument>>();
}

// Standalone functions type documents and slices exactly as broad Value.
const html = parseHtml('<p>Title</p>', { plugins });
const htmlSlice = parseHtmlSlice('<p>Title</p>', { plugins });
const serverHtml = parseServerHtml('<p>Title</p>', { plugins });
const serverHtmlSlice = parseServerHtmlSlice('<p>Title</p>', { plugins });
const markdown = parseMarkdown('# Title', { plugins });

if (html.ok) exact<Equal<typeof html.document, EditorDocumentValue<Value>>>();
if (serverHtml.ok) {
  exact<Equal<typeof serverHtml.document, EditorDocumentValue<Value>>>();
}
if (markdown.ok) {
  exact<Equal<typeof markdown.document, EditorDocumentValue<Value>>>();
}
if (htmlSlice.ok) exact<Equal<typeof htmlSlice.slice, ContentSlice<Value>>>();
if (serverHtmlSlice.ok) {
  exact<Equal<typeof serverHtmlSlice.slice, ContentSlice<Value>>>();
}
void serializeHtml(editor.read.value(), { plugins });
void serializeMarkdown(editor.read.value(), { plugins });

async function verifyDocxRetainedSource() {
  const retainedOptions: DocxImportOptions<true> = {
    plugins,
    retainSource: true,
  };
  // @ts-expect-error Retained-source options require `retainSource: true`.
  const omittedOptions: DocxImportOptions<true> = { plugins };
  const [retained, inferred, ordinary] = await Promise.all([
    importDocx(new Blob(), retainedOptions),
    importDocx(new Blob(), { plugins, retainSource: true }),
    importDocx(new Blob(), { plugins }),
  ]);

  if (retained.ok) {
    exact<Equal<typeof retained.document, EditorDocumentValue<Value>>>();
    retained.source.dispose();
  }
  if (inferred.ok) inferred.source.dispose();
  if (ordinary.ok) {
    // @ts-expect-error Default imports do not retain a DOCX source.
    ordinary.source.dispose();
  }
  void omittedOptions;
}

void verifyDocxRetainedSource;
