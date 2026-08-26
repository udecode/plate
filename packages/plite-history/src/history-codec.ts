import {
  DocumentChange,
  type Editor,
  type EditorEffectType,
  type EditorSchemaIdentity,
  SelectionApi,
  type Value,
} from '@platejs/plite';
import {
  type AnyEditor,
  areEditorSchemaIdentitiesEqual,
  assertSelectionSupported,
  decodeEditorEffect,
  decodeEditorSelection,
  encodeEditorEffect,
  encodeEditorSelection,
  getEditorExtensionRegistry,
  isObject,
  MAIN_ROOT_KEY,
  readEditorSchemaIdentity,
} from '@platejs/plite/internal';

import type { Batch, History, HistoryBatchJSON, HistoryJSON } from './history';
import { freezeHistoryBatch } from './history-state';

export const isHistorySchemaIdentity = (
  value: unknown
): value is EditorSchemaIdentity =>
  readEditorSchemaIdentity(value) !== undefined;

const copyHistorySchemaIdentity = (
  value: EditorSchemaIdentity
): EditorSchemaIdentity => {
  const identity = readEditorSchemaIdentity(value);

  if (!identity) throw new Error('Invalid history schema identity.');

  return identity;
};

const encodeBatch = (editor: AnyEditor, batch: Batch): HistoryBatchJSON => ({
  change: batch.change.toJSON(),
  effects: batch.effects.map(encodeEditorEffect),
  selectionAfter: encodeEditorSelection(editor, batch.selectionAfter, {
    validateDocument: false,
  }),
  ...(batch.selectionAfterRoot
    ? { selectionAfterRoot: batch.selectionAfterRoot }
    : {}),
  selectionBefore: encodeEditorSelection(editor, batch.selectionBefore, {
    validateDocument: false,
  }),
  ...(batch.selectionBeforeRoot
    ? { selectionBeforeRoot: batch.selectionBeforeRoot }
    : {}),
});

const isHistoryJSON = (value: unknown): value is HistoryJSON =>
  isObject(value) &&
  value.version === 4 &&
  isHistorySchemaIdentity(value.schema) &&
  Array.isArray(value.redos) &&
  Array.isArray(value.undos);

const describeSchema = (identity: EditorSchemaIdentity) =>
  identity.kind === 'derived'
    ? `derived schema (${identity.fingerprint})`
    : `schema "${identity.id}" version ${identity.version}`;

const assertSchemaIdentity = (
  editor: AnyEditor,
  persisted: EditorSchemaIdentity
) => {
  const current = editor.read.schema.identity();

  if (areEditorSchemaIdentitiesEqual(current, persisted)) return;

  if (
    current.kind === 'named' &&
    persisted.kind === 'named' &&
    current.id === persisted.id &&
    current.version === persisted.version
  ) {
    throw new Error(
      `History schema mismatch for "${current.id}" version ${current.version}: fingerprints differ because schema semantics changed without a version bump.`
    );
  }

  throw new Error(
    `History schema mismatch: history uses ${describeSchema(persisted)}, but the editor uses ${describeSchema(current)}.`
  );
};

const validateBatchSelections = <V extends Value>(
  editor: Editor<V>,
  batches: ReadonlyArray<Batch<V>>,
  direction: 'redo' | 'undo'
) => {
  let value = editor.read.value();

  for (const batch of batches.toReversed()) {
    const selectionAtBase =
      direction === 'undo' ? batch.selectionAfter : batch.selectionBefore;
    const selectionAtBaseRoot =
      direction === 'undo'
        ? batch.selectionAfterRoot
        : batch.selectionBeforeRoot;
    const selectionAfterChange =
      direction === 'undo' ? batch.selectionBefore : batch.selectionAfter;
    const selectionAfterChangeRoot =
      direction === 'undo'
        ? batch.selectionBeforeRoot
        : batch.selectionAfterRoot;

    editor.read.schema.assertDocument(value);
    assertSelectionSupported(
      editor,
      selectionAtBase,
      value,
      selectionAtBaseRoot ?? 'main'
    );
    value = batch.change.apply(value);
    editor.read.schema.assertDocument(value);
    assertSelectionSupported(
      editor,
      selectionAfterChange,
      value,
      selectionAfterChangeRoot ?? 'main'
    );
  }
};

