import type {
  Editor,
  EditorDocumentValue,
  EditorUpdateTag,
  PluginPoint,
} from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
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
import { repairLoadedUniqueValues } from './unique-values';

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
  /**
   * A change from `after` to the admitted document, or `null` when `after` is
   * admitted. A repair that settles a decision the commit replays returns its
   * parts in order, each from the document the parts before it give.
   */
  commit: (
    input: Readonly<{
      after: EditorDocumentValue;
      before: EditorDocumentValue;
      change: DocumentChange;
      editor: Editor;
      indexOf: (root: string) => DocumentIndex;
      /**
       * Whether the commit replaced the document outside a collaboration
       * update, which loads it, so a load's repairs apply too.
       */
      loads: boolean;
    }>
  ) => DocumentChange | readonly DocumentAdmissionPart[] | null;
  load: (
    document: EditorDocumentValue,
    schema: CompiledEditorSchema
  ) => Readonly<{ change: DocumentChange; value: EditorDocumentValue }> | null;
  /**
   * A change from `value`, which every other repair admitted, that settles
   * what the document leaves ready to settle, or `null`.
   */
  settle?: (
    value: EditorDocumentValue,
    schema: CompiledEditorSchema,
    commit: DocumentSettleCommit | null
  ) => DocumentChange | null;
}>;

/**
 * One part of a commit's repair. A settling part settles a decision the commit
 * replays, so its undo takes back only what the decision settled.
 */
export type DocumentAdmissionPart = Readonly<{
  change: DocumentChange;
  settles: boolean;
}>;

export type DocumentSettleCommit = Readonly<{
  /** The stored document the commit started from. */
  before: EditorDocumentValue;
  /** The change from `before` to `value`. */
  change: DocumentChange;
  editor: Editor;
  indexOf: (root: string) => DocumentIndex;
}>;

/**
 * The tag of a commit whose settle stage changed the document.
 *
 * @internal
 */
export const DOCUMENT_SETTLED_TAG: EditorUpdateTag = 'document-settled';

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
export class EditorAdmissionError extends Error {
  override name = 'EditorAdmissionError';
}

const ADMISSION_WRITES = 8;

/** @internal */
export const admissionBound = (what: 'commit' | 'load') => {
  let writes = 0;

  return () => {
    writes += 1;
    if (writes > ADMISSION_WRITES) {
      throw new EditorAdmissionError(
        `The ${what}'s admission and repeat repair kept writing after ${ADMISSION_WRITES} writes.`
      );
    }
  };
};

type Repaired = Readonly<{
  change: DocumentChange;
  value: EditorDocumentValue;
}>;

/** @internal */
export const repairLoadedDocument = (
  admission: DocumentAdmission | null,
  document: EditorDocumentValue,
  schema: CompiledEditorSchema
) => {
  const writers: Array<(value: EditorDocumentValue) => Repaired | null> = [
    (value) => admission?.load(value, schema) ?? null,
    (value) => repairLoadedUniqueValues(value, schema),
    (value) => {
      const settled = admission?.settle?.(value, schema, null);

      return settled ? { change: settled, value: settled.apply(value) } : null;
    },
  ];
  const write = admissionBound('load');
  let repaired: Repaired | null = null;

  for (let at = 0, quiet = 0; quiet < writers.length; at += 1) {
    const value: EditorDocumentValue = repaired?.value ?? document;
    const next = getDefined(writers[at % writers.length])(value);

    quiet += 1;
    if (!next) continue;
    write();
    quiet = 1;
    const kept: Repaired = withoutRepairOrphans(schema, value, next);

    repaired = repaired
      ? { change: repaired.change.compose(kept.change), value: kept.value }
      : kept;
  }

  return repaired;
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
