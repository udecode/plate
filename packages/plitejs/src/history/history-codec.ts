import {
  DocumentChange,
  type Editor,
  type EditorDocumentValue,
  type EditorEffectType,
  type EditorSchemaIdentity,
  SelectionApi,
  type Value,
} from '..';
import { carriesRun, type CarriedRun } from '../core/change/carried-run';
import {
  documentChangeWritesOnlyElementProperties,
  getInternalDocumentRootChange,
  valueRootIndex,
} from '../core/change/document-change';
import { getPluginRegistry as getInternalPluginRegistry } from '../core/plugin-registry';
import { MAIN_ROOT_KEY } from '../core/public-root';
import {
  areEditorSchemaIdentitiesEqual,
  readEditorSchemaIdentity,
} from '../core/schema-compiler';
import {
  assertSelectionSupported,
  decodeEditorSelection,
  encodeEditorSelection,
} from '../core/selection-protocol';
import { decodeEditorEffect, encodeEditorEffect } from '../core/value-codec';
import type { AnyEditor } from '../interfaces/editor';
import { isObject } from '../utils/is-object';
import type { Batch, History, HistoryBatchJSON, HistoryJSON } from './history';
import { checkedCarryProgram, historyReplaySchemaOf } from './history-replay';
import {
  freezeHistoryBatch,
  historyFallbackOf,
  withHistoryFallback,
  withHistoryProgram,
} from './history-state';

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

const encodeBatch = (
  editor: AnyEditor,
  batch: Batch,
  fallback?: Batch | null
): HistoryBatchJSON => ({
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
  ...(batch.unsettle ? { unsettle: batch.unsettle.toJSON() } : {}),
  ...(batch.rest ? { rest: batch.rest.toJSON() } : {}),
  ...(batch.carried
    ? {
        carried: batch.carried.map(({ landed, ...run }) =>
          landed === run.length ? run : { ...run, landed }
        ),
      }
    : {}),
  ...(fallback ? { fallback: encodeBatch(editor, fallback) } : {}),
});

const isPosition = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

const decodeCarriedRuns = (value: unknown): readonly CarriedRun[] | null =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every(
    (run) =>
      isObject(run) &&
      Object.keys(run).length === (Object.hasOwn(run, 'landed') ? 5 : 4) &&
      isPosition(run.at) &&
      isPosition(run.length) &&
      run.length > 0 &&
      (!Object.hasOwn(run, 'landed') ||
        (isPosition(run.landed) &&
          run.landed > 0 &&
          run.landed !== run.length)) &&
      isPosition(run.source) &&
      typeof run.root === 'string' &&
      run.root.length > 0
  )
    ? value.map(({ at, landed, length, root, source }) => ({
        at,
        landed: landed ?? length,
        length,
        root,
        source,
      }))
    : null;

const isHistoryJSON = (value: unknown): value is HistoryJSON =>
  isObject(value) &&
  (value.version === 4 || value.version === 5 || value.version === 6) &&
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
    `History schema mismatch: history uses ${describeSchema(
      persisted
    )}, but the editor uses ${describeSchema(current)}.`
  );
};

const checkBatch = <V extends Value>(
  editor: Editor<V>,
  batch: Batch<V>,
  direction: 'redo' | 'undo',
  document: EditorDocumentValue,
  recordPrograms: boolean
) => {
  let value = document;
  const selectionAtBase =
    direction === 'undo' ? batch.selectionAfter : batch.selectionBefore;
  const selectionAtBaseRoot =
    direction === 'undo' ? batch.selectionAfterRoot : batch.selectionBeforeRoot;
  const selectionAfterChange =
    direction === 'undo' ? batch.selectionBefore : batch.selectionAfter;
  const selectionAfterChangeRoot =
    direction === 'undo' ? batch.selectionBeforeRoot : batch.selectionAfterRoot;

  editor.read.schema.assertDocument(value);
  assertSelectionSupported(
    editor,
    selectionAtBase,
    value,
    selectionAtBaseRoot ?? 'main'
  );
  if (batch.unsettle) {
    if (
      !batch.rest &&
      !documentChangeWritesOnlyElementProperties(batch.unsettle, value)
    ) {
      throw new Error(
        'A history step can take back only element properties its settle stage wrote.'
      );
    }
    editor.read.schema.assertDocument(batch.unsettle.apply(value));
  }
  const base = value;

  value = batch.change.apply(value);
  for (const run of batch.carried ?? []) {
    const change = getInternalDocumentRootChange(batch.change, run.root);

    if (
      !change ||
      !carriesRun(
        change,
        valueRootIndex(base, run.root),
        valueRootIndex(value, run.root),
        run
      )
    ) {
      throw new Error('A history step carries a run its change does not.');
    }
  }
  if (
    recordPrograms &&
    batch.carried?.length === 1 &&
    !batch.rest &&
    !batch.unsettle
  ) {
    withHistoryProgram(
      batch,
      checkedCarryProgram(
        historyReplaySchemaOf(editor),
        base,
        batch.change,
        batch.carried[0]
      )?.program
    );
  }
  editor.read.schema.assertDocument(value);
  assertSelectionSupported(
    editor,
    selectionAfterChange,
    value,
    selectionAfterChangeRoot ?? 'main'
  );

  return value;
};