const validateHistory = <V extends Value>(
  editor: Editor<V>,
  history: Pick<History<V>, 'redos' | 'undos'>
) => {
  validateBatchSelections(editor, history.redos, 'redo');
  validateBatchSelections(editor, history.undos, 'undo');
};

const decodeBatch = <V extends Value>(
  editor: Editor<V>,
  input: unknown,
  effectTypes: ReadonlyMap<string, { type: EditorEffectType }>
): Batch<V> => {
  if (
    !isObject(input) ||
    !Array.isArray(input.effects) ||
    !Object.hasOwn(input, 'change') ||
    !Object.hasOwn(input, 'selectionAfter') ||
    !Object.hasOwn(input, 'selectionBefore') ||
    (input.selectionAfterRoot !== undefined &&
      (typeof input.selectionAfterRoot !== 'string' ||
        input.selectionAfterRoot.length === 0 ||
        input.selectionAfterRoot === MAIN_ROOT_KEY)) ||
    (input.selectionBeforeRoot !== undefined &&
      (typeof input.selectionBeforeRoot !== 'string' ||
        input.selectionBeforeRoot.length === 0 ||
        input.selectionBeforeRoot === MAIN_ROOT_KEY))
  ) {
    throw new Error('Invalid history batch JSON.');
  }

  const effects = input.effects.map((effect) => {
    if (!isObject(effect) || typeof effect.key !== 'string') {
      throw new Error('Invalid history effect envelope.');
    }

    const registration = effectTypes.get(effect.key);

    if (!registration) {
      throw new Error(
        `Cannot decode history effect "${effect.key}" because its descriptor is not installed.`
      );
    }

    return decodeEditorEffect(registration.type, effect);
  });

  const selectionAfter = decodeEditorSelection(editor, input.selectionAfter, {
    validateDocument: false,
  });
  const selectionBefore = decodeEditorSelection(editor, input.selectionBefore, {
    validateDocument: false,
  });

  const hasPrimaryRoot = (
    selection: typeof selectionAfter
  ): boolean =>
    SelectionApi.isNode(selection)
      ? selection.root === MAIN_ROOT_KEY
      : Boolean(
          selection &&
            (selection.anchor.root === MAIN_ROOT_KEY ||
              selection.focus.root === MAIN_ROOT_KEY)
        );

  if (hasPrimaryRoot(selectionAfter) || hasPrimaryRoot(selectionBefore)) {
    throw new Error('Invalid history batch JSON.');
  }

  return {
    change: DocumentChange.fromJSON(
      input.change as ReturnType<DocumentChange['toJSON']>
    ),
    effects,
    selectionAfter,
    ...(input.selectionAfterRoot
      ? { selectionAfterRoot: input.selectionAfterRoot }
      : {}),
    selectionBefore,
    ...(input.selectionBeforeRoot
      ? { selectionBeforeRoot: input.selectionBeforeRoot }
      : {}),
  };
};

export const decodeHistoryValue = <V extends Value>(
  editor: Editor<V>,
  json: unknown,
  options: Readonly<{ validateDocument?: boolean }> = {}
): History<V> => {
  if (!isHistoryJSON(json)) {
    throw new Error(
      'Invalid history JSON or unsupported history version; expected version 4.'
    );
  }

  const schema = copyHistorySchemaIdentity(json.schema);

  assertSchemaIdentity(editor, schema);

  const { effectTypes } = getEditorExtensionRegistry(editor);
  const history = Object.freeze({
    redos: Object.freeze(
      json.redos.map((batch) =>
        freezeHistoryBatch(decodeBatch(editor, batch, effectTypes))
      )
    ),
    revision: 0,
    schema,
    undos: Object.freeze(
      json.undos.map((batch) =>
        freezeHistoryBatch(decodeBatch(editor, batch, effectTypes))
      )
    ),
  });

  if (options.validateDocument ?? true) validateHistory(editor, history);

  return history;
};

export const encodeHistoryValue = <V extends Value>(
  editor: Editor<V>,
  history: Pick<History<V>, 'redos' | 'schema' | 'undos'>
): HistoryJSON => {
  const schema = copyHistorySchemaIdentity(history.schema);

  assertSchemaIdentity(editor, schema);
  validateHistory(editor, history);

  return {
    redos: history.redos.map((batch) => encodeBatch(editor, batch)),
    schema,
    undos: history.undos.map((batch) => encodeBatch(editor, batch)),
    version: 4,
  };
};
