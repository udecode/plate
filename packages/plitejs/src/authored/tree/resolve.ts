import type {
  JsonEditorValue,
  JsonNode,
  JsonRecord,
} from '../../core/change/tokens';
import { jsonEqual } from '../../core/change/tokens';
import { getDefined } from '../../internal/get-defined';
import { cutsOf, joinRejectedCuts } from './cuts';
import { decideKey, type FormatTag, type LayerValue } from './layers';
import {
  type AuthoredMark,
  AUTHORED_MARKS_KEY,
  type CutTag,
  readAuthoredMarks,
  withMarksThroughout,
} from './marks';

export type AuthoredOutcome = (
  changeId: string
) => 'accept' | 'keep' | 'reject';

type Completion<N> = Readonly<{
  built: ReadonlyArray<Readonly<{ node: N; slot: number | null }>>;
  children: readonly N[];
}>;

/**
 * The declarative content facts the resolver reads; it runs no plugin code.
 * A `null` type or parent stands for the root being resolved.
 */
export type AuthoredResolveSchema = Readonly<{
  /**
   * Canonical children at their site, the element and its ancestors nearest
   * first or none at the root, as Editing's completion gives them, and each
   * element it built; `vacated` names the prefix slots a decision emptied.
   */
  complete?: (
    children: readonly JsonNode[],
    site: readonly JsonRecord[],
    root: string,
    vacated: (slot: number, candidate: JsonNode) => boolean
  ) => Completion<JsonNode>;
  content: (
    type: string | null,
    root: string
  ) => Readonly<{ allowsText: boolean; prefix: number }> | null;
}>;

/**
 * A container whose children a decision removed, merged, unwrapped or pulled
 * apart. The pure resolver runs no plugin corrections, so values a correction
 * derives from those children, such as column widths, are not recomputed.
 */
export type AuthoredProjectionDiagnostic = Readonly<{
  code: 'authored-uncorrected';
  path: readonly number[];
  type: string | null;
}>;

export type AuthoredResolution = Readonly<{
  /** Pending changes the decision waits on, which must be decided with it. */
  blockers: readonly string[];
  children: readonly JsonNode[];
  decided: readonly string[];
  diagnostics: readonly AuthoredProjectionDiagnostic[];
  /**
   * The node an original node became in the resolved tree, or null when a
   * decision removed it or merged it into the block before it, the canonical
   * form merged a text with its neighbour, or the canonical pass after
   * completion rewrote it.
   */
  resolvedOf: (original: unknown) => JsonNode | null;
  /**
   * Content no level of the schema accepts, such as text an unwrap leaves
   * among blocks.
   */
  unplaceable: boolean;
}>;

type Node = JsonRecord & { children?: readonly Node[]; text?: string };

const isText = (node: Node) => typeof node.text === 'string';

const isInserted = (node: unknown) =>
  readAuthoredMarks(node).some((mark) => mark.kind === 'insert');

/** The review children of a level that hold its prefix slots at the start. */
const startOccupants = <N>(level: readonly N[]) =>
  level.filter((node) => !isInserted(node));

/**
 * Whether a decision vacates prefix slot `slot` when `original`, as the
 * review tree holds it, is the slot's candidate: neither the slot's start
 * occupant nor an inserted node, so the decision builds a fresh element there
 * as Editing does and never promotes a later sibling.
 */
const vacatesSlot = (
  start: readonly unknown[],
  slot: number,
  original: unknown
) => original !== start[slot] && !isInserted(original);

/** An element holding texts; one with no children holds no blocks, so it counts. */
export const isTextBlock = (node: unknown) => {
  const { children, text } = (node ?? {}) as Node;

  return (
    typeof text !== 'string' &&
    !!children &&
    (children.length === 0 || children.some(isText))
  );
};

const typeOf = (node: Node) =>
  typeof node.type === 'string' ? node.type : null;

/**
 * Whether a node survives once `settled` says which nodes its decided marks
 * remove: a removed element survives while anything inside it does.
 */
