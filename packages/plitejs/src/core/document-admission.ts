import type {
  Editor,
  EditorDocumentValue,
  PluginPoint,
} from '../interfaces/editor';
import { DocumentChange } from './change/document-change';
import type { DocumentIndex } from './change/document-index';
import { definePluginPoint } from './plugin-point';
import {
  getCompiledEditorSchema,
  getPluginContributions,
} from './plugin-registry';
import {
  getValueRecords,
  showValueRecords,
  withoutValueRoots,
} from './record-store';
import { changedRootsOf, orphanedValueRoots } from './root-ownership';
import type { CompiledEditorSchema } from './schema-compiler';

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
    document: EditorDocumentValue,
    schema: CompiledEditorSchema
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
export const withoutRepairOrphans = <V extends EditorDocumentValue>(
  schema: CompiledEditorSchema,
  document: EditorDocumentValue,
  repaired: Readonly<{ change: DocumentChange; value: V }>
) => {
  const orphaned = new Set(
    orphanedValueRoots(
      schema,
      document,
      repaired.value,
      changedRootsOf(repaired.change)
    )
  );

  if (orphaned.size === 0) return repaired;

  const value = withoutValueRoots(repaired.value, orphaned);

  return {
    change: repaired.change.compose(
      DocumentChange.between(repaired.value, value)
    ),
    value,
  };
};

/** @internal */
export const repairLoadedDocument = (
  admission: DocumentAdmission | null,
  document: EditorDocumentValue,
  schema: CompiledEditorSchema
) => {
  const repaired = admission?.load(document, schema) ?? null;

  return repaired && withoutRepairOrphans(schema, document, repaired);
};

/** @internal */
export const admitDocument = (
  admission: DocumentAdmission | null,
  document: EditorDocumentValue,
  schema: CompiledEditorSchema
): Readonly<{ change: DocumentChange; document: AdmittedDocument }> => {
  const repaired = repairLoadedDocument(admission, document, schema);

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
    document,
    getCompiledEditorSchema(editor)
  );
