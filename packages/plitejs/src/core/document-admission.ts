import type {
  Editor,
  EditorDocumentValue,
  PluginPoint,
} from '../interfaces/editor';
import { DocumentChange } from './change/document-change';
import type { DocumentIndex } from './change/document-index';
import { definePluginPoint } from './plugin-point';
import { getPluginContributions } from './plugin-registry';
import { getValueRecords, showValueRecords } from './record-store';

/**
 * A plugin's rule for the documents an editor loads and commits. A loaded
 * document passes it whole. A commit passes it after the recorder with the
 * change from the stored document, then after each repair with the change from
 * the document before that repair, until it repairs nothing, so the commit, its
 * inverse and every reader see the repaired document.
 *
 * @internal
 */
export type DocumentAdmission = Readonly<{
  /** A change from `after` to the admitted document, or `null` when `after` is admitted. */
  commit: (
    input: Readonly<{
      after: EditorDocumentValue;
      before: EditorDocumentValue;
      change: DocumentChange;
      editor: Editor;
      indexOf: (root: string) => DocumentIndex;
    }>
  ) => DocumentChange | null;
  load: (
    document: EditorDocumentValue
  ) => Readonly<{ change: DocumentChange; value: EditorDocumentValue }> | null;
}>;

declare const admitted: unique symbol;

/**
 * A document that passed its editor's admission, the only kind an editor
 * stores or a view shows.
 *
 * @internal
 */
export type AdmittedDocument = EditorDocumentValue & {
  readonly [admitted]: true;
};

/** @internal */
export const documentAdmissionPoint: PluginPoint<DocumentAdmission> =
  definePluginPoint('document.admission');

/** @internal */
export const onlyDocumentAdmission = (
  contributions: readonly DocumentAdmission[]
) => {
  if (contributions.length > 1) {
    throw new Error('An editor accepts one document admission.');
  }

  return contributions[0] ?? null;
};

/** @internal */
export const admitDocument = (
  admission: DocumentAdmission | null,
  document: EditorDocumentValue
): Readonly<{ change: DocumentChange; document: AdmittedDocument }> => {
  const repaired = admission?.load(document) ?? null;

  if (!repaired) {
    return {
      change: DocumentChange.empty,
      document: document as AdmittedDocument,
    };
  }

  // A repair can carry its records beside the value; a shown document holds
  // them as its `records` field.
  const { records: _records, ...rest } = repaired.value;

  return {
    change: repaired.change,
    document: showValueRecords(
      rest,
      getValueRecords(repaired.value)
    ) as unknown as AdmittedDocument,
  };
};

/** @internal */
export const admitEditorDocument = (
  editor: Editor,
  document: EditorDocumentValue
) =>
  admitDocument(
    onlyDocumentAdmission(
      getPluginContributions(editor, documentAdmissionPoint)
    ),
    document
  );
