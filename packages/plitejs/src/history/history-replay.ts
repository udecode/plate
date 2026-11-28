import { classifyDocumentChange } from '../core/change/builder';
import {
  type CarriedProjection,
  type LetterPlace,
  liftsCarriedLine,
  projectCarriedStep,
  relocatesCarriedBlock,
  mapPosThroughBlockMove,
  touchesCarriedRuns,
} from '../core/change/carried-projection';
import {
  type CarriedRun,
  type ExactRun,
  exactRunOn,
  invertCarriedRun,
  landCarriedRuns,
  widenRun,
} from '../core/change/carried-run';
import {
  type CarryFinal,
  type CarryProgram,
  carriedRunOf,
  carryRest,
  compileCarryProgram,
  mapCarryProgram,
  recordCarryProgram,
  repairKeepsCarry,
  sameResultsOfOneInput,
} from '../core/change/carry-program';
import {
  DocumentChange,
  createInternalDocumentChange,
  getInternalDocumentChangeClassificationEntries,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRecords,
  getInternalDocumentChangeRanges,
  getInternalDocumentRootChange,
  isInternalTextOnlyDocumentChange,
  transformInternalDocumentChange,
  valueRootIndex,
  withInternalDocumentRootChange,
} from '../core/change/document-change';
import type { DocumentIndex } from '../core/change/document-index';
import { markReadBack, type ReadBack } from '../core/change/read-back';
import { type KeptWrap, RootChange } from '../core/change/root-change';
import {
  PreparedTokenSlice,
  type JsonEditorValue,
  type JsonToken,
} from '../core/change/tokens';
import { countCoreWork } from '../core/work';
import type { AnyEditor, EditorDocumentValue } from '../interfaces/editor';
import type { Selection } from '../interfaces/selection';
import {
  type HistoryReplaySchema,
  historyReplaySchemaOf,
  replayTransformOptions,
} from './history-replay-schema';
import {
  isPureV4FormatChange,
  mapTextSelectionViaV4,
  rebaseCarriedFormatViaLetters,
  splitV4FormatTail,
  tryV4HistoryRebase,
} from './v4-history-rebase';

export { historyReplaySchemaOf };
type RecordedHistoryReplay<T extends JsonEditorValue> = Readonly<{
  structure: DocumentChange;
  after: T;
  format?: DocumentChange;
  structureAfter?: T;
  /**
   * The runs `structure` carries token for token, from the step's base to
   * the document `structure` gives; absent when a run has no such form.
   */
  runs?: readonly ExactRun[];
}>;
export type HistoryReplay<T extends JsonEditorValue = JsonEditorValue> =
  Readonly<{
    change: DocumentChange;
    direction: 'undo' | 'redo';
    /**
     * A part of a two-part step, whose letters match only by the tokens its
     * change keeps and the parents it moves whole.
     */
    exact?: 'rest' | 'unsettle';
    /** The take-back and the rest of a step whose commit settled a decision's text. */
    parts?: Readonly<{ rest: HistoryReplay<T>; unsettle: HistoryReplay<T> }>;
    /** The runs the step carries out of a nested line, as `Batch.carried`. */
    carried?: readonly CarriedRun[];
    program?: CarryProgram;
    record: () => RecordedHistoryReplay<T>;
    after?: T;
  }>;

/** A two-part step's take-back and rest, each from the document before it. */
export type HistoryReplayParts = Readonly<{
  rest: DocumentChange;
  unsettle: DocumentChange;
}>;

/** @internal */
export type ReplayRules = Readonly<{
  anchor: boolean;
  canRemoveEmptyParent?: boolean;
  readBack: boolean;
}>;

type Shaping = ReadBack & { projected: boolean };

type MapRules = Readonly<{
  anchor: boolean;
  canRemoveEmptyParent?: boolean;
  carriesLift?: boolean;
  readBack: Shaping | null;
}>;

const replayOver = (
  schema: HistoryReplaySchema,
  edit: DocumentChange,
  step: DocumentChange,
  base: JsonEditorValue,
  rules: MapRules
) =>
  transformInternalDocumentChange(
    edit,
    step,
    base,
    replayTransformOptions(schema, rules)
  );