export const survivalUnder = (settled: (node: Node) => boolean) => {
  const memo = new WeakMap<Node, boolean>();
  const survives = (node: Node): boolean => {
    let value = memo.get(node);

    if (value === undefined) {
      value = isText(node)
        ? !settled(node)
        : !settled(node) || (node.children ?? []).some(liveContent);
      memo.set(node, value);
    }

    return value;
  };
  const liveContent = (node: Node): boolean =>
    isText(node) ? !settled(node) && node.text !== '' : survives(node);

  return { liveContent, survives };
};

const withMarks = (node: Node, marks: readonly AuthoredMark[]): Node => {
  const { [AUTHORED_MARKS_KEY]: _marks, ...rest } = node;

  return marks.length > 0 ? { ...rest, [AUTHORED_MARKS_KEY]: marks } : rest;
};

const propsOf = (node: Node) => {
  const { children: _children, text: _text, ...props } = node;

  return props;
};

const removes = (mark: AuthoredMark, result: 'accept' | 'keep' | 'reject') =>
  (mark.kind === 'insert' && result === 'reject') ||
  (mark.kind === 'delete' && result === 'accept');

/**
 * The only implementation of accept and reject. Phase one finds, against the
 * input document, where each accepted join or rejected split lands: it merges
 * its block into the nearest preceding text block the decision keeps, never
 * leaving a container the decision keeps. Phase two rebuilds the document:
 * text goes when one of its insert marks is rejected or one of its delete
 * marks is accepted, a block goes when its own mark says so and nothing
 * inside it survives, and an accepted unwrap or rejected wrap lifts the
 * block's children. Decided format marks keep or restore their values.
 * Undecided marks stay.
 */
