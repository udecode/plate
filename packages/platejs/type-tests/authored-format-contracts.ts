import { createEditor, DocumentChange } from 'platejs';
import {
  authored,
  createAuthoredReviewDocument,
  deserializeAuthoredJson,
  readAuthoredFormatSnapshot,
  serializeAuthoredJson,
  type AuthoredFormatDiagnostic,
} from 'platejs/authored';
import { exportToDocx, type DocxExportResult } from 'platejs/docx/export';
import {
  DocxSource,
  importDocx,
  type DocxImportOptions,
} from 'platejs/docx/import';
import { MarkdownPlugin } from 'platejs/markdown';
import { renderAuthoredHtml } from 'platejs/static';

const editor = createEditor({
  plugins: [authored({ authorId: 'alice' }), MarkdownPlugin],
  initialValue: [{ children: [{ text: 'Document' }], type: 'paragraph' }],
});
const snapshot = readAuthoredFormatSnapshot(editor);
const json = serializeAuthoredJson(editor, { projection: 'review' });
const markdown = editor.api.markdown.serializeAuthored({
  projection: 'accepted',
});
const html = renderAuthoredHtml(editor, { projection: 'proposed' });
const docx = exportToDocx(editor, { projection: 'review' });
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
void (json.diagnostics satisfies readonly AuthoredFormatDiagnostic[]);
void (markdown.data satisfies string);
void (html satisfies Promise<{ data: string }>);
void (docx satisfies Promise<DocxExportResult>);
void (deserializeAuthoredJson(json.data) satisfies typeof imported);

async function verifyDocxSourceTypes() {
  const ordinary = await importDocx(editor, new Blob());

  if (ordinary.ok) {
    // @ts-expect-error Default imports do not retain a DOCX source.
    ordinary.source.dispose();
  }
  const retained = await importDocx(editor, new Blob(), {
    retainSource: true,
  });

  if (retained.ok) {
    void exportToDocx(editor, {
      projection: 'review',
      source: retained.source,
    });
    retained.source.dispose();
  }
  const disabled = await importDocx(editor, new Blob(), {
    retainSource: false,
  });

  if (disabled.ok) {
    // @ts-expect-error Literal false imports do not retain a DOCX source.
    disabled.source.dispose();
  }
  const dynamicOptions: DocxImportOptions = {
    retainSource: Math.random() > 0.5,
  };
  const dynamic = await importDocx(editor, new Blob(), dynamicOptions);

  if (dynamic.ok && 'source' in dynamic) dynamic.source.dispose();
  // @ts-expect-error DOCX sources are created only by retained imports.
  const constructedSource = new DocxSource();

  constructedSource.dispose();
}

void verifyDocxSourceTypes;

// @ts-expect-error Authored serialization requires an explicit valid projection.
editor.api.markdown.serializeAuthored({ projection: 'markup' });
// @ts-expect-error DOCX review export requires an explicit valid projection.
void exportToDocx(editor, { projection: 'markup' });
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