export const recordHistoryReplay = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  base: T,
  change: DocumentChange,
  direction: 'undo' | 'redo',
  {
    after,
    carried,
    parts,
    program,
  }: Readonly<{
    after?: T;
    carried?: readonly CarriedRun[];
    parts?: HistoryReplayParts;
    program?: CarryProgram;
  }> = {}
): HistoryReplay<T> => {
  if (parts) {
    const unsettle = recordPart(
      schema,
      base,
      parts.unsettle,
      direction,
      'unsettle'
    );

    return pairedReplay(
      change,
      direction,
      unsettle,
      recordPart(schema, unsettle.record().after, parts.rest, direction, 'rest')
    );
  }

  let recorded: RecordedHistoryReplay<T> | undefined;

  const known = after ? { after } : {};

  if (program) {
    return {
      change,
      ...(carried?.length ? { carried } : {}),
      direction,
      ...known,
      program,
      record: () => (recorded ??= recordReplay(schema, base, change, known)),
    };
  }

  return {
    change,
    ...(carried?.length ? { carried } : {}),
    direction,
    ...known,
    record: () =>
      (recorded ??= recordReplay(schema, base, change, {
        ...known,
        carried,
      })),
  };
};

type CompiledProgram<T extends JsonEditorValue> = Readonly<{
  after: T;
  change: DocumentChange;
  final: CarryFinal;
}>;

const COMPILED_PROGRAMS = new WeakMap<
  CarryProgram,
  Readonly<{
    base: JsonEditorValue;
    compiled: CompiledProgram<JsonEditorValue>;
  }>
>();

const compileProgram = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  program: CarryProgram,
  base: T
): CompiledProgram<T> | null => {
  const cached = COMPILED_PROGRAMS.get(program);

  if (cached?.base === base) return cached.compiled as CompiledProgram<T>;

  const { root } = program;
  const document = valueRootIndex(base, root);
  const carry = compileCarryProgram(program, document, schema.lines);

  if (!carry) return null;

  const step = createInternalDocumentChange(new Map([[root, carry.step]]));
  const output = step.apply(base);
  const repair = schema.repairCanonical(base, step, output);

  if (!repair.empty && !holdsOnly(repair, root)) return null;

  const outputDocument = valueRootIndex(output, root);
  const repairRoot =
    getInternalDocumentRootChange(repair, root) ??
    RootChange.empty(outputDocument.length);

  if (!repairKeepsCarry(carry, outputDocument, repairRoot)) return null;

  const after = repair.empty ? output : repair.apply(output);
  const compiled = {
    after,
    change: composeRepair(step, repair),
    final: {
      after: valueRootIndex(after, root),
      carry,
      output: outputDocument,
      repair: repairRoot,
    },
  };

  COMPILED_PROGRAMS.set(program, { base, compiled });

  return compiled;
};

export const projectedHistoryReplay = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  replay: HistoryReplay<T>,
  base: T
) => {
  const { program } = replay;
  const compiled =
    !replay.carried && program && compileProgram(schema, program, base);
  const run = program && compiled && carriedRunOf(compiled.final, program.root);
  const carried = replay.carried ?? (run ? [run] : undefined);

  return carried
    ? recordHistoryReplay(schema, base, replay.change, replay.direction, {
        carried,
      })
    : null;
};

const producesResultOfSameBase = <T extends JsonEditorValue>(
  compiled: CompiledProgram<T>,
  after: T,
  root: string,
  change: RootChange
) => {
  const step = getInternalDocumentRootChange(compiled.change, root);

  return (
    step !== undefined &&
    sameResultsOfOneInput(compiled.final.after, valueRootIndex(after, root), [
      step,
      change,
    ])
  );
};

export const checkedCarryProgram = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  base: T,
  change: DocumentChange,
  run: CarriedRun
) => {
  const step = getInternalDocumentRootChange(change, run.root);

  if (!step || !holdsOnly(change, run.root)) return undefined;

  const after = change.apply(base);
  const program = recordCarryProgram({
    after: valueRootIndex(after, run.root),
    before: valueRootIndex(base, run.root),
    run,
    schema: schema.lines,
    step,
  });
  const compiled = program && compileProgram(schema, program, base);
  const implied =
    compiled &&
    producesResultOfSameBase(compiled, after, run.root, step) &&
    carriedRunOf(compiled.final, run.root);

  return program && implied ? { program, run: implied } : undefined;
};