export const resolveAuthoredChildren = (
  children: readonly JsonNode[],
  outcome: AuthoredOutcome,
  schema: AuthoredResolveSchema | null = null,
  root = 'main'
): AuthoredResolution => {
  const contentOf = (type: string | null) =>
    schema?.content(type, root) ?? null;
  // Without a schema, a text block a decision empties keeps an empty text.
  const complete = (
    nodes: readonly Node[],
    site: readonly Node[],
    startLevel: readonly Node[],
    vacated: (slot: number, candidate: Node) => boolean
  ) =>
    schema?.complete
      ? (schema.complete(
          nodes as readonly JsonNode[],
          site,
          root,
          vacated
        ) as Completion<Node>)
      : {
          built: [],
          children:
            nodes.length === 0 && site.length > 0 && startLevel.some(isText)
              ? [{ text: '' }]
              : mergeTextsWithEqualProps(nodes),
        };
  const decided = new Set<string>();
  const waits = new Set<string>();
  const diagnostics: AuthoredProjectionDiagnostic[] = [];
  const origins = new Map<object, object>();
  // Elements whose children or properties a decision changed, which the
  // completion pass brings to canonical form, and for each element on the way
  // to one, the indexes of its children that lead there.
  const touched = new WeakSet<Node>();
  const dirtyChildren = new WeakMap<Node, readonly number[]>();
  let unplaceable = false;
  const resultOf = (mark: AuthoredMark) => {
    const result = outcome(mark.change);

    if (result !== 'keep') decided.add(mark.change);

    return result;
  };
  const wait = (marks: readonly AuthoredMark[]) => {
    for (const mark of marks) {
      if (outcome(mark.change) === 'keep') waits.add(mark.change);
    }
  };
  const waitOnSubtree = (node: Node) => {
    wait(readAuthoredMarks(node));
    for (const child of node.children ?? []) waitOnSubtree(child);
  };
  const track = <T extends Node>(node: T, original: object | undefined) => {
    if (original) origins.set(node, original);

    return node;
  };

  const settledMemo = new WeakMap<Node, boolean>();
  const settled = (node: Node) => {
    let value = settledMemo.get(node);

    if (value === undefined) {
      value = readAuthoredMarks(node).some((mark) =>
        removes(mark, resultOf(mark))
      );
      settledMemo.set(node, value);
    }

    return value;
  };
  const { liveContent, survives } = survivalUnder(settled);
  // Insert and delete marks of content the decision leaves standing, whose
  // own decisions say whether it stays.
  const contentMarksIn = (node: Node): AuthoredMark[] => [
    ...(settled(node)
      ? []
      : readAuthoredMarks(node).filter(
          (mark) => mark.kind === 'insert' || mark.kind === 'delete'
        )),
    ...(node.children ?? []).flatMap(contentMarksIn),
  ];
  const structureOf = (node: Node) => {
    let join = false;
    let unwrap = false;

    for (const mark of readAuthoredMarks(node)) {
      const result = resultOf(mark);

      if (
        (mark.kind === 'join' && result === 'accept') ||
        (mark.kind === 'split' && result === 'reject')
      ) {
        join = true;
      }
      if (
        (mark.kind === 'unwrap' && result === 'accept') ||
        (mark.kind === 'wrap' && result === 'reject')
      ) {
        unwrap = true;
      }
    }

    return { join, unwrap };
  };

  const blocks: Array<Readonly<{ ancestors: readonly Node[]; node: Node }>> =
    [];
  const collect = (nodes: readonly Node[], ancestors: readonly Node[]) => {
    for (const node of nodes) {
      if (isText(node)) continue;
      if (isTextBlock(node)) blocks.push({ ancestors, node });
      else collect(node.children ?? [], [...ancestors, node]);
    }
  };

  collect(children, []);

  // Phase one: where each decided join lands.
  const mergedInto = new Map<Node, Node>();
  const mergedBlocks = new Map<Node, Node[]>();
  const emptiedTargets = new Set<Node>();
  const finalOf = (node: Node) => {
    let current = node;

    for (
      let next = mergedInto.get(current);
      next;
      next = mergedInto.get(current)
    ) {
      current = next;
    }

    return current;
  };
  const keepsContent = (target: Node) =>
    (target.children ?? []).some(liveContent) ||
    (mergedBlocks.get(target) ?? []).some((block) =>
      (block.children ?? []).some(liveContent)
    );

  blocks.forEach(({ ancestors, node }, index) => {
    if (!structureOf(node).join) return;
    // A join on a block the decision removes has nothing to merge, so the
    // block's pending content decides with the join.
    wait(contentMarksIn(node));
    if (!survives(node)) return;

    const boundary =
      [...ancestors]
        .reverse()
        .find(
          (ancestor) => survives(ancestor) && !structureOf(ancestor).unwrap
        ) ?? null;
    let target: Node | null = null;

    for (let previous = index - 1; previous >= 0; previous -= 1) {
      const candidate = blocks[previous];

      if (boundary && !candidate.ancestors.includes(boundary)) {
        // Unwrapping the boundary would let the join reach further, so its
        // pending enclosure decides with the join.
        wait(
          readAuthoredMarks(boundary).filter(
            (mark) => mark.kind === 'unwrap' || mark.kind === 'wrap'
          )
        );
        break;
      }
      if (emptiedTargets.has(candidate.node) || !survives(candidate.node)) {
        continue;
      }
      target = finalOf(candidate.node);
      break;
    }
    // With no block to merge into, the join drops and its block stays.
    if (!target) return;
    // Whether the target keeps content, and so which block survives the
    // merge, depends on its pending content and enclosure.
    wait([
      ...readAuthoredMarks(target).filter((mark) =>
        CONTENT_AND_ENCLOSURE_KINDS.has(mark.kind)
      ),
      ...(target.children ?? []).flatMap(contentMarksIn),
    ]);
    // A block that structure removes takes its pending marks with it, so
    // they decide with the join.
    if (!keepsContent(target)) {
      // As Editing's merge does, an empty target goes and the joining block
      // keeps its own type and properties.
      emptiedTargets.add(target);
      waitOnSubtree(target);
      return;
    }
    mergedInto.set(node, target);
    mergedBlocks.set(target, [...(mergedBlocks.get(target) ?? []), node]);
    wait(readAuthoredMarks(node));
  });

  // A pending join waits on a decision that removes the block it would join.
  blocks.forEach(({ ancestors, node }, index) => {
    const joins = readAuthoredMarks(node).filter(
      (mark) => mark.kind === 'join' && outcome(mark.change) === 'keep'
    );

    if (joins.length === 0) return;

    const container = ancestors.at(-1);
    const candidate = blocks[index - 1];
    const previous =
      candidate && (!container || candidate.ancestors.includes(container))
        ? candidate.node
        : null;

    if (
      previous &&
      (!survives(previous) ||
        mergedInto.has(previous) ||
        emptiedTargets.has(previous))
    ) {
      wait(joins);
    }
  });

  // A rejected cut joins only fragments that end up in one block, so a
  // pending boundary between its fragments' blocks decides with it.
  const cutSides = new Map<
    string,
    { end?: number; endNode?: Node; start?: number; tag: CutTag }
  >();
  const collectCuts = (nodes: readonly Node[], index: number) => {
    for (const child of nodes) {
      for (const cut of cutsOf(child)) {
        const sides = cutSides.get(cut.cut) ?? { tag: cut };

        sides[cut.side] = index;
        if (cut.side === 'end') sides.endNode = child;
        cutSides.set(cut.cut, sides);
      }
      if (child.children) collectCuts(child.children, index);
    }
  };

  blocks.forEach(({ node }, index) => collectCuts(node.children ?? [], index));
  const joinsCuts = [...cutSides.values()].some(
    ({ tag }) => outcome(tag.change) === 'reject'
  );

  for (const { end, start, tag } of cutSides.values()) {
    if (
      end === undefined ||
      start === undefined ||
      end >= start ||
      outcome(tag.change) !== 'reject' ||
      finalOf(getDefined(blocks[start]).node) ===
        finalOf(getDefined(blocks[end]).node)
    ) {
      continue;
    }
    for (let index = end + 1; index <= start; index += 1) {
      wait(
        readAuthoredMarks(getDefined(blocks[index]).node).filter(
          (mark) => mark.kind === 'join' || mark.kind === 'split'
        )
      );
    }
  }

  // Phase two: rebuild the document with decided content removed.
  const resolveList = (
    input: readonly Node[],
    parentType: string | null,
    path: readonly number[]
  ): Readonly<{ changed: boolean; dirty: number[]; list: Node[] }> => {
    const out: Node[] = [];
    const dirty: number[] = [];
    const { joined, nodes } = joinsCuts
      ? joinRejectedCuts(input, {
          endSurvives: (cut) => {
            const end = cutSides.get(cut)?.endNode;

            return end !== undefined && survives(end);
          },
          rejected: (cut) => resultOf(cut) === 'reject',
          survives,
          wait,
        })
      : { joined: new Map<Node, Node>(), nodes: input };
    let restructured = joined.size > 0;
    let changed = false;

    for (const [index, node] of nodes.entries()) {
      const marks = readAuthoredMarks(node);
      const original = joined.get(node) ?? node;

      if (mergedInto.has(node) || emptiedTargets.has(node)) {
        restructured = true;
        continue;
      }
      // Deciding a block's own removal decides with the content pending
      // inside it, which keeps the block or lets it go.
      if (!isText(node) && settled(node)) {
        wait((node.children ?? []).flatMap(contentMarksIn));
      }
      if (settled(node) && !survives(node)) {
        // Its pending cuts would have nothing to join, so they decide with it.
        wait(cutsOf(node));
        restructured = true;
        continue;
      }

      const props = propsOf(node);
      const formats = decideFormats(props, marks, outcome);

      for (const change of formats?.waits ?? []) waits.add(change);

      const formatted = {
        kept: marks.filter((mark) => {
          const result = resultOf(mark);

          return mark.kind === 'format'
            ? formats?.kept.has(mark)
            : result === 'keep';
        }),
        props: formats?.props ?? props,
      };
      const selfChanged =
        (formats?.changed ?? false) || formatted.kept.length !== marks.length;

      if (selfChanged) changed = true;
      if (isText(node)) {
        out.push(
          track(
            withMarks({ ...formatted.props, text: node.text }, formatted.kept),
            original
          )
        );
        continue;
      }
      // A rejected type change restores the type the children are judged by.
      const type = typeOf(formatted.props);
      const merged = mergedBlocks.get(node) ?? [];
      const {
        changed: childrenChanged,
        dirty: childDirty,
        list: resolved,
      } = resolveList(
        [
          ...(node.children ?? []),
          ...merged.flatMap((block) => block.children ?? []),
        ],
        type,
        [...path, index]
      );
      const element = withMarks(
        { ...formatted.props, children: resolved },
        formatted.kept
      );

      if (structureOf(node).unwrap) {
        restructured = true;
        if (
          resolved.some(isText) &&
          contentOf(parentType)?.allowsText === false
        ) {
          unplaceable = true;
        }
        wait(formatted.kept);
        // Unwrapping moves the join boundary of the block's first child and
        // of the block after it.
        wait(
          [resolved[0], nodes[index + 1]].flatMap((item) =>
            readAuthoredMarks(item).filter(
              (mark) => mark.kind === 'join' || mark.kind === 'split'
            )
          )
        );
        for (const at of childDirty) dirty.push(out.length + at);
        out.push(...resolved);
        continue;
      }

      const emptied = resolved.length === 0 && (node.children ?? []).length > 0;

      // A block a decision empties stays, as it does in Editing, so its own
      // pending marks decide with that decision.
      if (emptied) {
        wait(formatted.kept);
        restructured = true;
      }
      out.push(track(element, original));
      if (
        childrenChanged ||
        selfChanged ||
        merged.length > 0 ||
        original !== node
      ) {
        touched.add(element);
      }
      if (touched.has(element) || childDirty.length > 0) {
        dirty.push(out.length - 1);
        dirtyChildren.set(element, childDirty);
      }
    }

    if (restructured) {
      diagnostics.push({
        code: 'authored-uncorrected',
        path,
        type: parentType,
      });
    }

    return { changed: changed || restructured, dirty, list: out };
  };

  const STRUCTURE_KINDS: ReadonlySet<AuthoredMark['kind']> = new Set([
    'join',
    'split',
    'unwrap',
    'wrap',
  ]);
  // A decision that builds waits on every pending change whose outcome
  // changes what it builds. A built element's properties can read any
  // ancestor, so it waits on each ancestor's pending restructuring.
  const waitOnBuild = (level: readonly Node[], site: readonly Node[]) => {
    const [parent, ...ancestors] = site;

    // The element's type picks the content its completion builds for.
    wait(
      readAuthoredMarks(parent).filter(
        (mark) =>
          STRUCTURE_KINDS.has(mark.kind) ||
          mark.kind === 'delete' ||
          (mark.kind === 'format' && mark.key === 'type')
      )
    );
    for (const child of level) {
      wait(
        readAuthoredMarks(child).filter((mark) =>
          STRUCTURE_KINDS.has(mark.kind)
        )
      );
    }
    for (const ancestor of ancestors) {
      wait(
        readAuthoredMarks(ancestor).filter((mark) =>
          STRUCTURE_KINDS.has(mark.kind)
        )
      );
    }
  };
  // A pending insertion between a prefix slot and the slot's start occupant
  // decides what fills the slot, so the decision waits on it when the slots
  // differ with it rejected.
  const waitOnPrefix = (
    level: readonly Node[],
    completed: Completion<Node>,
    start: readonly Node[],
    completeHere: (nodes: readonly Node[]) => Completion<Node>,
    slots: number
  ) => {
    const occupied = level.findIndex((node) =>
      start.includes((origins.get(node) ?? node) as Node)
    );
    const front = new Set(
      level.slice(0, (occupied === -1 ? level.length : occupied) + slots)
    );
    const pending = [...front].flatMap((node) =>
      readAuthoredMarks(node).filter((mark) => mark.kind === 'insert')
    );

    if (pending.length === 0) return;

    const without = completeHere(
      level.filter(
        (node) =>
          !front.has(node) ||
          !readAuthoredMarks(node).some((mark) => mark.kind === 'insert')
      )
    );
    const head = ({ built, children: nodes }: Completion<Node>) =>
      nodes
        .slice(0, slots)
        .map(
          (node) =>
            `${built.some((item) => item.node === node) ? '+' : ''}${typeOf(
              node
            )}`
        )
        .join(',');

    if (head(completed) !== head(without)) {
      wait(pending);
    }
  };
  // An element built inside pending insertions is part of them, as the
  // recorder's fills are, so rejecting any of them removes it.
  const underInsertions = (
    completion: Completion<Node>,
    site: readonly Node[]
  ): Completion<Node> => {
    const marks = site.flatMap((node) =>
      readAuthoredMarks(node).filter((mark) => mark.kind === 'insert')
    );

    if (marks.length === 0 || completion.built.length === 0) return completion;

    const marked = new Map(
      completion.built.map(({ node }) => [
        node,
        withMarksThroughout(node as JsonNode, marks) as Node,
      ])
    );

    return {
      built: completion.built.map((item) => ({
        ...item,
        node: getDefined(marked.get(item.node)),
      })),
      children: completion.children.map((node) => marked.get(node) ?? node),
    };
  };
  // Each element at its final placement, children first.
  const completeLevel = (
    level: readonly Node[],
    site: readonly Node[],
    startLevel: readonly Node[],
    changed: boolean,
    dirty: readonly number[]
  ): readonly Node[] => {
    let copy: Node[] | null = null;

    for (const index of dirty) {
      const node = getDefined(level[index]);
      const original = origins.get(node) as Node | undefined;
      const completed = completeLevel(
        node.children ?? [],
        [node, ...site],
        original?.children ?? [],
        touched.has(node),
        dirtyChildren.get(node) ?? []
      );

      if (completed === node.children) continue;
      copy ??= [...level];
      copy[index] = track({ ...node, children: completed }, original);
    }

    const nodes = copy ?? level;

    if (!changed) return nodes;

    const start = startOccupants(startLevel);
    const completeHere = (items: readonly Node[]) =>
      complete(items, site, startLevel, (slot, candidate) =>
        vacatesSlot(start, slot, origins.get(candidate) ?? candidate)
      );
    const completion = underInsertions(completeHere(nodes), site);
    const slots = contentOf(site[0] ? typeOf(site[0]) : null)?.prefix ?? 0;

    if (completion.built.length > 0) {
      waitOnBuild(nodes, site);
    }
    if (slots > 0) {
      waitOnPrefix(nodes, completion, start, completeHere, slots);
    }

    return completion.children;
  };

  const top = resolveList(children, null, []);
  const resolvedChildren = completeLevel(
    top.list,
    [],
    children,
    top.changed,
    top.dirty
  );
  // Indexed from the final tree, so a node a later merge replaced is not
  // reported.
  let resolvedNodes: Map<object, Node> | null = null;
  const indexResolved = (index: Map<object, Node>, nodes: readonly Node[]) => {
    for (const node of nodes) {
      const original = origins.get(node);

      if (original && !index.has(original)) index.set(original, node);
      indexResolved(index, node.children ?? []);
    }

    return index;
  };

  return {
    blockers: [...waits],
    children: resolvedChildren as readonly JsonNode[],
    decided: [...decided],
    diagnostics,
    resolvedOf: (original) => {
      if (typeof original !== 'object' || original === null) return null;

      resolvedNodes ??= indexResolved(new Map(), resolvedChildren);

      return (resolvedNodes.get(original) as JsonNode | undefined) ?? null;
    },
    unplaceable,
  };
};

