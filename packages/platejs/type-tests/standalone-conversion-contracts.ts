import {
  createEditor,
  type ContentSlice,
  type EditorDocumentValue,
  type Value,
  type ValueOf,
} from 'platejs';
import {
  importDocx,
  type DocxImportOptions,
  type DocxSource,
} from 'platejs/docx/import';
import type { DataTransferDecodeContext } from 'platejs/dom';
import {
  decodeHtmlDataTransfer,
  parseHtml,
  // @ts-expect-error Slices parse through the installed `editor.api.html.parseSlice`.
  parseHtmlSlice,
  serializeHtml,
} from 'platejs/html';
import {
  parseHtml as parseServerHtml,
  // @ts-expect-error The server entry parses documents only.
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
const serverHtml = parseServerHtml('<p>Title</p>', { plugins });
const markdown = parseMarkdown('# Title', { plugins });

if (html.ok) exact<Equal<typeof html.document, EditorDocumentValue<Value>>>();
if (serverHtml.ok) {
  exact<Equal<typeof serverHtml.document, EditorDocumentValue<Value>>>();
}
if (markdown.ok) {
  exact<Equal<typeof markdown.document, EditorDocumentValue<Value>>>();
}
void parseHtmlSlice;
void parseServerHtmlSlice;
void decodeHtmlDataTransfer;

// A custom transfer format decodes prepared HTML as the HTML format does.
exact<
  Equal<Parameters<typeof decodeHtmlDataTransfer>[0], DataTransferDecodeContext>
>();
exact<Equal<ReturnType<typeof decodeHtmlDataTransfer>, ContentSlice | null>>();

// A partial slice parse continues the previous slice result.
const continued = editor.api.markdown.parseSlice('Title more', {
  partial: true,
  previous: editorSlice,
});

if (continued.ok) {
  exact<Equal<typeof continued.slice, ContentSlice<ValueOf<typeof editor>>>>();
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
    exact<Equal<typeof retained.source, DocxSource | null>>();
    // @ts-expect-error A package outside the passive vocabulary retains no source.
    retained.source.dispose();
    retained.source?.dispose();
  }
  if (inferred.ok) inferred.source?.dispose();
  if (ordinary.ok) {
    // @ts-expect-error Default imports do not retain a DOCX source.
    ordinary.source.dispose();
  }
  void omittedOptions;
}

void verifyDocxRetainedSource;