export const invertedCarryProgram = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  program: CarryProgram,
  base: T,
  after: T,
  change: DocumentChange
) => {
  const compiled = compileProgram(schema, program, base);
  const back = getInternalDocumentRootChange(change, program.root);

  if (
    !compiled ||
    !back ||
    !holdsOnly(change, program.root) ||
    !producesResultOfSameBase(compiled, after, program.root, back)
  ) {
    return undefined;
  }

  const run = carriedRunOf(compiled.final, program.root);

  return run
    ? checkedCarryProgram(schema, after, change, invertCarriedRun(run))
    : undefined;
};

type ProgramWindow = Readonly<{
  base: JsonEditorValue;
  from: number;
  inputFrom: number;
  inputTo: number;
  to: number;
}>;

const PROGRAM_WINDOWS = new WeakMap<CarryProgram, ProgramWindow>();

const programWindow = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  program: CarryProgram,
  base: T
): ProgramWindow | null => {
  const known = PROGRAM_WINDOWS.get(program);

  if (known?.base === base) return known;

  const compiled = compileProgram(schema, program, base);

  if (!compiled) return null;

  const document = valueRootIndex(base, program.root);
  const block = (position: number) =>
    document
      .openContextAt(position)
      .find(
        (entry) =>
          entry.path.length === 1 &&
          entry.from <= position &&
          position < entry.to
      );
  const { inputFrom, inputTo } = compiled.final.carry;

  return {
    base,
    from: block(inputFrom)?.from ?? inputFrom,
    inputFrom,
    inputTo,
    to: inputTo > inputFrom ? (block(inputTo - 1)?.to ?? inputTo) : inputTo,
  };
};

const writesElementEdge = (tokens: readonly JsonToken[]) =>
  tokens.some((token) => token.kind !== 'text' && token.nodeKind === 'element');

const editsWithin = (
  edit: RootChange,
  document: DocumentIndex,
  window: ProgramWindow
) => {
  let to = 0;

  for (let index = 0; index < edit.sections.length; index += 2) {
    const from = to;
    const inserted = edit.sections[index + 1];
    const written = edit.data[index / 2];

    to += edit.sections[index];
    if (inserted === -1 || to < window.from || window.to < from) continue;

    const structural =
      inserted === -2 ||
      (written instanceof PreparedTokenSlice &&
        writesElementEdge(written.tokens)) ||
      writesElementEdge(document.slice(from, to).tokens);
    const start = structural ? window.from : window.inputFrom;
    const end = structural ? window.to : window.inputTo;

    if (from <= end && start <= to) return true;
  }

  return false;
};

const mapProgramByPosition = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  replay: HistoryReplay<T>,
  program: CarryProgram,
  base: T,
  mapping: HistoryMapping<T>,
  edit: RootChange,
  window: ProgramWindow,
  rules: MapRules
) => {
  const mapped = mapOneReplay(
    schema,
    recordHistoryReplay(schema, base, replay.change, replay.direction, {
      carried: replay.carried,
    }),
    base,
    mapping,
    { anchor: false, readBack: rules.readBack }
  );
  const moved = mapCarryProgram(
    program,
    edit,
    valueRootIndex(base, program.root),
    valueRootIndex(mapping.after, program.root),
    schema.lines
  );
  const from = edit.mapPos(window.from, -1);
  const to = edit.mapPos(window.to, 1);
  const inputFrom = edit.mapPos(window.inputFrom, -1);
  const inputTo = edit.mapPos(window.inputTo, 1);

  if (!moved || mapped.replay.carried?.length !== 1) return mapped;
  if (from !== null && to !== null && inputFrom !== null && inputTo !== null) {
    PROGRAM_WINDOWS.set(moved, {
      base: mapping.after,
      from,
      inputFrom,
      inputTo,
      to,
    });
  }

  return {
    ...mapped,
    replay: recordHistoryReplay(
      schema,
      mapping.after,
      mapped.replay.change,
      replay.direction,
      { carried: mapped.replay.carried, program: moved }
    ),
  };
};

