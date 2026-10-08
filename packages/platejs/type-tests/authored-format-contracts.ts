import {
  createEditor,
  DocumentChange,
  type EditorDocumentValue,
  type ValueOf,
} from 'platejs';
import {
  AuthoredPlugin,
  createAuthoredReviewDocument,
  parseAuthoredDocument,
  projectAuthoredDocument,
  projectAuthoredReview,
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
const snapshot = projectAuthoredReview(editor.read.value());
const projection = projectAuthoredDocument(editor.read.value(), {
  projection: 'proposed',
});
const json = {
  data: JSON.stringify(snapshot.review),
  diagnostics: snapshot.diagnostics,
};
const markdown = editor.api.markdown.serialize({
  projection: 'accepted',
});
const html = renderStaticHtml(editor, { projection: 'proposed' });
const docx = exportDocx(editor, { projection: 'review' });
const imported = createAuthoredReviewDocument({
  accepted: snapshot.accepted,
  revisions: [
    {
      authorId: 'alice',
      change: DocumentChange.between(snapshot.accepted, snapshot.proposed),
      createdAt: 1,
      id: 'change-1',
    },
  ],
});

void (json.data satisfies string);
void (projection.document satisfies typeof snapshot.proposed);
void (projection.unresolved.conflicted satisfies number);
void (json.diagnostics satisfies readonly AuthoredProjectionDiagnostic[]);
if (markdown.ok) void (markdown.data satisfies string);
void (html satisfies Promise<{ data: string }>);
void (docx satisfies Promise<DocxExportResult>);
void (parseAuthoredDocument(json.data) satisfies typeof imported);

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
createAuthoredReviewDocument({
  accepted: snapshot.accepted,
  revisions: [
    // @ts-expect-error Imported revisions require an author identity.
    {
      change: DocumentChange.between(snapshot.accepted, snapshot.proposed),
      createdAt: 1,
      id: 'change-1',
    },
  ],
});
