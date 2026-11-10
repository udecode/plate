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
  carriedLetterPairs,
  type ExactRun,
  exactRunOn,
  invertCarriedRun,
  landCarriedRuns,
  mapCarriedRunThrough,
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
  alignedDocumentChange,
  collapseDocumentElementPropertyWrites,
  createInternalDocumentChange,
  getInternalDocumentChangeClassificationEntries,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRecords,
  getInternalDocumentChangeRanges,
  getInternalDocumentRootChange,
  transformInternalDocumentChange,
  valueRootIndex,
  withInternalDocumentRootChange,
} from '../core/change/document-change';
import type { DocumentIndex, NodeList } from '../core/change/document-index';
import { jsonEqual, type JsonRecord } from '../core/change/json';
import { markReadBack, type ReadBack } from '../core/change/read-back';
import {
  getDocumentPropertyContext,
  type KeptWrap,
  RootChange,
} from '../core/change/root-change';
import {
  isTextNode,
  nodeProps,
  PreparedTokenSlice,
  type JsonEditorValue,
  type JsonNode,
  type JsonToken,
} from '../core/change/tokens';
import { normalizeSetValues } from '../core/change/transform';
import { getEditorSchema } from '../core/editor-runtime';
import { constructCanonicalDocumentChange } from '../core/representation';
import { mapSelectionThroughChange } from '../core/selection-protocol';
import { countCoreWork } from '../core/work';
import type { Descendant, Element } from '../interfaces';
import type { AnyEditor, EditorDocumentValue } from '../interfaces/editor';
import { ElementApi } from '../interfaces/element';
import { SelectionApi, type Selection } from '../interfaces/selection';
import { getDefined } from '../internal/get-defined';
import {
  createCharacterCorrespondence,
  textHostAt,
  type CharacterSpan,
} from './history-character-map';

type TextKeyWrite =
  | Readonly<{ key: string; kind: 'value'; expect: unknown; value: unknown }>
  | Readonly<{
      key: string;
      kind: 'members';
      add: readonly unknown[];
      remove: readonly unknown[];
    }>;
type TextFormatSpan = CharacterSpan &
  Readonly<{ writes: readonly TextKeyWrite[] }>;