const validateBatches = <V extends Value>(
  editor: Editor<V>,
  batches: ReadonlyArray<Batch<V>>,
  direction: 'redo' | 'undo',
  document: EditorDocumentValue,
  recordPrograms: boolean,
  fallbacks: Map<Batch<V>, Batch<V>>
) => {
  let value = document;

  for (const batch of batches.toReversed()) {
    const fallback = direction === 'redo' ? historyFallbackOf(batch) : null;

    if (fallback) {
      try {
        checkBatch(editor, fallback, direction, value, recordPrograms);
        fallbacks.set(batch, fallback);
      } catch (error) {
        if (recordPrograms) throw error;
      }
    }
    value = checkBatch(editor, batch, direction, value, recordPrograms);
  }
};

const validateHistory = <V extends Value>(
  editor: Editor<V>,
  history: Pick<History<V>, 'redos' | 'undos'>,
  validateAgainst: EditorDocumentValue | false = editor.read.value(),
  recordPrograms = false,
  fallbacks = new Map<Batch<V>, Batch<V>>()
) => {
  if (!validateAgainst) {
    for (const batch of history.redos) {
      const fallback = historyFallbackOf(batch);

      if (fallback) fallbacks.set(batch, fallback);
    }

    return fallbacks;
  }

  validateBatches(
    editor,
    history.redos,
    'redo',
    validateAgainst,
    recordPrograms,
    fallbacks
  );
  validateBatches(
    editor,
    history.undos,
    'undo',
    validateAgainst,
    recordPrograms,
    fallbacks
  );

  return fallbacks;
};

type HistoryValidationOptions = Readonly<{
  validateAgainst?: EditorDocumentValue | false;
}>;

const decodeBatch = <V extends Value>(
  editor: Editor<V>,
  input: unknown,
  effectTypes: ReadonlyMap<string, { type: EditorEffectType }>,
  direction: 'redo' | 'undo',
  version: 4 | 5 | 6,
  nested = false
): Batch<V> => {
  if (
    !isObject(input) ||
    (input.fallback !== undefined &&
      (version < 6 || direction !== 'redo' || nested)) ||
    (input.unsettle !== undefined && direction === 'redo') ||
    (input.rest !== undefined &&
      (version < 5 || input.unsettle === undefined)) ||
    (input.carried !== undefined && version < 5) ||
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

  const carried =
    input.carried === undefined ? undefined : decodeCarriedRuns(input.carried);

  if (carried === null) throw new Error('Invalid history batch JSON.');

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

  const hasPrimaryRoot = (selection: typeof selectionAfter): boolean =>
    !SelectionApi.isNode(selection) &&
    Boolean(
      selection &&
      (selection.anchor.root === MAIN_ROOT_KEY ||
        selection.focus.root === MAIN_ROOT_KEY)
    );

  if (hasPrimaryRoot(selectionAfter) || hasPrimaryRoot(selectionBefore)) {
    throw new Error('Invalid history batch JSON.');
  }

  const batch: Batch<V> = {
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
    ...(input.unsettle === undefined
      ? {}
      : {
          unsettle: DocumentChange.fromJSON(
            input.unsettle as ReturnType<DocumentChange['toJSON']>
          ),
        }),
    ...(input.rest === undefined
      ? {}
      : {
          rest: DocumentChange.fromJSON(
            input.rest as ReturnType<DocumentChange['toJSON']>
          ),
        }),
    ...(carried ? { carried } : {}),
  };

  return input.fallback === undefined
    ? batch
    : withHistoryFallback(
        batch,
        freezeHistoryBatch(
          decodeBatch(
            editor,
            input.fallback,
            effectTypes,
            direction,
            version,
            true
          )
        )
      );
};

export const decodeHistoryValue = <V extends Value>(
  editor: Editor<V>,
  json: unknown,
  options: HistoryValidationOptions = {}
): History<V> => {
  if (!isHistoryJSON(json)) {
    throw new Error(
      'Invalid history JSON or unsupported history version; expected version 4, 5 or 6.'
    );
  }

  const schema = copyHistorySchemaIdentity(json.schema);

  assertSchemaIdentity(editor, schema);

  const { effectTypes } = getInternalPluginRegistry(editor);
  const history = Object.freeze({
    redos: Object.freeze(
      json.redos.map((batch) =>
        freezeHistoryBatch(
          decodeBatch(editor, batch, effectTypes, 'redo', json.version)
        )
      )
    ),
    revision: 0,
    schema,
    undos: Object.freeze(
      json.undos.map((batch) =>
        freezeHistoryBatch(
          decodeBatch(editor, batch, effectTypes, 'undo', json.version)
        )
      )
    ),
  });

  const fallbacks = validateHistory(
    editor,
    history,
    options.validateAgainst,
    true
  );

  for (const batch of history.redos) {
    if (!fallbacks.has(batch)) withHistoryFallback(batch, null);
  }

  return history;
};

export const encodeHistoryValue = <V extends Value>(
  editor: Editor<V>,
  history: Pick<History<V>, 'redos' | 'schema' | 'undos'>,
  options: HistoryValidationOptions = {}
): HistoryJSON => {
  const schema = copyHistorySchemaIdentity(history.schema);

  assertSchemaIdentity(editor, schema);
  const fallbacks = validateHistory(editor, history, options.validateAgainst);

  const persistent = (batches: ReadonlyArray<Batch<V>>) =>
    batches.filter((batch) =>
      batch.effects.every((effect) => typeof effect.type.history !== 'object')
    );

  const redos = persistent(history.redos);
  const undos = persistent(history.undos);

  return {
    redos: redos.map((batch) =>
      encodeBatch(editor, batch, fallbacks.get(batch))
    ),
    schema,
    undos: undos.map((batch) => encodeBatch(editor, batch)),
    version: redos.some((batch) => fallbacks.has(batch))
      ? 6
      : [...redos, ...undos].some((batch) => batch.rest || batch.carried)
        ? 5
        : 4,
  };
};
