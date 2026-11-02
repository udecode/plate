import { classifyDocumentChange } from '../core/change/builder';
import {
  type CarriedProjection,
  projectCarriedStep,
  touchesCarriedRuns,
} from '../core/change/carried-projection';
import {
  type CarriedRun,
  carriesRun,
  mapCarriedRunThrough,
} from '../core/change/carried-run';
import {
  DocumentChange,
  collapseDocumentElementPropertyWrites,
  createInternalDocumentChange,
  getInternalDocumentChangeClassificationEntries,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRecords,
  getInternalDocumentRootChange,
  transformInternalDocumentChange,
  valueRootIndex,
  withInternalDocumentRootChange,
} from '../core/change/document-change';
import type { NodeList } from '../core/change/document-index';
import { jsonEqual, type JsonRecord } from '../core/change/json';
import {
  RootChange,
  getDocumentPropertyContext,
} from '../core/change/root-change';
import {
  isTextNode,
  nodeProps,
  PreparedTokenSlice,
  type JsonEditorValue,
  type JsonNode,
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
    record: () => RecordedHistoryReplay<T>;
  }>;

/** A two-part step's take-back and rest, each from the document before it. */
export type HistoryReplayParts = Readonly<{
  rest: DocumentChange;
  unsettle: DocumentChange;
}>;