const CONTENT_AND_ENCLOSURE_KINDS: ReadonlySet<AuthoredMark['kind']> = new Set([
  'delete',
  'insert',
  'unwrap',
  'wrap',
]);

/**
 * Each key's format tags decided by `decideKey`, or null for a node with no
 * format tag. A key that waits keeps its value and tags; its waits block the
 * whole decision.
 */
const decideFormats = (
  props: JsonRecord,
  marks: readonly AuthoredMark[],
  outcome: AuthoredOutcome
) => {
  if (!marks.some((mark) => mark.kind === 'format')) return null;

  const kept = new Set<AuthoredMark>();
  const waits: string[] = [];
  const keys = new Set(
    marks.flatMap((mark) => (mark.kind === 'format' ? [mark.key] : []))
  );
  const next: JsonRecord = { ...props };
  let changed = false;

  for (const key of keys) {
    const decision = decideKey(
      props[key] as LayerValue,
      marks.filter(
        (mark): mark is FormatTag => mark.kind === 'format' && mark.key === key
      ),
      outcome
    );

    waits.push(...decision.waits);
    for (const tag of decision.kept) kept.add(tag);
    if (decision.value.kind !== 'set') continue;
    changed = true;
    if (decision.value.value === undefined) delete next[key];
    else next[key] = decision.value.value;
  }

  return { changed, kept, props: next, waits };
};