const mapProgramReplay = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  replay: HistoryReplay<T>,
  program: CarryProgram,
  base: T,
  mapping: HistoryMapping<T>,
  rules: MapRules
) => {
  const { root } = program;
  const edit = getInternalDocumentRootChange(mapping.change, root);

  if (!edit || !holdsOnly(mapping.change, root)) return null;

  const window = replay.carried && programWindow(schema, program, base);

  if (window && !editsWithin(edit, valueRootIndex(base, root), window)) {
    return mapProgramByPosition(
      schema,
      replay,
      program,
      base,
      mapping,
      edit,
      window,
      rules
    );
  }

  const previous = compileProgram(schema, program, base);
  const before = valueRootIndex(base, root);
  const mapped =
    previous &&
    mapCarryProgram(
      program,
      edit,
      before,
      valueRootIndex(mapping.after, root),
      schema.lines
    );
  const next = mapped && compileProgram(schema, mapped, mapping.after);
  const run = next && carriedRunOf(next.final, root);

  if (!previous || !mapped || !next || !run) return null;

  return {
    keptWrap: null,
    replay: recordHistoryReplay(
      schema,
      mapping.after,
      next.change,
      replay.direction,
      { carried: [run], program: mapped }
    ),
    rest: createInternalDocumentChange(
      new Map([[root, carryRest(previous.final, edit, before, next.final)]])
    ),
  };
};

const recordPart = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  base: T,
  change: DocumentChange,
  direction: 'undo' | 'redo',
  exact: 'rest' | 'unsettle'
): HistoryReplay<T> => {
  const part = classifyDocumentChange(base, change.apply(base), change);
  let recorded: RecordedHistoryReplay<T> | undefined;

  return {
    change: part,
    direction,
    exact,
    record: () =>
      (recorded ??= recordReplay(schema, base, part, {
        exact: exact === 'rest',
      })),
  };
};

const pairedReplay = <T extends JsonEditorValue>(
  change: DocumentChange,
  direction: 'undo' | 'redo',
  unsettle: HistoryReplay<T>,
  rest: HistoryReplay<T>
): HistoryReplay<T> => ({
  change,
  direction,
  parts: { rest, unsettle },
  record: () => ({
    after: rest.record().after,
    structure: change,
  }),
});

/**
 * The runs `structure` carries token for token from `before` to `after`, or
 * undefined when it has none or one of them has no such form.
 */
const exactRunsOf = (
  runs: readonly CarriedRun[] | undefined,
  structure: DocumentChange,
  before: JsonEditorValue,
  after: JsonEditorValue
) => {
  const exact: ExactRun[] = [];

  for (const run of runs ?? []) {
    const change = getInternalDocumentRootChange(structure, run.root);
    const found =
      change &&
      exactRunOn(
        run,
        change,
        valueRootIndex(before, run.root),
        valueRootIndex(after, run.root)
      );

    if (!found) return undefined;
    exact.push(found);
  }

  return exact.length > 0 ? exact : undefined;
};

const recordReplay = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  base: T,
  change: DocumentChange,
  known: Readonly<{
    after?: T;
    carried?: readonly CarriedRun[];
    exact?: boolean;
    maybeFormatted?: boolean;
  }> = {}
): RecordedHistoryReplay<T> => {
  const after = known.after ?? change.apply(base);
  const split =
    known.carried?.length || known.exact
      ? splitV4FormatTail(
          base,
          change,
          after,
          schema.isSetValued,
          known.maybeFormatted === true || known.exact === true,
          known.carried
        )
      : null;
  const structure = split ? split.structure : change;
  const structureAfter = split ? split.structureAfter : after;
  const carriedForStructure =
    split && known.carried
      ? (landCarriedRuns(
          known.carried,
          [
            {
              after: structureAfter,
              before: after,
              change: split.formatInverse,
            },
          ],
          { after: structureAfter, before: base, change: structure }
        ) ?? known.carried)
      : known.carried;
  const runs = exactRunsOf(
    carriedForStructure,
    structure,
    base,
    structureAfter
  );
  const useSplit = Boolean(split && (runs || known.exact));

  return {
    after,
    ...(useSplit && split ? { format: split.format, structureAfter } : {}),
    ...(runs ? { runs } : {}),
    structure: useSplit ? structure : change,
  };
};

const composeRepair = (change: DocumentChange, repair: DocumentChange) =>
  repair.empty ? change : change.compose(repair);

type CarriedMapping = Readonly<{
  /** The edit from the document the step gave, the change older steps map through. */
  a: DocumentChange;
  /** The step from the edited document. */
  b: DocumentChange;
  /** The runs the mapped step carries, or null when it no longer carries any. */
  runs: readonly CarriedRun[] | null;
  /** The projection's letter map, when it placed the step. */
  letters?: Readonly<{
    root: string;
    letterAt: (position: number) => LetterPlace;
  }>;
  keptWrap: KeptWrap | null;
}>;