export const historyReplaySchemaOf = (editor: AnyEditor) => {
  const schema = getEditorSchema(editor);
  return {
    canonicalize: schema.canonicalizeTextPropertiesAt,
    allows: schema.isTextPropertyAllowedAt,
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

/** `step` replayed over `edit`, both from `base`. */
const replayOver = (
  schema: HistoryReplaySchema,
  edit: DocumentChange,
  step: DocumentChange,
  base: JsonEditorValue
) =>
  transformInternalDocumentChange(edit, step, base, {
    replay: {
      pieceProps: (element, parent, root, nodes) =>
        schema.pieceProps(element, [...parent, 0], root, nodes),
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
    carried,
    parts,
  }: Readonly<{
    carried?: readonly CarriedRun[];
    parts?: HistoryReplayParts;
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

  return {
    change,
    ...(carried?.length ? { carried } : {}),
    direction,
    record: () => (recorded ??= recordReplay(schema, base, change)),
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

const recordReplay = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  base: T,
  change: DocumentChange,
  exact = false
): RecordedHistoryReplay<T> => {
  const after = change.apply(base);
  const format = new Map<string, TextFormatSpan[]>();
  const classifications = [
    ...getInternalDocumentChangeClassificationEntries(change),
  ];
  if (
    change.empty ||
    (classifications.length > 0 &&
      classifications.every(
        ([, kind]) => kind.text && !kind.properties && !kind.structure
      ))
  ) {
    return { structure: change, format, after };
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
      exact
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
  if (format.size === 0) {
    return { structure: change, format, after };
  }
  const middle = rewriteSpans(after, resets, (span) => reset.get(span) ?? {});
  const resetChange = DocumentChange.between(after, middle, {
    isSetValued: schema.isSetValued,
  });
  for (const [root, spans] of format) {
    const correspondence = createCharacterCorrespondence(
      after,
      middle,
      resetChange,
      root
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
      if (!schema.allows(write.key, path, root)) continue;
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
            write.key
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
      canonical = { ...schema.canonicalize(canonical, path, root, key) };
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
}>;

/**
 * Map a step that carries runs through an outside edit: by content when the
 * edit touches a run, and by position otherwise or when the projection finds
 * no place, which drops the runs and counts the fallback.
 */
const carryReplay = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  runs: readonly CarriedRun[],
  recorded: RecordedHistoryReplay<T>,
  base: T,
  mapping: HistoryMapping<T>
): CarriedMapping => {
  const ordinary = () =>
    replayOver(schema, mapping.change, recorded.structure, base);
  const { root } = runs[0];
  const step = getInternalDocumentRootChange(recorded.structure, root);
  const edit = getInternalDocumentRootChange(mapping.change, root);

  if (!step || runs.some((run) => run.root !== root)) {
    return { ...ordinary(), runs: null };
  }
  if (!edit) return { ...ordinary(), runs };

  const input = {
    after: valueRootIndex(recorded.after, root),
    before: valueRootIndex(base, root),
    edit,
    edited: valueRootIndex(mapping.after, root),
    root,
    runs,
    schema: schema.lines,
    step,
  };
  let projected: CarriedProjection | null;

  try {
    projected = touchesCarriedRuns(input) ? projectCarriedStep(input) : null;
  } catch {
    // Counted only once the ordinary map works, since a step no map can
    // place is dropped and counted there.
    const fallback = ordinary();

    countCoreWork('carriedFallbacks');

    return { ...fallback, runs: null };
  }

  if (!projected) {
    const mapped = ordinary();
    const rest = getInternalDocumentRootChange(mapped.a, root);

    return {
      ...mapped,
      runs: runs.flatMap((run) => {
        const source = edit.mapPos(run.source, 1);
        const at = rest ? rest.mapPos(run.at, 1) : run.at;

        return source === null || at === null ? [] : [{ ...run, at, source }];
      }),
    };
  }
  if (holdsOnly(mapping.change, root) && holdsOnly(recorded.structure, root)) {
    return {
      a: createInternalDocumentChange(new Map([[root, projected.rest]])),
      b: createInternalDocumentChange(new Map([[root, projected.step]])),
      runs: projected.runs,
    };
  }

  const mapped = ordinary();

  return {
    a: withInternalDocumentRootChange(mapped.a, root, projected.rest),
    b: withInternalDocumentRootChange(mapped.b, root, projected.step),
    runs: projected.runs,
  };
};

/** Whether `change` changes nothing but `root`'s tokens. */
const holdsOnly = (change: DocumentChange, root: string) =>
  change.createRoots.size === 0 &&
  change.deleteRoots.size === 0 &&
  getInternalDocumentChangeRecords(change).size === 0 &&
  [...getInternalDocumentChangeEntries(change)].every(([key]) => key === root);

/**
 * The runs `change` carries from `before` to `after`, each moved through the
 * canonical repair; undefined when none is left.
 */
const landRuns = (
  runs: readonly CarriedRun[],
  repair: DocumentChange,
  change: DocumentChange,
  before: JsonEditorValue,
  after: JsonEditorValue
) => {
  const landed = runs.flatMap((run) => {
    const repairRoot = getInternalDocumentRootChange(repair, run.root);
    const moved = repairRoot ? mapCarriedRunThrough(run, repairRoot) : run;
    const stepRoot = getInternalDocumentRootChange(change, run.root);

    return moved &&
      stepRoot &&
      carriesRun(
        stepRoot,
        valueRootIndex(before, run.root),
        valueRootIndex(after, run.root),
        moved
      )
      ? [moved]
      : [];
  });

  return landed.length > 0 ? landed : undefined;
};

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
  mapping: HistoryMapping<T>
): Readonly<{ replay: HistoryReplay<T>; rest: DocumentChange }> => {
  if (!replay.parts) return mapOneReplay(schema, replay, base, mapping);

  const unsettle = mapOneReplay(schema, replay.parts.unsettle, base, mapping);
  const rest = mapOneReplay(
    schema,
    replay.parts.rest,
    replay.parts.unsettle.record().after,
    {
      after: unsettle.replay.record().after,
      change: unsettle.rest,
      textOnly: false,
    }
  );

  return {
    replay: pairedReplay(
      unsettle.replay.change.compose(rest.replay.change),
      replay.direction,
      unsettle.replay,
      rest.replay
    ),
    rest: rest.rest,
  };
};

const mapOneReplay = <T extends JsonEditorValue>(
  schema: HistoryReplaySchema,
  replay: HistoryReplay<T>,
  base: T,
  mapping: HistoryMapping<T>
): Readonly<{ replay: HistoryReplay<T>; rest: DocumentChange }> => {
  const { exact } = replay;
  const asReplay = (
    change: DocumentChange,
    record: () => RecordedHistoryReplay<T>
  ): HistoryReplay<T> => {
    if (!exact) return { change, direction: replay.direction, record };

    const part = classifyDocumentChange(mapping.after, record().after, change);

    return { change: part, direction: replay.direction, exact, record };
  };
  const recorded = replay.record();
  const middle = recorded.structure.apply(base);
  const textOnly = [
    ...getInternalDocumentChangeClassificationEntries(replay.change),
  ];
  const carry =
    replay.carried && !exact && recorded.format.size === 0
      ? carryReplay(schema, replay.carried, recorded, base, mapping)
      : null;
  const structure =
    !exact &&
    !replay.carried &&
    mapping.textOnly &&
    recorded.format.size === 0 &&
    textOnly.length > 0 &&
    textOnly.every(
      ([, kind]) => kind.text && !kind.properties && !kind.structure
    )
      ? DocumentChange.between(base, recorded.after)
      : recorded.structure;
  const transformed =
    carry ?? replayOver(schema, mapping.change, structure, base);
  const mappedMiddle = transformed.b.apply(mapping.after);
  if (recorded.format.size === 0) {
    const mappedAfter = carry
      ? mappedMiddle
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
      carry?.runs && landRuns(carry.runs, repair, change, mapping.after, after);
    const mapped = asReplay(change, () => ({
      structure: change,
      format: recorded.format,
      after,
    }));

    return {
      replay: carried ? { ...mapped, carried } : mapped,
      rest,
    };
  }
  const format = new Map<string, TextFormatSpan[]>();
  for (const [root, spans] of recorded.format) {
    const correspondence = createCharacterCorrespondence(
      middle,
      mappedMiddle,
      transformed.a,
      root,
      exact
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
  const formattedChange = format.size
    ? transformed.b.compose(
        DocumentChange.between(mappedMiddle, formatted, {
          isSetValued: schema.isSetValued,
        })
      )
    : transformed.b;
  const repair = schema.repairCanonical(
    mapping.after,
    formattedChange,
    formatted
  );
  const change = composeRepair(formattedChange, repair);
  const after = repair.empty ? formatted : repair.apply(formatted);
  const formatChange = DocumentChange.between(middle, recorded.after, {
    isSetValued: schema.isSetValued,
  });
  const mapped = DocumentChange.transform(
    transformed.a,
    formatChange,
    middle
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
  return {
    replay: asReplay(change, () => ({
      structure: transformed.b,
      format,
      after,
    })),
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
    );
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
    );
  }
  return {
    ...selection,
    anchor: { ...selection.anchor, ...anchor },
    focus: { ...selection.focus, ...focus },
  };
};