const mergeTextsWithEqualProps = (nodes: readonly Node[]): Node[] => {
  const out: Node[] = [];

  for (const node of nodes) {
    const previous = out.at(-1);

    if (
      previous &&
      isText(previous) &&
      isText(node) &&
      jsonEqual(propsOf(previous), propsOf(node))
    ) {
      out[out.length - 1] = {
        ...previous,
        text: `${previous.text}${node.text}`,
      };
      continue;
    }
    out.push(node);
  }

  return out;
};

export const resolveAuthoredValue = (
  value: JsonEditorValue,
  outcome: AuthoredOutcome,
  schema: AuthoredResolveSchema | null = null
) => {
  const main = resolveAuthoredChildren(value.children, outcome, schema);
  const roots = Object.entries(value.roots ?? {}).map(
    ([root, children]) =>
      [root, resolveAuthoredChildren(children, outcome, schema, root)] as const
  );
  const all = [main, ...roots.map(([, resolution]) => resolution)];

  return {
    blockers: [...new Set(all.flatMap((resolution) => resolution.blockers))],
    decided: [...new Set(all.flatMap((resolution) => resolution.decided))],
    diagnostics: all.flatMap((resolution) => resolution.diagnostics),
    resolvedOf: (original: unknown) =>
      all.reduce<JsonNode | null>(
        (found, resolution) => found ?? resolution.resolvedOf(original),
        null
      ),
    unplaceable: all.some((resolution) => resolution.unplaceable),
    value: {
      ...value,
      children: main.children,
      ...(value.roots
        ? {
            roots: Object.fromEntries(
              roots.map(([root, resolution]) => [root, resolution.children])
            ),
          }
        : {}),
    } as JsonEditorValue,
  };
};

/**
 * `proposed` reads the document with every pending change accepted;
 * `accepted` reads it with every pending change rejected.
 */
export const projectAuthoredValue = (
  value: JsonEditorValue,
  projection: 'accepted' | 'proposed',
  schema: AuthoredResolveSchema | null = null
) =>
  resolveAuthoredValue(
    value,
    () => (projection === 'proposed' ? 'accept' : 'reject'),
    schema
  );

/**
 * Read nodes of the document as one projection reads them: the whole document
 * is projected first, so a node under a struck ancestor is not read as live.
 * A node a decision removed or merged into the block before it, a text the
 * canonical form merged with its neighbour, or a node the canonical pass after
 * completion rewrote reads as `null`.
 */
export const projectAuthoredFragment = (
  value: JsonEditorValue,
  projection: 'accepted' | 'proposed',
  paths: ReadonlyArray<readonly number[]>,
  schema: AuthoredResolveSchema | null = null
) => {
  const resolution = projectAuthoredValue(value, projection, schema);

  return paths.map((path) => {
    let node: unknown = { children: value.children };

    for (const index of path) {
      node = (node as { children?: readonly unknown[] }).children?.[index];
    }

    return resolution.resolvedOf(node);
  });
};