/**
 * Map a step that carries runs through an outside edit: by content when the
 * edit touches a run, and by position otherwise or when the projection finds
 * no place, which drops the runs and counts the fallback.
 */
const carryReplay = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  runs: readonly ExactRun[],
  recorded: RecordedHistoryReplay<T>,
  base: T,
  middle: T,
  mapping: HistoryMapping<T>,
  rules: MapRules
): CarriedMapping => {
  const ordinary = (carriesLift = false) =>
    replayOver(schema, mapping.change, recorded.structure, base, {
      ...rules,
      carriesLift,
    });
  const { root } = runs[0];
  const step = getInternalDocumentRootChange(recorded.structure, root);
  const edit = getInternalDocumentRootChange(mapping.change, root);

  if (!step || runs.some((run) => run.root !== root)) {
    return { ...ordinary(), runs: null };
  }
  if (!edit) return { ...ordinary(), runs: runs.map(widenRun) };

  const input = {
    after: valueRootIndex(middle, root),
    before: valueRootIndex(base, root),
    edit,
    edited: valueRootIndex(mapping.after, root),
    root,
    runs,
    schema: schema.lines,
    step,
  };
  let projected: CarriedProjection | null;
  let moved = false;
  let lifts = false;

  try {
    moved = relocatesCarriedBlock(input);

    const touched = !moved && touchesCarriedRuns(input);

    lifts = touched && rules.readBack !== null && liftsCarriedLine(input);
    projected = touched && !lifts ? projectCarriedStep(input) : null;
  } catch {
    // Counted only once the ordinary map works, since a step no map can
    // place is dropped and counted there.
    const fallback = ordinary();

    countCoreWork('carriedFallbacks');

    return { ...fallback, runs: null };
  }

  if (moved) return { ...ordinary(), runs: null };
  if (lifts) markReadBack(rules.readBack);
  if (projected && rules.readBack) rules.readBack.projected = true;
  if (!projected) {
    const mapped = ordinary(lifts);
    const rest = getInternalDocumentRootChange(mapped.a, root);
    const sourceOf = mapPosThroughBlockMove(edit, input.before);
    const atOf = rest ? mapPosThroughBlockMove(rest, input.after) : null;

    return {
      ...mapped,
      runs: runs.flatMap((run) => {
        const source = sourceOf(run.source);
        const at = atOf ? atOf(run.at) : run.at;

        return source === null || at === null
          ? []
          : [{ ...widenRun(run), at, source }];
      }),
    };
  }

  const letters = { letterAt: projected.letterAt, root };

  if (holdsOnly(mapping.change, root) && holdsOnly(recorded.structure, root)) {
    return {
      a: createInternalDocumentChange(new Map([[root, projected.rest]])),
      b: createInternalDocumentChange(new Map([[root, projected.step]])),
      letters,
      keptWrap: null,
      runs: projected.runs,
    };
  }

  const mapped = ordinary();

  return {
    a: withInternalDocumentRootChange(mapped.a, root, projected.rest),
    b: withInternalDocumentRootChange(mapped.b, root, projected.step),
    letters,
    keptWrap: mapped.keptWrap,
    runs: projected.runs,
  };
};

/** Whether `change` changes nothing but `root`'s tokens. */
const holdsOnly = (change: DocumentChange, root: string) =>
  change.createRoots.size === 0 &&
  change.deleteRoots.size === 0 &&
  getInternalDocumentChangeRecords(change).size === 0 &&
  [...getInternalDocumentChangeEntries(change)].every(([key]) => key === root);

type HistoryMapping<T extends JsonEditorValue> = Readonly<{
  after: T;
  change: DocumentChange;
  textOnly: boolean;
}>;

/**
 * Map a step through an outside edit from its base. A two-part step maps its
 * take-back first, then its rest through what is left of the edit.
 */
export const mapHistoryReplay = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  replay: HistoryReplay<T>,
  base: T,
  mapping: HistoryMapping<T>,
  { anchor, canRemoveEmptyParent, readBack: reads }: ReplayRules
): Readonly<{
  keptWrap: KeptWrap | null;
  projected: boolean;
  readBack: boolean;
  replay: HistoryReplay<T>;
  rest: DocumentChange;
}> => {
  const readBack = reads ? { changed: false, projected: false } : null;
  const mapped = mapReplay(schema, replay, base, mapping, {
    anchor,
    canRemoveEmptyParent,
    readBack,
  });

  return {
    ...mapped,
    projected: readBack?.projected === true,
    readBack: readBack?.changed === true,
  };
};

