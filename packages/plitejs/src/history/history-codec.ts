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
  attachV4Steps,
  bindV4DocumentChange,
  copyV4StepsMetadata,
  createInternalDocumentChange,
  documentChangeWritesOnlyElementProperties,
  getInternalDocumentChangeClassificationEntries,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRecords,
  getInternalDocumentRootChange,
  getV4RegisterSteps,
  getV4Steps,
  valueRootIndex,
  withoutRetainedRecordSets,
} from '../core/change/document-change';
import {
  type ChangeFacts,
  factsFromJSON,
  factsToJSON,
  NO_FACTS,
  UNKNOWN_FACTS,
} from '../core/change/record';
import { RootChange, type RootChangeJson } from '../core/change/root-change';
import { extractV4Between } from '../core/change/v4/extract';
import {
  getCompiledEditorSchema,
  getPluginRegistry as getInternalPluginRegistry,
} from '../core/plugin-registry';
import { MAIN_ROOT_KEY } from '../core/public-root';
import {
  getRecordEntries,
  getRecordText,
  getValueRecords,
  hasRecord,
  type RecordOps,
  type RecordStore,
} from '../core/record-store';
import {
  areEditorSchemaIdentitiesEqual,
  readEditorSchemaIdentity,
  schemaSetValuedResolver,
} from '../core/schema-compiler';
import {
  assertSelectionSupported,
  decodeEditorSelection,
  encodeEditorSelection,
} from '../core/selection-protocol';
import { decodeEditorEffect, encodeEditorEffect } from '../core/value-codec';
import type { AnyEditor } from '../interfaces/editor';
import type { SchemaRecordSet } from '../interfaces/schema';
import { isObject } from '../utils/is-object';
import type { Batch, History, HistoryBatchJSON, HistoryJSON } from './history';
import { withoutFrozenRedos } from './history-first-write';
import { checkedCarryProgram, historyReplaySchemaOf } from './history-replay';
import {
  freezeHistoryBatch,
  historyBatchStepId,
  historyFactsOf,
  historyFallbackOf,
  withHistoryFacts,
  withHistoryFallback,
  withHistoryProgram,
  withHistoryStepId,
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

const encodeRecord = (facts: ChangeFacts | undefined) => {
  const json = factsToJSON(facts ?? UNKNOWN_FACTS);

  if (json.kind === 'unknown') return { record: null };

  const roots = Object.entries(json.roots).filter(
    ([, root]) => Object.keys(root).length > 0
  );

  return roots.length > 0 ? { record: Object.fromEntries(roots) } : {};
};

const decodeRecord = (input: Readonly<Record<string, unknown>>) => {
  if (!Object.hasOwn(input, 'record')) return NO_FACTS;

  return input.record === null
    ? UNKNOWN_FACTS
    : factsFromJSON({ kind: 'recorded', roots: input.record });
};

const ensureV4ChangeJson = (
  editor: AnyEditor,
  change: DocumentChange,
  base?: EditorDocumentValue
) => {
  if (!change.empty && getV4Steps(change) === null && base !== undefined) {
    const compiled = getCompiledEditorSchema(editor);
    const isSetValued = compiled
      ? schemaSetValuedResolver(compiled)
      : undefined;
    const explicitRegisters = getV4RegisterSteps(change);
    const extracted = extractV4Between(base, change.apply(base), {
      isSetValued,
    });

    attachV4Steps(
      change,
      explicitRegisters.length > 0
        ? [
            ...extracted.filter((step) => step.op !== 'set_register'),
            ...explicitRegisters,
          ]
        : extracted
    );
  }

  return change.toJSON();
};

const encodeBatch = (
  editor: AnyEditor,
  batch: Batch,
  fallback?: Batch | null,
  base?: EditorDocumentValue
): HistoryBatchJSON => {
  const restBase = base && batch.unsettle ? batch.unsettle.apply(base) : base;

  return {
    change: ensureV4ChangeJson(editor, batch.change, base),
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
    ...(batch.unsettle
      ? { unsettle: ensureV4ChangeJson(editor, batch.unsettle, base) }
      : {}),
    ...(batch.rest
      ? { rest: ensureV4ChangeJson(editor, batch.rest, restBase) }
      : {}),
    ...(batch.carried
      ? {
          carried: batch.carried.map(({ landed, ...run }) =>
            landed === run.length ? run : { ...run, landed }
          ),
        }
      : {}),
    ...encodeRecord(historyFactsOf(batch)),
    ...(fallback
      ? { fallback: encodeBatch(editor, fallback, undefined, base) }
      : {}),
  };
};

const encodeStep = (
  editor: AnyEditor,
  batch: Batch,
  fallback?: Batch | null,
  base?: EditorDocumentValue
): HistoryBatchJSON => ({
  ...encodeBatch(editor, batch, fallback, base),
  id: historyBatchStepId(batch),
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
  value.version === 8 &&
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

const alignRootChangeToCarriedRuns = (
  change: RootChange,
  baseRoot: ReturnType<typeof valueRootIndex>,
  afterRoot: ReturnType<typeof valueRootIndex>,
  runs: readonly CarriedRun[]
): RootChange | null => {
  type KeptPiece = {
    a0: number;
    a1: number;
    b0: number;
    b1: number;
    properties?: RootChangeJson[number]['properties'];
  };
  const kept: KeptPiece[] = [];
  let cursorA = 0;
  let cursorB = 0;

  for (const section of change.toJSON()) {
    if (section.replacement !== undefined) {
      cursorA += section.length;
      for (const token of section.replacement) {
        cursorB += token.kind === 'text' ? token.text.length : 1;
      }
    } else if (section.properties !== undefined) {
      kept.push({
        a0: cursorA,
        a1: cursorA + section.length,
        b0: cursorB,
        b1: cursorB + section.length,
        properties: section.properties,
      });
      cursorA += section.length;
      cursorB += section.length;
    } else {
      if (section.length > 0) {
        kept.push({
          a0: cursorA,
          a1: cursorA + section.length,
          b0: cursorB,
          b1: cursorB + section.length,
        });
      }
      cursorA += section.length;
      cursorB += section.length;
    }
  }

  let pieces = kept;

  for (const run of runs) {
    const nextPieces: typeof pieces = [];

    for (const seg of pieces) {
      const srcFrom = Math.max(seg.a0, run.source);
      const srcTo = Math.min(seg.a1, run.source + run.length);
      const dstFrom = Math.max(seg.b0, run.at);
      const dstTo = Math.min(seg.b1, run.at + run.landed);
      const cuts: Array<readonly [number, number]> = [];

      if (srcTo > srcFrom) {
        if (
          baseRoot
            .slice(srcFrom, srcTo)
            .tokens.some((token) => token.kind === 'text')
        ) {
          return null;
        }
        cuts.push([srcFrom - seg.a0, srcTo - seg.a0]);
      }
      if (dstTo > dstFrom) {
        if (
          afterRoot
            .slice(dstFrom, dstTo)
            .tokens.some((token) => token.kind === 'text')
        ) {
          return null;
        }
        cuts.push([dstFrom - seg.b0, dstTo - seg.b0]);
      }
      if (cuts.length === 0) {
        nextPieces.push(seg);
        continue;
      }
      if (seg.properties !== undefined) {
        continue;
      }

      cuts.sort((x, y) => x[0] - y[0]);
      let off = 0;
      const len = seg.a1 - seg.a0;

      for (const [cutStart, cutEnd] of cuts) {
        if (cutStart > off) {
          nextPieces.push({
            a0: seg.a0 + off,
            a1: seg.a0 + cutStart,
            b0: seg.b0 + off,
            b1: seg.b0 + cutStart,
          });
        }
        if (cutEnd > off) off = cutEnd;
      }
      if (len > off) {
        nextPieces.push({
          a0: seg.a0 + off,
          a1: seg.a1,
          b0: seg.b0 + off,
          b1: seg.b1,
        });
      }
    }
    pieces = nextPieces;
  }

  const sections: Array<RootChangeJson[number]> = [];
  let posA = 0;
  let posB = 0;

  for (const seg of pieces) {
    if (seg.a0 > posA || seg.b0 > posB) {
      sections.push({
        length: seg.a0 - posA,
        replacement: afterRoot.slice(posB, seg.b0).tokens,
      });
    }
    if (seg.properties !== undefined) {
      sections.push({
        length: seg.a1 - seg.a0,
        properties: seg.properties,
      });
    } else if (seg.a1 > seg.a0) {
      sections.push({ length: seg.a1 - seg.a0 });
    }
    posA = seg.a1;
    posB = seg.b1;
  }
  if (baseRoot.length > posA || afterRoot.length > posB) {
    sections.push({
      length: baseRoot.length - posA,
      replacement: afterRoot.slice(posB).tokens,
    });
  }

  return RootChange.fromJSON(sections);
};

const bindHistoryBatch = <V extends Value>(
  batch: Batch<V>,
  base: EditorDocumentValue
): Batch<V> => {
  const change = bindV4DocumentChange(batch.change, base);
  const unsettle = batch.unsettle
    ? bindV4DocumentChange(batch.unsettle, base)
    : undefined;
  const restBase = unsettle ? unsettle.apply(base) : base;
  const rest = batch.rest
    ? bindV4DocumentChange(batch.rest, restBase)
    : undefined;

  if (
    change === batch.change &&
    unsettle === batch.unsettle &&
    rest === batch.rest
  ) {
    return batch;
  }

  const rebound: Batch<V> = freezeHistoryBatch({
    ...batch,
    change,
    ...(unsettle ? { unsettle } : {}),
    ...(rest ? { rest } : {}),
  });
  const facts = historyFactsOf(batch);
  const stepId = historyBatchStepId(batch);
  const fallback = historyFallbackOf(batch);

  withHistoryFacts(rebound, facts);
  withHistoryStepId(rebound, stepId);
  if (fallback !== undefined) withHistoryFallback(rebound, fallback);

  return rebound;
};

const checkBatch = <V extends Value>(
  editor: Editor<V>,
  batch: Batch<V>,
  direction: 'redo' | 'undo',
  document: EditorDocumentValue,
  recordPrograms: boolean
): Readonly<{ after: EditorDocumentValue; batch: Batch<V> }> => {
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

  const bound = bindHistoryBatch(batch, value);

  if (bound.unsettle) {
    if (
      !bound.rest &&
      !documentChangeWritesOnlyElementProperties(bound.unsettle, value)
    ) {
      throw new Error(
        'A history step can take back only element properties its settle stage wrote.'
      );
    }
    editor.read.schema.assertDocument(bound.unsettle.apply(value));
  }
  const base = value;

  value = bound.change.apply(value);
  let finalBound = bound;
  const carriedRuns = bound.carried ?? [];

  if (carriedRuns.length > 0 && bound !== batch) {
    const runsByRoot = new Map<string, CarriedRun[]>();

    for (const run of carriedRuns) {
      const list = runsByRoot.get(run.root);

      if (list) list.push(run);
      else runsByRoot.set(run.root, [run]);
    }

    let alignedRoots: Map<string, RootChange> | null = null;

    for (const [root, rootRuns] of runsByRoot) {
      const change = getInternalDocumentRootChange(bound.change, root);

      if (!change) {
        throw new Error('A history step carries a run its change does not.');
      }
      const baseRoot = valueRootIndex(base, root);
      const afterRoot = valueRootIndex(value, root);
      const aligned = alignRootChangeToCarriedRuns(
        change,
        baseRoot,
        afterRoot,
        rootRuns
      );

      if (aligned) {
        if (!alignedRoots) {
          alignedRoots = new Map(
            getInternalDocumentChangeEntries(bound.change)
          );
        }
        alignedRoots.set(root, aligned);
      }
    }

    if (alignedRoots) {
      const alignedDocChange = createInternalDocumentChange(alignedRoots, {
        classifications: new Map(
          getInternalDocumentChangeClassificationEntries(bound.change)
        ),
        createRoots: bound.change.createRoots,
        deleteRoots: bound.change.deleteRoots,
        records: getInternalDocumentChangeRecords(bound.change),
      });

      copyV4StepsMetadata(bound.change, alignedDocChange);

      const reboundAligned: Batch<V> = freezeHistoryBatch({
        ...bound,
        change: alignedDocChange,
      });

      withHistoryFacts(reboundAligned, historyFactsOf(bound));
      withHistoryStepId(reboundAligned, historyBatchStepId(bound));
      const fallback = historyFallbackOf(bound);

      if (fallback !== undefined) withHistoryFallback(reboundAligned, fallback);
      finalBound = reboundAligned;
    }
  }

  for (const run of finalBound.carried ?? []) {
    const change = getInternalDocumentRootChange(finalBound.change, run.root);

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
    finalBound.carried?.length === 1 &&
    !finalBound.rest &&
    !finalBound.unsettle
  ) {
    withHistoryProgram(
      finalBound,
      checkedCarryProgram(
        historyReplaySchemaOf(editor),
        base,
        finalBound.change,
        finalBound.carried[0]
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

  return { after: value, batch: finalBound };
};

type RecordSets = ReturnType<typeof getCompiledEditorSchema>['recordSets'];

type NamedBy = NonNullable<SchemaRecordSet['namedBy']>;

const namesOf = (
  names: (record: Readonly<Record<string, unknown>>) => unknown,
  text: string | undefined
): readonly unknown[] => {
  try {
    const found = text === undefined ? null : names(JSON.parse(text));

    return Array.isArray(found) ? found : [];
  } catch {
    return [];
  }
};

const addsMissingName = (
  { names, set }: NamedBy,
  named: string,
  ops: RecordOps,
  before: RecordStore,
  after: RecordStore
) => {
  for (const [id, text] of ops.get(set) ?? []) {
    if (text === null) continue;
    const had = namesOf(names, getRecordText(before, set, id));

    if (
      namesOf(names, text).some(
        (name) =>
          typeof name === 'string' &&
          !had.includes(name) &&
          !hasRecord(after, named, name)
      )
    ) {
      return true;
    }
  }

  return false;
};

const dropsNamedRecord = (
  { names, set }: NamedBy,
  named: string,
  ops: RecordOps,
  before: RecordStore,
  after: RecordStore
) => {
  const dropped = new Set<string>();

  for (const [id, text] of ops.get(named) ?? []) {
    if (text === null && hasRecord(before, named, id)) dropped.add(id);
  }
  if (dropped.size === 0) return false;
  for (const [, text] of getRecordEntries(after, set)) {
    if (
      namesOf(names, text).some(
        (name) => typeof name === 'string' && dropped.has(name)
      )
    ) {
      return true;
    }
  }

  return false;
};

const breaksNames = (
  sets: RecordSets,
  change: DocumentChange,
  before: RecordStore,
  after: RecordStore
) => {
  const ops = getInternalDocumentChangeRecords(change);

  return [...sets].some(
    ([named, { namedBy }]) =>
      namedBy !== undefined &&
      (addsMissingName(namedBy, named, ops, before, after) ||
        dropsNamedRecord(namedBy, named, ops, before, after))
  );
};

const validateBatches = <V extends Value>(
  editor: Editor<V>,
  batches: ReadonlyArray<Batch<V>>,
  direction: 'redo' | 'undo',
  document: EditorDocumentValue,
  recordPrograms: boolean,
  fallbacks: Map<Batch<V>, Batch<V>>,
  sets: RecordSets | null = null,
  bases?: Map<Batch<V>, EditorDocumentValue>
) => {
  let value = document;
  let keptFrom = 0;
  const breaks = (
    batch: Batch<V>,
    from: EditorDocumentValue,
    to: EditorDocumentValue
  ) =>
    sets !== null &&
    breaksNames(sets, batch.change, getValueRecords(from), getValueRecords(to));

  const rebound = new Array<Batch<V>>(batches.length);

  for (const [at, batch] of batches.toReversed().entries()) {
    const index = batches.length - 1 - at;
    const fallback = direction === 'redo' ? historyFallbackOf(batch) : null;
    const checked = checkBatch(editor, batch, direction, value, recordPrograms);

    bases?.set(batch, value);
    bases?.set(checked.batch, value);
    rebound[index] = checked.batch;
    if (fallback) {
      try {
        const landed = checkBatch(
          editor,
          fallback,
          direction,
          value,
          recordPrograms
        );

        if (!breaks(landed.batch, value, landed.after)) {
          fallbacks.set(checked.batch, landed.batch);
          bases?.set(fallback, value);
          bases?.set(landed.batch, value);
        }
      } catch (error) {
        if (recordPrograms) throw error;
      }
    }

    if (keptFrom === 0 && breaks(checked.batch, value, checked.after)) {
      keptFrom = batches.length - at;
    }
    value = checked.after;
  }

  return rebound.slice(keptFrom);
};

const validateHistory = <V extends Value>(
  editor: Editor<V>,
  history: Pick<History<V>, 'redos' | 'undos'>,
  validateAgainst: EditorDocumentValue | false = editor.read.value(),
  recordPrograms = false,
  fallbacks = new Map<Batch<V>, Batch<V>>(),
  sets: RecordSets | null = null
) => {
  const bases = new Map<Batch<V>, EditorDocumentValue>();

  if (!validateAgainst) {
    for (const batch of history.redos) {
      const fallback = historyFallbackOf(batch);

      if (fallback) fallbacks.set(batch, fallback);
    }

    return { bases, fallbacks, redos: history.redos, undos: history.undos };
  }

  const kept = (batches: ReadonlyArray<Batch<V>>, direction: 'redo' | 'undo') =>
    validateBatches(
      editor,
      batches,
      direction,
      validateAgainst,
      recordPrograms,
      fallbacks,
      sets,
      bases
    );

  return {
    bases,
    fallbacks,
    redos: kept(history.redos, 'redo'),
    undos: kept(history.undos, 'undo'),
  };
};

type HistoryValidationOptions = Readonly<{
  restore?: boolean;
  validateAgainst?: EditorDocumentValue | false;
}>;

const decodeBatch = <V extends Value>(
  editor: Editor<V>,
  input: unknown,
  effectTypes: ReadonlyMap<string, { type: EditorEffectType }>,
  direction: 'redo' | 'undo',
  nested = false
): Batch<V> => {
  if (
    !isObject(input) ||
    (input.fallback !== undefined && (direction !== 'redo' || nested)) ||
    (input.unsettle !== undefined && direction === 'redo') ||
    (input.rest !== undefined && input.unsettle === undefined) ||
    (input.id !== undefined &&
      (nested || typeof input.id !== 'string' || input.id.length === 0)) ||
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

  const { recordSets } = getCompiledEditorSchema(editor);
  const decode = (change: unknown) =>
    withoutRetainedRecordSets(
      DocumentChange.fromJSON(change as ReturnType<DocumentChange['toJSON']>),
      recordSets
    );
  const batch: Batch<V> = {
    change: decode(input.change),
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
      : { unsettle: decode(input.unsettle) }),
    ...(input.rest === undefined ? {} : { rest: decode(input.rest) }),
    ...(carried ? { carried } : {}),
  };

  const recorded = withHistoryStepId(
    withHistoryFacts(batch, decodeRecord(input)),
    typeof input.id === 'string' ? input.id : undefined
  );

  return input.fallback === undefined
    ? recorded
    : withHistoryFallback(
        recorded,
        freezeHistoryBatch(
          decodeBatch(editor, input.fallback, effectTypes, direction, true)
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
      'Invalid history JSON or unsupported history version; expected version 8.'
    );
  }

  const schema = copyHistorySchemaIdentity(json.schema);

  assertSchemaIdentity(editor, schema);

  const ids = [...json.redos, ...json.undos].flatMap((step) =>
    isObject(step) && typeof step.id === 'string' ? [step.id] : []
  );

  if (new Set(ids).size !== ids.length) {
    throw new Error('Invalid history JSON: two steps share one id.');
  }

  const { effectTypes } = getInternalPluginRegistry(editor);
  const decodeStack = (direction: 'redo' | 'undo') =>
    json[direction === 'redo' ? 'redos' : 'undos'].flatMap((input) => {
      const batch = freezeHistoryBatch(
        decodeBatch(editor, input, effectTypes, direction)
      );

      return options.restore && batch.change.empty && batch.effects.length === 0
        ? []
        : [batch];
    });
  const { fallbacks, redos, undos } = validateHistory(
    editor,
    { redos: decodeStack('redo'), undos: decodeStack('undo') },
    options.validateAgainst,
    true,
    undefined,
    options.restore ? getCompiledEditorSchema(editor).recordSets : null
  );

  for (const batch of redos) {
    withHistoryFallback(batch, fallbacks.get(batch) ?? null);
  }

  return Object.freeze({
    redos: Object.freeze(redos),
    revision: 0,
    schema,
    undos: Object.freeze(undos),
  });
};

export const encodeHistoryValue = <V extends Value>(
  editor: Editor<V>,
  value: Pick<History<V>, 'redos' | 'schema' | 'undos'>,
  options: HistoryValidationOptions = {}
): HistoryJSON => {
  const history = withoutFrozenRedos(value);
  const schema = copyHistorySchemaIdentity(history.schema);

  assertSchemaIdentity(editor, schema);
  const checked = validateHistory(editor, history, options.validateAgainst);

  const persistent = (batches: ReadonlyArray<Batch<V>>) =>
    batches.filter((batch) =>
      batch.effects.every((effect) => typeof effect.type.history !== 'object')
    );

  const redos = persistent(history.redos);
  const undos = persistent(history.undos);

  return {
    redos: redos.map((batch) =>
      encodeStep(
        editor,
        batch,
        checked.fallbacks.get(batch),
        checked.bases.get(batch)
      )
    ),
    schema,
    undos: undos.map((batch) =>
      encodeStep(editor, batch, undefined, checked.bases.get(batch))
    ),
    version: 8,
  };
};
