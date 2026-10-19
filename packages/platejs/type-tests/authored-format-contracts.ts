import { createEditor, type EditorDocumentValue, type ValueOf } from 'platejs';
import {
  AuthoredPlugin,
  projectAuthoredDocument,
  type AuthoredProjectionDiagnostic,
} from 'platejs/authored';
import { exportDocx, type DocxExportResult } from 'platejs/docx/export';
import {
  DocxSource,
  importDocx,
  type DocxImportOptions,
} from 'platejs/docx/import';
import { MarkdownPlugin } from 'platejs/markdown';
import { renderStaticHtml } from 'platejs/static';

const plugins = [AuthoredPlugin, MarkdownPlugin] as const;
const editor = createEditor({
  plugins,
  initialValue: [{ children: [{ text: 'Document' }], type: 'paragraph' }],
  userId: 'alice',
});
const projection = projectAuthoredDocument(editor.read.value(), {
  projection: 'proposed',
});
const markdown = editor.api.markdown.serialize({
  projection: 'accepted',
});
const html = renderStaticHtml(editor, { projection: 'proposed' });
const docx = exportDocx(editor, { projection: 'review' });
void (projection.pending satisfies number);
void (projection.diagnostics satisfies readonly AuthoredProjectionDiagnostic[]);
if (markdown.ok) void (markdown.data satisfies string);
void (html satisfies Promise<{ data: string }>);
void (docx satisfies Promise<DocxExportResult>);

async function verifyDocxSourceTypes() {
  const ordinary = await importDocx(new Blob(), { plugins });

  if (ordinary.ok) {
    // Detached conversion types its document like an editor built from the same tuple.
    void (ordinary.document satisfies EditorDocumentValue<
      ValueOf<typeof editor>
    >);
    editor.update((tx) => tx.value.replace(ordinary.document));
    // @ts-expect-error Default imports do not retain a DOCX source.
    ordinary.source.dispose();
  }
  const retained = await importDocx(new Blob(), {
    plugins,
    retainSource: true,
  });

  if (retained.ok) {
    // A nullable retained source passes straight to export.
    void exportDocx(editor, {
      lossPolicy: 'allow',
      projection: 'review',
      source: retained.source,
    });
    retained.source?.dispose();
  }
  const disabled = await importDocx(new Blob(), {
    plugins,
    retainSource: false,
  });

  if (disabled.ok) {
    // @ts-expect-error Literal false imports do not retain a DOCX source.
    disabled.source.dispose();
  }
  const dynamicOptions: DocxImportOptions<boolean> = {
    plugins,
    retainSource: Math.random() > 0.5,
  };
  const dynamic = await importDocx(new Blob(), dynamicOptions);

  if (dynamic.ok && 'source' in dynamic) dynamic.source?.dispose();
  // @ts-expect-error DOCX sources are created only by retained imports.
  const constructedSource = new DocxSource();

  constructedSource.dispose();
}

void verifyDocxSourceTypes;

// @ts-expect-error Authored serialization requires an explicit valid projection.
editor.api.markdown.serialize({ projection: 'markup' });
// @ts-expect-error DOCX review export requires an explicit valid projection.
void exportDocx(editor, { projection: 'markup' });
// @ts-expect-error DOCX loss policy accepts only allow or reject.
void exportDocx(editor, { lossPolicy: 'warn', projection: 'proposed' });
// @ts-expect-error Authored projection requires an explicit valid projection.
projectAuthoredDocument(editor.read.value(), { projection: 'markup' });