const mapReplay = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  replay: HistoryReplay<T>,
  base: T,
  mapping: HistoryMapping<T>,
  rules: MapRules
): Readonly<{
  keptWrap: KeptWrap | null;
  replay: HistoryReplay<T>;
  rest: DocumentChange;
}> => {
  if (!replay.parts) return mapOneReplay(schema, replay, base, mapping, rules);

  const partRules = { ...rules, anchor: false };
  const unsettle = mapOneReplay(
    schema,
    replay.parts.unsettle,
    base,
    mapping,
    partRules
  );
  const rest = mapOneReplay(
    schema,
    replay.parts.rest,
    replay.parts.unsettle.record().after,
    {
      after: unsettle.replay.record().after,
      change: unsettle.rest,
      textOnly: false,
    },
    partRules
  );

  return {
    keptWrap: null,
    replay: pairedReplay(
      unsettle.replay.change.compose(rest.replay.change),
      replay.direction,
      unsettle.replay,
      rest.replay
    ),
    rest: rest.rest,
  };
};

const replayedStructure = <T extends JsonEditorValue>(
  replay: HistoryReplay<T>,
  recorded: RecordedHistoryReplay<T>,
  base: T,
  mapping: HistoryMapping<T>
) =>
  !replay.exact &&
  !replay.carried &&
  mapping.textOnly &&
  isInternalTextOnlyDocumentChange(replay.change)
    ? DocumentChange.between(base, recorded.after)
    : recorded.structure;

const rangesApart = (step: DocumentChange, delivered: DocumentChange) =>
  step.createRoots.size === 0 &&
  step.deleteRoots.size === 0 &&
  getInternalDocumentChangeRecords(step).size === 0 &&
  [...getInternalDocumentChangeClassificationEntries(step)].every(
    ([root, kind]) => {
      if (
        !kind.text ||
        kind.properties ||
        kind.structure ||
        delivered.createRoots.has(root) ||
        delivered.deleteRoots.has(root)
      ) {
        return false;
      }

      const theirs = getInternalDocumentChangeRanges(delivered, root);

      return getInternalDocumentChangeRanges(step, root).every(([from, to]) =>
        theirs.every(([theirFrom, theirTo]) => to < theirFrom || theirTo < from)
      );
    }
  );

export const keepsUndoThrough = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  replay: HistoryReplay<T>,
  base: T,
  mapping: HistoryMapping<T>
) => {
  if (
    replay.direction !== 'undo' ||
    replay.after === undefined ||
    replay.carried ||
    replay.exact ||
    replay.parts ||
    replay.program
  ) {
    return false;
  }

  if (rangesApart(replay.change, mapping.change)) return true;

  const recorded = replay.record();

  try {
    const v4 = tryV4HistoryRebase(
      base,
      mapping.change,
      mapping.after,
      replay.change,
      recorded.after,
      schema.isSetValued
    );

    if (v4) return !v4.b.empty;

    return !replayOver(
      schema,
      mapping.change,
      replayedStructure(replay, recorded, base, mapping),
      base,
      { anchor: false, readBack: { changed: false, projected: false } }
    ).b.empty;
  } catch {
    return false;
  }
};

