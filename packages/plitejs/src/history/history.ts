import {
  DocumentChange,
  type Editor,
  type EditorEffect,
  type EditorSchemaIdentity,
  RangeApi,
  type Selection,
  SelectionApi,
  type Value,
} from '..';
import {
  type encodeEditorEffect,
  type encodeEditorSelection,
  isObject,
  MAIN_ROOT_KEY,
} from '../internal';
import {
  decodeHistoryValue,
  encodeHistoryValue,
  isHistorySchemaIdentity,
} from './history-codec';
import { getHistory } from './history-state';

export interface Batch<_V extends Value = Value> {
  /** Canonical change to apply when this batch is consumed. */
  readonly change: DocumentChange;
  /** Effects to emit when this batch is consumed. */
  readonly effects: readonly EditorEffect[];
  /** Selection after the original batch was applied. */
  readonly selectionAfter: Selection;
  /** Additional named root owning `selectionAfter`; omit for the primary root. */
  readonly selectionAfterRoot?: string;
  /** Selection before the original batch was applied. */
  readonly selectionBefore: Selection;
  /** Additional named root owning `selectionBefore`; omit for the primary root. */
  readonly selectionBeforeRoot?: string;
}

/** Undo and redo stacks of inverse document changes. */
export interface History<V extends Value = Value> {
  /** Monotonic revision of the published history value. */
  readonly revision: number;
  readonly redos: ReadonlyArray<Batch<V>>;
  /** Schema identity that owns every persisted change in this history. */
  readonly schema: EditorSchemaIdentity;
  readonly undos: ReadonlyArray<Batch<V>>;
}

export type HistoryJSON = Readonly<{
  redos: readonly HistoryBatchJSON[];
  schema: EditorSchemaIdentity;
  undos: readonly HistoryBatchJSON[];
  version: 4;
}>;

export type HistoryBatchJSON = Readonly<{
  change: ReturnType<DocumentChange['toJSON']>;
  effects: ReadonlyArray<ReturnType<typeof encodeEditorEffect>>;
  selectionAfter: ReturnType<typeof encodeEditorSelection>;
  /** Additional named root; omitted for the primary root. */
  selectionAfterRoot?: string;
  selectionBefore: ReturnType<typeof encodeEditorSelection>;
  /** Additional named root; omitted for the primary root. */
  selectionBeforeRoot?: string;
}>;

const hasFunctions = (
  value: Record<PropertyKey, unknown>,
  keys: readonly PropertyKey[]
) => keys.every((key) => typeof value[key] === 'function');

const isSelection = (value: unknown): value is Selection =>
  value === null ||
  (SelectionApi.isSelection(value) &&
    (SelectionApi.isNode(value)
      ? value.root !== MAIN_ROOT_KEY
      : RangeApi.isRange(value) &&
        value.anchor.root !== MAIN_ROOT_KEY &&
        value.focus.root !== MAIN_ROOT_KEY));

const isAdditionalRoot = (value: unknown) =>
  value === undefined ||
  (typeof value === 'string' && value.length > 0 && value !== MAIN_ROOT_KEY);

const isEffect = (value: unknown): value is EditorEffect =>
  isObject(value) &&
  Object.hasOwn(value, 'value') &&
  isObject(value.type) &&
  typeof value.type.key === 'string' &&
  hasFunctions(value.type, ['invert', 'map']);

const isBatch = (value: unknown): value is Batch =>
  isObject(value) &&
  DocumentChange.isDocumentChange(value.change) &&
  Array.isArray(value.effects) &&
  value.effects.every(isEffect) &&
  isSelection(value.selectionAfter) &&
  isSelection(value.selectionBefore) &&
  isAdditionalRoot(value.selectionAfterRoot) &&
  isAdditionalRoot(value.selectionBeforeRoot);

export const History = {
  /** Check whether a value is an in-memory history object. */
  isHistory(value: unknown): value is History {
    return (
      isObject(value) &&
      Number.isSafeInteger(value.revision) &&
      (value.revision as number) >= 0 &&
      Array.isArray(value.redos) &&
      value.redos.every(isBatch) &&
      isHistorySchemaIdentity(value.schema) &&
      Array.isArray(value.undos) &&
      value.undos.every(isBatch)
    );
  },
  /** Decode and validate history against an editor without installing it. */
  fromJSON<V extends Value>(editor: Editor<V>, json: unknown): History<V> {
    return decodeHistoryValue(editor, json);
  },
  /** Encode the editor's current history as validated versioned JSON. */
  toJSON<V extends Value>(editor: Editor<V>): HistoryJSON {
    return encodeHistoryValue(editor, getHistory(editor));
  },
};