type HistoryReplaySchema = ReturnType<typeof historyReplaySchemaOf>;
type RecordedHistoryReplay<T extends JsonEditorValue> = Readonly<{
  structure: DocumentChange;
  format: ReadonlyMap<string, readonly TextFormatSpan[]>;
  after: T;
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
    exact?: true;
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

export const historyReplaySchemaOf = (editor: AnyEditor) => {
  const schema = getEditorSchema(editor);
  return {
    canonicalize: (
      properties: JsonRecord,
      path: readonly number[],
      root: string,
      key: string,
      value: JsonEditorValue
    ) =>
      schema.canonicalizeTextPropertiesAt(
        properties,
        [...path],
        root,
        key,
        value as EditorDocumentValue
      ),
    allows: (
      key: string,
      path: readonly number[],
      root: string,
      value: JsonEditorValue
    ) =>
      schema.isTextPropertyAllowedAt(
        key,
        [...path],
        root,
        value as EditorDocumentValue
      ),
    lines: {
      isInline: (node: JsonNode) =>
        ElementApi.isElement(node) && schema.isInline(node),
      isVoid: (node: JsonNode) =>
        ElementApi.isElement(node) && schema.isVoid(node),
      splitProps: (
        node: JsonNode,
        ancestors: readonly JsonNode[],
        root: string
      ) =>
        ElementApi.isElement(node)
          ? {
              ...schema.elementPropertiesForSplitUnder(
                node,
                ancestors as readonly Element[],
                root
              ),
              type: node.type,
            }
          : {},
    },
    pieceProps: (
      node: JsonNode,
      path: readonly number[],
      root: string,
      nodes: NodeList
    ) =>
      ElementApi.isElement(node)
        ? {
            ...schema.elementPropertiesForSplitAt(
              node,
              [...path],
              root,
              nodes as NodeList<Descendant>
            ),
            type: node.type,
          }
        : {},
    isSetValued: schema.isSetValuedProperty,
    repairCanonical: (
      before: JsonEditorValue,
      change: DocumentChange,
      after: JsonEditorValue
    ) =>
      constructCanonicalDocumentChange(editor, after, change, {
        before,
        displacement: 'none',
      }),
  };
};

/** @internal */
export type ReplayRules = Readonly<{ anchor: boolean; readBack: boolean }>;

type Shaping = ReadBack & { projected: boolean };

type MapRules = Readonly<{
  anchor: boolean;
  carriesLift?: boolean;
  readBack: Shaping | null;
}>;

const replayOver = (
  schema: HistoryReplaySchema,
  edit: DocumentChange,
  step: DocumentChange,
  base: JsonEditorValue,
  { anchor, carriesLift, readBack }: MapRules
) =>
  transformInternalDocumentChange(edit, step, base, {
    keepRecordWrites: true,
    replay: {
      anchor,
      carriesLift,
      pieceProps: (element, parent, root, nodes) =>
        schema.pieceProps(element, [...parent, 0], root, nodes),
      readBack,
    },
  });

const rewriteSpans = <T extends JsonEditorValue>(
  value: T,
  spans: ReadonlyMap<string, readonly CharacterSpan[]>,
  properties: (
    span: CharacterSpan,
    props: JsonRecord,
    path: readonly number[],
    root: string
  ) => JsonRecord
): T => {
  let result = value;
  for (const [root, ranges] of spans) {
    const index = valueRootIndex(result, root);
    const groups = new Map<string, CharacterSpan[]>();
    for (const span of ranges) {
      const key = span.path.join('.');
      const group = groups.get(key) ?? [];
      group.push(span);
      groups.set(key, group);
    }
    const replacements = new Map<string, readonly JsonNode[]>();
    for (const group of groups.values()) {
      const host = textHostAt(index, group[0].path);
      const children: JsonNode[] = [];
      let position = 0;
      for (let at = 0; at < host.leaves.length; at += 1) {
        const leaf = host.leaves[at];
        if (!isTextNode(leaf)) continue;
        const edges = [
          ...new Set([
            position,
            position + leaf.text.length,
            ...group
              .flatMap((span) => [span.from, span.to])
              .filter(
                (edge) => edge > position && edge < position + leaf.text.length
              ),
          ]),
        ].sort((a, b) => a - b);
        for (let edge = 1; edge < edges.length; edge += 1) {
          const from = edges[edge - 1];
          const to = edges[edge];
          let props = nodeProps(leaf);
          for (const span of group) {
            if (span.from <= from && to <= span.to) {
              props = properties(
                span,
                props,
                [...host.path.slice(0, -1), getDefined(host.path.at(-1)) + at],
                root
              );
            }
          }
          const text = leaf.text.slice(from - position, to - position);
          const previous = children.at(-1);
          if (
            previous &&
            isTextNode(previous) &&
            jsonEqual(nodeProps(previous), props)
          ) {
            children[children.length - 1] = {
              ...props,
              text: previous.text + text,
            };
          } else children.push({ ...props, text });
        }
        position += leaf.text.length;
      }
      replacements.set(group[0].path.join('.'), children);
    }
    const visit = (
      nodes: readonly JsonNode[],
      parent: readonly number[],
      offset = 0
    ): readonly JsonNode[] => {
      const output: JsonNode[] = [];
      for (let at = 0; at < nodes.length; at += 1) {
        const node = nodes[at];
        const path = [...parent, at + offset];
        const replacement = replacements.get(path.join('.'));
        if (replacement) {
          output.push(...replacement);
          while (at + 1 < nodes.length && isTextNode(nodes[at + 1])) at += 1;
        } else if (
          !isTextNode(node) &&
          ranges.some((span) =>
            path.every((part, depth) => span.path[depth] === part)
          )
        ) {
          output.push({ ...node, children: visit(node.children, path) });
        } else output.push(node);
      }
      return output;
    };
    const changes = [...new Set(ranges.map((span) => span.path[0]))].map(
      (at) => {
        const node = index.node([at]);
        const range = index.nodeRange([at]);
        return {
          from: range.from,
          to: range.to,
          insert: PreparedTokenSlice.fromNodes(visit([node], [], at)),
        };
      }
    );
    result = createInternalDocumentChange(
      new Map([[root, RootChange.create(index, changes)]])
    ).apply(result);
  }
  return result;
};

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
    const unsettle = recordPart(schema, base, parts.unsettle, direction);

    return pairedReplay(
      change,
      direction,
      unsettle,
      recordPart(schema, unsettle.record().after, parts.rest, direction)
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
      record: () =>
        (recorded ??= recordReplay(schema, base, change, false, known)),
    };
  }

  return {
    change,
    ...(carried?.length ? { carried } : {}),
    direction,
    ...known,
    record: () =>
      (recorded ??= recordReplay(schema, base, change, false, {
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
  direction: 'undo' | 'redo'
): HistoryReplay<T> => {
  const part = classifyDocumentChange(base, change.apply(base), change);
  let recorded: RecordedHistoryReplay<T> | undefined;

  return {
    change: part,
    direction,
    exact: true,
    record: () => (recorded ??= recordReplay(schema, base, part, true)),
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
    format: new Map(),
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

/** Each carried letter of `root` in `before`, with where it lands in `after`. */
const carriedLettersOf = (
  runs: readonly CarriedRun[] | undefined,
  root: string,
  before: JsonEditorValue,
  after: JsonEditorValue
) => {
  const letters = new Map<number, number>();

  for (const run of runs ?? []) {
    if (run.root !== root) continue;
    for (const { from, to } of carriedLetterPairs(
      run,
      valueRootIndex(before, root),
      valueRootIndex(after, root)
    )) {
      letters.set(from, to);
    }
  }

  return letters.size > 0
    ? (position: number) => letters.get(position)
    : undefined;
};

const recordReplay = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  base: T,
  change: DocumentChange,
  exact = false,
  known: Readonly<{ after?: T; carried?: readonly CarriedRun[] }> = {}
): RecordedHistoryReplay<T> => {
  const { carried } = known;
  const after = known.after ?? change.apply(base);
  const format = new Map<string, TextFormatSpan[]>();
  const classifications = [
    ...getInternalDocumentChangeClassificationEntries(change),
  ];
  const unformatted = () => {
    const runs = exactRunsOf(carried, change, base, after);

    return { structure: change, format, after, ...(runs ? { runs } : {}) };
  };
  if (
    change.empty ||
    (classifications.length > 0 &&
      classifications.every(
        ([, kind]) => kind.text && !kind.properties && !kind.structure
      ))
  ) {
    return unformatted();
  }
  const reset = new Map<CharacterSpan, JsonRecord>();
  const resets = new Map<string, CharacterSpan[]>();
  for (const [root] of getInternalDocumentChangeEntries(change)) {
    const source = valueRootIndex(base, root);
    const target = valueRootIndex(after, root);
    const correspondence = createCharacterCorrespondence(
      base,
      after,
      change,
      root,
      exact,
      carriedLettersOf(carried, root, base, after)
    );
    const spans: TextFormatSpan[] = [];
    const rootResets: CharacterSpan[] = [];
    const visit = (node: JsonNode, path: readonly number[]) => {
      if (isTextNode(node)) return;
      for (let at = 0; at < node.children.length; at += 1) {
        const child = node.children[at];
        if (!isTextNode(child)) {
          visit(child, [...path, at]);
          continue;
        }
        const host = textHostAt(source, [...path, at]);
        let offset = 0;
        for (const leaf of host.leaves) {
          if (!isTextNode(leaf)) continue;
          for (const fragment of correspondence.fragments({
            path: host.path,
            from: offset,
            to: offset + leaf.text.length,
          })) {
            const nextHost = textHostAt(target, fragment.target.path);
            let nextOffset = 0;
            for (
              let nextIndex = 0;
              nextIndex < nextHost.leaves.length;
              nextIndex += 1
            ) {
              const next = nextHost.leaves[nextIndex];
              if (!isTextNode(next)) continue;
              const from = Math.max(fragment.target.from, nextOffset);
              const to = Math.min(
                fragment.target.to,
                nextOffset + next.text.length
              );
              if (from < to) {
                const previous = nodeProps(leaf);
                const props = nodeProps(next);
                const writes: TextKeyWrite[] = [];
                for (const key of new Set([
                  ...Object.keys(previous),
                  ...Object.keys(props),
                ])) {
                  if (jsonEqual(previous[key], props[key])) continue;
                  if (
                    schema.isSetValued(
                      next,
                      key,
                      getDocumentPropertyContext(
                        target,
                        [
                          ...nextHost.path.slice(0, -1),
                          getDefined(nextHost.path.at(-1)) + nextIndex,
                        ],
                        root === 'main' ? null : root
                      )
                    )
                  ) {
                    const beforeMembers: unknown[] = Array.isArray(
                      previous[key]
                    )
                      ? previous[key]
                      : [];
                    const afterMembers: unknown[] = Array.isArray(props[key])
                      ? props[key]
                      : [];
                    writes.push({
                      key,
                      kind: 'members',
                      add: afterMembers.filter(
                        (member) =>
                          !beforeMembers.some((old) => jsonEqual(old, member))
                      ),
                      remove: beforeMembers.filter(
                        (member) =>
                          !afterMembers.some((candidate) =>
                            jsonEqual(candidate, member)
                          )
                      ),
                    });
                  } else {
                    writes.push({
                      key,
                      kind: 'value',
                      expect: previous[key],
                      value: props[key],
                    });
                  }
                }
                if (writes.length > 0) {
                  spans.push({ ...fragment.target, from, to, writes });
                }
                const range = { ...fragment.target, from, to };
                reset.set(range, previous);
                rootResets.push(range);
              }
              nextOffset += next.text.length;
            }
          }
          offset += leaf.text.length;
        }
        at += host.leaves.length - 1;
      }
    };
    for (const [from, to] of source.changedChildren(target)) {
      for (let at = from; at < to; at += 1) {
        const node = source.child(at);
        if (node) visit(node, [at]);
      }
    }
    if (spans.length) format.set(root, spans);
    if (rootResets.length) resets.set(root, rootResets);
  }
  if (format.size === 0) return unformatted();
  const middle = rewriteSpans(after, resets, (span) => reset.get(span) ?? {});
  const carriesRuns = Boolean(carried?.length);
  const aligned = carriesRuns ? alignedDocumentChange(after, middle) : null;
  const resetChange =
    aligned ??
    DocumentChange.between(after, middle, {
      isSetValued: schema.isSetValued,
    });
  for (const [root, spans] of format) {
    const correspondence = createCharacterCorrespondence(
      after,
      middle,
      resetChange,
      root,
      aligned !== null
    );
    format.set(
      root,
      spans.flatMap((span) =>
        correspondence
          .fragments(span)
          .map(({ target }) => ({ ...target, writes: span.writes }))
      )
    );
  }
  if (aligned) {
    const structure = change.compose(aligned);
    const moved = carried?.map((run) => {
      const rootReset = getInternalDocumentRootChange(aligned, run.root);

      return rootReset
        ? mapCarriedRunThrough(run, rootReset, valueRootIndex(after, run.root))
        : run;
    });
    const runs = moved?.every((run) => run !== null)
      ? exactRunsOf(moved, structure, base, middle)
      : undefined;

    return { structure, format, after, ...(runs ? { runs } : {}) };
  }
  // A part keeps its own change as its structure, so no diff of letter values
  // picks which letters it keeps; the diff from `after` only resets marks.
  // Collapsing nets each key to its write from `base`, so a key the reset
  // brought back writes nothing and a teammate's later write to it survives.
  return {
    structure: exact
      ? collapseDocumentElementPropertyWrites(
          change.compose(
            DocumentChange.between(after, middle, {
              isSetValued: schema.isSetValued,
            })
          ),
          base,
          schema.isSetValued,
          { textLeaves: true }
        )
      : DocumentChange.between(base, middle, {
          isSetValued: schema.isSetValued,
        }),
    format,
    after,
  };
};

const applyFormatIntent = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  value: T,
  format: ReadonlyMap<string, readonly TextFormatSpan[]>,
  direction: 'undo' | 'redo'
) => {
  const writes = new Map<CharacterSpan, readonly TextKeyWrite[]>();
  for (const spans of format.values()) {
    for (const span of spans) writes.set(span, span.writes);
  }
  return rewriteSpans(value, format, (span, properties, path, root) => {
    const result = { ...properties };
    const preferred: string[] = [];
    for (const write of writes.get(span) ?? []) {
      if (!schema.allows(write.key, path, root, value)) continue;
      if (write.kind === 'members') {
        const current = result[write.key];
        const members: unknown[] = Array.isArray(current) ? current : [];
        const next = normalizeSetValues([
          ...members.filter(
            (member) =>
              !write.remove.some((removed) => jsonEqual(member, removed))
          ),
          ...write.add,
        ]);
        if (next.length) result[write.key] = next;
        else delete result[write.key];
      } else {
        if (
          direction === 'undo' &&
          !jsonEqual(result[write.key], write.expect)
        ) {
          continue;
        }
        if (write.value === undefined) delete result[write.key];
        else {
          const candidate = { ...result, [write.key]: write.value };
          const canonical = schema.canonicalize(
            candidate,
            path,
            root,
            write.key,
            value
          );
          if (
            direction === 'undo' &&
            Object.keys(result).some(
              (key) => key !== write.key && !Object.hasOwn(canonical, key)
            )
          ) {
            continue;
          }
          result[write.key] = write.value;
          preferred.push(write.key);
        }
      }
    }
    let canonical = result;
    for (const key of preferred) {
      canonical = {
        ...schema.canonicalize(canonical, path, root, key, value),
      };
    }
    return canonical;
  });
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
  { anchor, readBack: reads }: ReplayRules
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
) => {
  const kinds = [
    ...getInternalDocumentChangeClassificationEntries(replay.change),
  ];

  return !replay.exact &&
    !replay.carried &&
    mapping.textOnly &&
    recorded.format.size === 0 &&
    kinds.length > 0 &&
    kinds.every(([, kind]) => kind.text && !kind.properties && !kind.structure)
    ? DocumentChange.between(base, recorded.after)
    : recorded.structure;
};

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

  if (recorded.format.size > 0) return false;

  try {
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
  let middleValue: T | undefined;
  const middleOf = () => (middleValue ??= recorded.structure.apply(base));
  const carry =
    replay.carried && !exact && recorded.runs
      ? carryReplay(
          schema,
          recorded.runs,
          recorded,
          base,
          middleOf(),
          mapping,
          stepRules
        )
      : null;
  const transformed =
    carry ??
    replayOver(
      schema,
      mapping.change,
      replayedStructure(replay, recorded, base, mapping),
      base,
      stepRules
    );
  const { keptWrap } = transformed;
  if (recorded.format.size === 0) {
    const mappedAfter = carry
      ? transformed.b.apply(mapping.after)
      : transformed.a.apply(recorded.after);
    const repair = schema.repairCanonical(
      mapping.after,
      transformed.b,
      mappedAfter
    );
    const change = composeRepair(transformed.b, repair);
    const after = repair.empty ? mappedAfter : repair.apply(mappedAfter);
    const rest = composeRepair(transformed.a, repair);
    const carried =
      carry?.runs &&
      landCarriedRuns(
        carry.runs,
        [{ after, before: mappedAfter, change: repair }],
        { after, before: mapping.after, change }
      );
    const mapped = asReplay(change, () => {
      const runs = exactRunsOf(
        carried ?? undefined,
        change,
        mapping.after,
        after
      );

      return {
        structure: change,
        format: recorded.format,
        after,
        ...(runs ? { runs } : {}),
      };
    });

    return {
      keptWrap,
      replay: { ...mapped, after, ...(carried ? { carried } : {}) },
      rest,
    };
  }
  const middle = middleOf();
  const mappedMiddle = transformed.b.apply(mapping.after);
  const format = new Map<string, TextFormatSpan[]>();
  for (const [root, spans] of recorded.format) {
    const letters = carry?.letters?.root === root ? carry.letters : undefined;
    const correspondence = createCharacterCorrespondence(
      middle,
      mappedMiddle,
      transformed.a,
      root,
      exact,
      letters?.letterAt
    );
    format.set(
      root,
      spans.flatMap((span) =>
        correspondence
          .fragments(span)
          .map(({ target }) => ({ ...target, writes: span.writes }))
      )
    );
  }
  const formatted = applyFormatIntent(
    schema,
    mappedMiddle,
    format,
    replay.direction
  );
  const formatWrites = DocumentChange.between(mappedMiddle, formatted, {
    isSetValued: schema.isSetValued,
  });
  const formattedChange = format.size
    ? transformed.b.compose(formatWrites)
    : transformed.b;
  const repair = schema.repairCanonical(
    mapping.after,
    formattedChange,
    formatted
  );
  const change = composeRepair(formattedChange, repair);
  const after = repair.empty ? formatted : repair.apply(formatted);
  const carried =
    carry?.runs &&
    landCarriedRuns(
      carry.runs,
      [
        { after: formatted, before: mappedMiddle, change: formatWrites },
        { after, before: formatted, change: repair },
      ],
      { after, before: mapping.after, change }
    );
  const formatChange = DocumentChange.between(middle, recorded.after, {
    isSetValued: schema.isSetValued,
  });
  const mapped = transformInternalDocumentChange(
    transformed.a,
    formatChange,
    middle,
    { keepRecordWrites: true }
  ).a;
  const intermediate = mapped.apply(recorded.after);
  const rest = composeRepair(
    mapped.compose(
      DocumentChange.between(intermediate, formatted, {
        isSetValued: schema.isSetValued,
      })
    ),
    repair
  );
  const replayed = asReplay(change, () => {
    const runs = exactRunsOf(
      carry?.runs ?? undefined,
      transformed.b,
      mapping.after,
      mappedMiddle
    );

    return {
      structure: transformed.b,
      format,
      after,
      ...(runs ? { runs } : {}),
    };
  });

  return {
    keptWrap,
    replay: carried ? { ...replayed, carried } : replayed,
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
): Selection => {
  if (!selection || !SelectionApi.isText(selection)) {
    return mapSelectionThroughChange(
      editor,
      selection,
      change,
      before,
      after,
      root
    ).selection;
  }
  const correspondence = createCharacterCorrespondence(
    before,
    after,
    change,
    root,
    exact
  );
  const anchor = correspondence.point(selection.anchor, -1);
  const focus = correspondence.point(selection.focus, -1);
  if (!anchor || !focus) {
    return mapSelectionThroughChange(
      editor,
      selection,
      change,
      before,
      after,
      root
    ).selection;
  }
  return {
    ...selection,
    anchor: { ...selection.anchor, ...anchor },
    focus: { ...selection.focus, ...focus },
  };
};