const mapOneReplay = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  replay: HistoryReplay<T>,
  base: T,
  mapping: HistoryMapping<T>,
  rules: MapRules
): Readonly<{
  keptWrap: KeptWrap | null;
  replay: HistoryReplay<T>;
  rest: DocumentChange;
}> => {
  if (replay.program) {
    const mapped = mapProgramReplay(
      schema,
      replay,
      replay.program,
      base,
      mapping,
      rules
    );

    if (mapped) return mapped;

    const projected = projectedHistoryReplay(schema, replay, base);

    if (projected) {
      return mapOneReplay(schema, projected, base, mapping, rules);
    }

    countCoreWork('carriedFallbacks');
  }

  const { exact } = replay;
  const stepRules = {
    anchor: rules.anchor && replay.direction === 'redo' && !exact,
    readBack: rules.readBack,
  };
  const asReplay = (
    change: DocumentChange,
    record: () => RecordedHistoryReplay<T>
  ): HistoryReplay<T> => {
    if (!exact) return { change, direction: replay.direction, record };

    const part = classifyDocumentChange(mapping.after, record().after, change);

    return { change: part, direction: replay.direction, exact, record };
  };
  const recorded = replay.record();
  const structureAfter = recorded.structureAfter ?? recorded.after;
  const carry =
    replay.carried && !exact && recorded.runs
      ? carryReplay(
          schema,
          recorded.runs,
          recorded,
          base,
          structureAfter,
          mapping,
          stepRules
        )
      : null;

  const pureFormat =
    !carry && (stepRules.anchor || exact === 'rest')
      ? isPureV4FormatChange(
          base,
          replay.change,
          recorded.after,
          schema.isSetValued
        )
      : false;
  const v4Mapped =
    !carry &&
    (!stepRules.anchor || pureFormat) &&
    (!exact || (exact === 'rest' && pureFormat))
      ? tryV4HistoryRebase(
          base,
          mapping.change,
          mapping.after,
          replay.change,
          recorded.after,
          schema.isSetValued,
          false,
          rules.canRemoveEmptyParent === true
        )
      : null;

  const transformed =
    carry ??
    (v4Mapped
      ? { a: v4Mapped.a, b: v4Mapped.b, keptWrap: null }
      : replayOver(
          schema,
          mapping.change,
          replayedStructure(replay, recorded, base, mapping),
          base,
          stepRules
        ));
  const { keptWrap } = transformed;
  const mappedStructureAfter =
    carry || v4Mapped
      ? transformed.b.apply(mapping.after)
      : transformed.a.apply(structureAfter);

  let mappedB = transformed.b;
  let mappedA = transformed.a;
  let mappedAfter = mappedStructureAfter;
  let mappedFormat: DocumentChange | null = null;

  if ((carry || exact === 'rest') && recorded.format) {
    const structRepair = schema.repairCanonical(
      mapping.after,
      transformed.b,
      mappedStructureAfter
    );
    const repairedStructB = composeRepair(transformed.b, structRepair);
    const repairedStructA = composeRepair(transformed.a, structRepair);
    const repairedStructAfter = structRepair.empty
      ? mappedStructureAfter
      : structRepair.apply(mappedStructureAfter);
    const v4Fmt =
      (carry?.letters
        ? rebaseCarriedFormatViaLetters(
            structureAfter,
            recorded.format,
            recorded.after,
            carry.letters,
            structRepair,
            repairedStructA,
            repairedStructAfter,
            schema.isSetValued
          )
        : null) ??
      tryV4HistoryRebase(
        structureAfter,
        repairedStructA,
        repairedStructAfter,
        recorded.format,
        recorded.after,
        schema.isSetValued
      );
    const fmtTransformed =
      v4Fmt ??
      replayOver(
        schema,
        repairedStructA,
        recorded.format,
        structureAfter,
        stepRules
      );

    mappedFormat = structRepair.empty
      ? fmtTransformed.b
      : structRepair.compose(fmtTransformed.b);
    mappedB = repairedStructB.compose(fmtTransformed.b);
    mappedA = fmtTransformed.a;
    mappedAfter = fmtTransformed.b.apply(repairedStructAfter);
  }

  const repair = schema.repairCanonical(mapping.after, mappedB, mappedAfter);
  const change = composeRepair(mappedB, repair);
  const after = repair.empty ? mappedAfter : repair.apply(mappedAfter);
  const rest = composeRepair(mappedA, repair);
  const landingSteps = [
    ...(mappedFormat
      ? [
          {
            after: mappedAfter,
            before: mappedStructureAfter,
            change: mappedFormat,
          },
        ]
      : []),
    { after, before: mappedAfter, change: repair },
  ];
  const carried =
    carry?.runs &&
    landCarriedRuns(carry.runs, landingSteps, {
      after,
      before: mapping.after,
      change,
    });
  const mapped = asReplay(change, () =>
    recordReplay(schema, mapping.after, change, {
      after,
      carried: carried ?? undefined,
      exact: exact === 'rest',
      maybeFormatted: Boolean((carry || exact === 'rest') && recorded.format),
    })
  );

  return {
    keptWrap,
    replay: { ...mapped, after, ...(carried ? { carried } : {}) },
    rest,
  };
};

export const mapHistorySelection = (
  editor: AnyEditor,
  selection: Selection,
  change: DocumentChange,
  before: EditorDocumentValue,
  after: EditorDocumentValue,
  root: string,
  exact = false
): Selection =>
  mapTextSelectionViaV4(editor, selection, change, before, after, root, exact);
