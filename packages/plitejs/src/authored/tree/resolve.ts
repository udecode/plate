import type { AuthoredProjectionDiagnostic } from '../../core/authored-document-capability';
import type { NodeList } from '../../core/change/document-index';
import type { JsonRecord } from '../../core/change/json';
import { jsonEqual } from '../../core/change/json';
import type { JsonEditorValue, JsonNode } from '../../core/change/tokens';
import { deriveValue } from '../../core/record-store';
import type { RootPart } from '../../core/representation';
import { survivalUnder } from '../../core/survival';
import { type Path, PathApi } from '../../interfaces/path';
import { getDefined } from '../../internal/get-defined';
import { createDependencies, type Dependencies } from '../facts/dependencies';
import { isEditingChange } from '../facts/editing';
import {
  factsOf,
  isAccepted,
  NO_FACTS,
  type ReviewFacts,
  standingClaimsOf,
} from '../facts/facts';
import { incarnationOf, putContexts } from '../facts/records';
import { cutsOf, joinRejectedCuts } from './cuts';
import {
  decideKey,
  type FormatTag,
  type LayerOutcome,
  type LayerValue,
} from './layers';
import {
  type AuthoredMark,
  type AuthoredMember,
  AUTHORED_MARKS_KEY,
  type CutTag,
  heldOf,
  readAuthoredMarks,
  readMembers,
  withMembers,
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
    vacated: (slot: number, candidate: JsonNode) => boolean,
    part?: RootPart
  ) => Completion<JsonNode>;
  /** Whether `node` can stand in prefix slot `slot` of `root`. */
  fitsPrefix?: (node: JsonNode, slot: number, root: string) => boolean;
  content: (
    type: string | null,
    root: string
  ) => Readonly<{
    allowsText: boolean;
    min: number;
    prefix: number;
  }> | null;
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

/** @internal */
export const acceptedOwnShape = (
  node: Node
): 'bail' | 'drop' | 'keep' | 'liftChildren' | 'mergeUp' => {
  const marks = readAuthoredMarks(node);

  if (marks.some((mark) => mark.kind === 'delete')) return 'drop';

  const joins = !isText(node) && marks.some((mark) => mark.kind === 'join');
  const unwraps = marks.some((mark) => mark.kind === 'unwrap');

  if (
    (joins && unwraps) ||
    marks.some(
      (mark) =>
        mark.kind !== 'insert' &&
        mark.kind !== 'format' &&
        mark.kind !== 'unwrap' &&
        mark.kind !== 'wrap' &&
        !(mark.kind === 'split' && mark.cut === undefined) &&
        !(joins && mark.kind === 'join')
    )
  ) {
    return 'bail';
  }
  if (joins) return 'mergeUp';

  return unwraps ? 'liftChildren' : 'keep';
};

/** @internal */
export const hasJoinMark = (node: unknown) =>
  readAuthoredMarks(node).some((mark) => mark.kind === 'join');

/** @internal */
export const hasBoundaryMark = (node: unknown) =>
  readAuthoredMarks(node).some(
    (mark) => mark.kind === 'join' || mark.kind === 'split'
  );

type JoinMoment = Readonly<{ at: number; own: ReadonlySet<string> }>;

const deletesBeforeJoin = (mark: AuthoredMark, join: JoinMoment) =>
  mark.at <= join.at && !join.own.has(incarnationOf(mark));

/** @internal */
export const proposedKeepsContentAtJoin = (
  blocks: readonly Node[],
  joining: Node
) => {
  const joins = readAuthoredMarks(joining).filter(
    (mark) => mark.kind === 'join'
  );
  const join = {
    at: Math.min(...joins.map((mark) => mark.at)),
    own: new Set(joins.map(incarnationOf)),
  };
  const { liveContent } = survivalUnder<Node>((node) =>
    readAuthoredMarks(node).some(
      (mark) => mark.kind === 'delete' && deletesBeforeJoin(mark, join)
    )
  );

  return blocks.some((block) => (block.children ?? []).some(liveContent));
};

/** The review children of a level that hold its prefix slots at the start. */
const startOccupants = <N>(
  level: readonly N[],
  isInserted: (node: unknown) => boolean
) => level.filter((node) => !isInserted(node));

/**
 * Whether a decision vacates prefix slot `slot` when `original`, as the
 * review tree holds it, is the slot's candidate: neither the slot's start
 * occupant nor an inserted node, so the decision builds a fresh element there
 * as Editing does and never promotes a later sibling.
 */
const vacatesSlot = (
  start: readonly unknown[],
  slot: number,
  original: unknown,
  isInserted: (node: unknown) => boolean
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

const withMarks = (node: Node, marks: readonly unknown[]): Node => {
  const { [AUTHORED_MARKS_KEY]: _marks, ...rest } = node;

  return marks.length > 0 ? { ...rest, [AUTHORED_MARKS_KEY]: marks } : rest;
};

export type AuthoredResolveOptions = Readonly<{
  /** Writes the insertions an element built inside pending ones rests on. */
  dependencies?: Dependencies;
  facts?: ReviewFacts;
  holdsRejectedDeletions?: boolean;
  /**
   * The part of a root the children resolve as. A part with fewer nodes than
   * its minimum completes even when no decision changed it, because blocks
   * the rest of the root dropped leave the root short.
   */
  part?: RootPart;
}>;

const propsOf = (node: Node) => {
  const { children: _children, text: _text, ...props } = node;

  return props;
};

type Result = 'accept' | 'keep' | 'reject' | undefined;

/** @internal */
export const removes = (mark: AuthoredMark, result: Result) =>
  (mark.kind === 'insert' && result === 'reject') ||
  (mark.kind === 'delete' && result === 'accept');

/** @internal */
export const mergesUp = (mark: AuthoredMark, result: Result) =>
  (mark.kind === 'join' && result === 'accept') ||
  (mark.kind === 'split' && result === 'reject');

/** The pending join a block's claim says the block goes with. */
export const followsOf = (mark: AuthoredMark) =>
  (mark.kind === 'split' && mark.cut === undefined) || mark.kind === 'insert'
    ? mark.follows
    : undefined;

export const joinKeysOf = (marks: readonly AuthoredMark[]) =>
  new Set(
    marks.flatMap((mark) => (mark.kind === 'join' ? [incarnationOf(mark)] : []))
  );

const followerPassage = (
  children: NodeList<Node>,
  claimsOf: (node: Node) => readonly AuthoredMark[]
) => {
  let firstJoins: Map<string, Path> | undefined;
  const firstJoinOf = (key: string) => {
    if (!firstJoins) {
      const found = new Map<string, Path>();

      for (const { node, path } of textBlocksOf(children)) {
        for (const join of joinKeysOf(claimsOf(node))) {
          if (!found.has(join)) found.set(join, path);
        }
      }
      firstJoins = found;
    }

    return firstJoins.get(key);
  };
  const followsAt = (path: Path) => {
    const keys = new Set<string>();
    let level = children;

    for (const index of path) {
      const node = getDefined(level.at(index));

      for (const mark of claimsOf(node)) {
        const key = followsOf(mark);

        if (key) keys.add(key);
      }
      level = node.children ?? [];
    }

    return keys;
  };

  return {
    /** Whether the block at `path` or an element above it goes with a join. */
    goesWithJoin: (path: Path) => followsAt(path).size > 0,
    /**
     * Whether the join with incarnations `keys` passes over the text block at
     * `path`: that block or an element above it goes with one of those joins,
     * and it comes before that join's first block.
     */
    passesOver: (path: Path, keys: ReadonlySet<string>) =>
      keys.size > 0 &&
      [...followsAt(path)].some((key) => {
        const first = keys.has(key) ? firstJoinOf(key) : undefined;

        return !!first && PathApi.isBefore(path, first);
      }),
  };
};

export const joinPassage = (
  children: NodeList,
  claimsOf: (node: Node) => readonly AuthoredMark[],
  survives: (node: JsonNode) => boolean
) => ({
  ...followerPassage(children, claimsOf),
  /**
   * Whether the join on the text block at `path` stops before `from`: a
   * surviving element that does not unwrap encloses the block and not
   * `from`, which makes it the join's boundary.
   */
  stopsBefore: (from: Path, path: Path) => {
    const shared = PathApi.common(from, path).length;
    let level = children;

    for (const [depth, index] of path.slice(0, -1).entries()) {
      const node = getDefined(level.at(index));

      if (
        depth >= shared &&
        survives(node) &&
        !claimsOf(node).some((mark) => mark.kind === 'unwrap')
      ) {
        return true;
      }
      level = node.children ?? [];
    }

    return false;
  },
});

type TextBlock = Readonly<{
  ancestors: readonly Node[];
  node: Node;
  path: Path;
}>;

const textBlocksOf = (children: NodeList<Node>) => {
  const blocks: TextBlock[] = [];
  const collect = (
    nodes: NodeList<Node>,
    ancestors: readonly Node[],
    base: Path
  ) => {
    nodes.forEach((node, index) => {
      const path = [...base, index];

      if (isText(node)) return;
      if (isTextBlock(node)) blocks.push({ ancestors, node, path });
      else collect(node.children ?? [], [...ancestors, node], path);
    });
  };

  collect(children, [], []);

  return blocks;
};

type Pending = (node: Node) => readonly AuthoredMark[];
type DecisionOf = (mark: AuthoredMark) => 'accept' | 'keep' | 'reject';

const survivalAfter = (pending: Pending, decisionOf: DecisionOf) =>
  survivalUnder<Node>((node) =>
    pending(node).some((mark) => removes(mark, decisionOf(mark)))
  );

const subtreesOf = (roots: readonly Node[]) => {
  const nodes = new WeakSet<Node>();
  const add = (node: Node) => {
    nodes.add(node);
    for (const child of node.children ?? []) add(child);
  };

  roots.forEach(add);

  return nodes;
};

/**
 * The lines whose Editing deletions a pending join holds. An Editing deletion
 * that empties the line a pending join merges into keeps its claim until that
 * join is decided, so the join still finds the line's content, which it held
 * when the join was made. A line Editing removes whole, as a move's source, is
 * no longer there to merge into.
 */
const joinHeldLines = (
  children: NodeList<Node>,
  blocks: readonly TextBlock[],
  pending: Pending,
  decisionOf: DecisionOf
) => {
  const { liveContent: liveWithoutEditing } = survivalUnder<Node>((node) =>
    pending(node).some(
      (mark) => !isEditingChange(mark.change) && removes(mark, decisionOf(mark))
    )
  );
  const { liveContent: liveWithEditing } = survivalAfter(pending, decisionOf);
  const { passesOver } = followerPassage(children, pending);

  return blocks.flatMap(({ ancestors, node }, index) => {
    if (
      !pending(node).some(
        (mark) => mark.kind === 'join' && decisionOf(mark) === 'keep'
      )
    ) {
      return [];
    }

    const keys = joinKeysOf(pending(node));
    let previous = index - 1;

    while (previous >= 0 && passesOver(blocks[previous].path, keys)) {
      previous -= 1;
    }

    const container = ancestors.at(-1);
    const target = blocks[previous];

    return target &&
      (!container || target.ancestors.includes(container)) &&
      !pending(target.node).some(
        (mark) => mark.kind === 'delete' && isEditingChange(mark.change)
      ) &&
      !(target.node.children ?? []).some(liveWithEditing) &&
      (target.node.children ?? []).some(liveWithoutEditing)
      ? [target.node]
      : [];
  });
};

const lapsedHeldLines = (
  held: readonly Node[],
  mergedInto: ReadonlyMap<Node, Node>,
  mergedBlocks: ReadonlyMap<Node, readonly Node[]>,
  liveAfterDecision: (node: Node) => boolean
) =>
  held.filter((line) => {
    const into = mergedInto.get(line);

    return (
      into !== undefined &&
      [into, ...(mergedBlocks.get(into) ?? [])].some((block) =>
        (block.children ?? []).some(liveAfterDecision)
      )
    );
  });

export const heldByPendingJoins = (
  children: NodeList<Node>,
  pending: Pending,
  decisionOf: DecisionOf
) =>
  subtreesOf(
    joinHeldLines(children, textBlocksOf(children), pending, decisionOf)
  );

export const pastFollowers = (
  children: NodeList<Node>,
  from: number,
  claimsOf: (node: Node) => readonly AuthoredMark[]
) => {
  let end = from;

  while (
    end < children.length &&
    claimsOf(getDefined(children.at(end))).some(
      (mark) => followsOf(mark) !== undefined
    )
  ) {
    end += 1;
  }

  return end;
};

export const heldByJoinsAt = (
  children: NodeList<Node>,
  rank: number,
  pending: Pending,
  decisionOf: DecisionOf
) =>
  heldByPendingJoins(
    children.slice(rank, pastFollowers(children, rank + 1, pending) + 1),
    pending,
    decisionOf
  );

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
  root = 'main',
  {
    facts = NO_FACTS,
    dependencies = createDependencies(facts),
    holdsRejectedDeletions = false,
    part,
  }: AuthoredResolveOptions = {}
): AuthoredResolution => {
  const pending = (node: unknown) =>
    standingClaimsOf(node, facts, dependencies);
  const isInserted = (node: unknown) =>
    pending(node).some((mark) => mark.kind === 'insert');
  const keepsRejectedDeletion = (mark: AuthoredMark) =>
    holdsRejectedDeletions &&
    mark.kind === 'delete' &&
    facts.insertedIncarnations().has(incarnationOf(mark));
  const keptMembers = (
    node: Node,
    pendingMarks: readonly AuthoredMark[],
    keeps: (mark: AuthoredMark) => boolean
  ) => {
    const pendingSet = new Set<unknown>(pendingMarks);
    const stored = readMembers(node);
    const contextual = pendingMarks.filter((mark) => !stored.includes(mark));
    const resting = contextual.filter((mark) => decisionOf(mark) === 'keep');
    const contextIntact = resting.length === contextual.length;
    const kept = stored.flatMap((member): AuthoredMember[] => {
      if (member.kind === 'in') {
        return resting.length > 0 && contextIntact ? [member] : [];
      }

      const settledByVerdict = !pendingSet.has(member);

      if (member.kind === 'held' || settledByVerdict || keeps(member)) {
        return [member];
      }

      return resultOf(member) === 'reject' && keepsRejectedDeletion(member)
        ? [heldOf(member)]
        : [];
    });

    if (
      resting.length === 0 ||
      (contextIntact && kept.some((member) => member.kind === 'insert'))
    ) {
      return kept;
    }

    const own = kept.filter(
      (member): member is AuthoredMark =>
        member.kind !== 'in' && member.kind !== 'held'
    );

    return readMembers(
      dependencies.props(
        withMembers(
          {},
          kept.filter((member) => member.kind === 'held')
        ),
        [...resting, ...own]
      )
    );
  };
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
          vacated,
          part
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
  const decisionOf = (mark: AuthoredMark) =>
    isAccepted(facts, mark) ? ('accept' as const) : outcome(mark.change);
  const resultOf = (mark: AuthoredMark) => {
    if (isAccepted(facts, mark)) return 'accept';

    const result = outcome(mark.change);

    if (result !== 'keep') decided.add(mark.change);

    return result;
  };
  const wait = (marks: readonly AuthoredMark[]) => {
    for (const mark of marks) {
      if (decisionOf(mark) === 'keep') waits.add(mark.change);
    }
  };
  const subtreeMarks = (node: Node): AuthoredMark[] => [
    ...pending(node),
    ...(node.children ?? []).flatMap(subtreeMarks),
  ];
  // An Editing join, or a claim of a block that goes with a join, whose
  // landing waits on a pending change keeps its claim, to land once that
  // change is decided. A proposed one holds the decision instead, since only a
  // verdict would remember its acceptance.
  const retainedJoins = new Set<Node>();
  const retainedFollowers = new Set<Node>();
  const track = <T extends Node>(node: T, original: object | undefined) => {
    if (original) origins.set(node, original);

    return node;
  };

  const heldDeletion = (node: Node, mark: AuthoredMark) =>
    mark.kind === 'delete' &&
    isEditingChange(mark.change) &&
    heldByJoin.has(node);
  const settledMemo = new WeakMap<Node, boolean>();
  const settled = (node: Node) => {
    let value = settledMemo.get(node);

    if (value === undefined) {
      value = pending(node).some(
        (mark) => removes(mark, resultOf(mark)) && !heldDeletion(node, mark)
      );
      settledMemo.set(node, value);
    }

    return value;
  };
  const { survives } = survivalUnder(settled);
  // Insert and delete marks of content the decision leaves standing, whose
  // own decisions say whether it stays.
  const contentMarksIn = (node: Node): AuthoredMark[] => [
    ...(settled(node)
      ? []
      : pending(node).filter(
          (mark) => mark.kind === 'insert' || mark.kind === 'delete'
        )),
    ...(node.children ?? []).flatMap(contentMarksIn),
  ];
  const structureOf = (node: Node) => {
    let join = false;
    let unwrap = false;

    for (const mark of pending(node)) {
      const result = resultOf(mark);

      if (mergesUp(mark, result)) join = true;
      if (
        (mark.kind === 'unwrap' && result === 'accept') ||
        (mark.kind === 'wrap' && result === 'reject')
      ) {
        unwrap = true;
      }
    }

    return { join, unwrap };
  };

  const blocks = textBlocksOf(children);
  const heldLines = joinHeldLines(children, blocks, pending, decisionOf);
  const heldByJoin = subtreesOf(heldLines);

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
  const keepsContent = (target: Node, join: JoinMoment) => {
    const { liveContent: liveAt } = survivalUnder<Node>((node) =>
      pending(node).some(
        (mark) =>
          removes(mark, resultOf(mark)) &&
          (mark.kind !== 'delete' || deletesBeforeJoin(mark, join))
      )
    );

    return (
      (target.children ?? []).some(liveAt) ||
      (mergedBlocks.get(target) ?? []).some((block) =>
        (block.children ?? []).some(liveAt)
      )
    );
  };
  const { liveContent: keptContent } = survivalUnder<Node>((node) =>
    pending(node).some(
      (mark) =>
        removes(mark, decisionOf(mark)) ||
        ((mark.kind === 'insert' || mark.kind === 'delete') &&
          decisionOf(mark) === 'keep')
    )
  );
  const joinOf = (node: Node) => {
    const marks = pending(node).filter((mark) =>
      mergesUp(mark, resultOf(mark))
    );

    return {
      at: Math.min(...marks.map((mark) => mark.at)),
      own: new Set(marks.map(incarnationOf)),
    };
  };
  type JoinBlock = Readonly<{ index: number; mark: AuthoredMark; node: Node }>;
  let joinBlocks: Map<string, JoinBlock[]> | undefined;
  const joinBlocksOf = (incarnation: string) => {
    if (!joinBlocks) {
      const found = new Map<string, JoinBlock[]>();

      blocks.forEach(({ node }, index) => {
        for (const mark of pending(node)) {
          if (mark.kind !== 'join') continue;
          const key = incarnationOf(mark);

          found.set(key, [...(found.get(key) ?? []), { index, mark, node }]);
        }
      });
      joinBlocks = found;
    }

    return joinBlocks.get(incarnation) ?? [];
  };
  // Blocks that go with a pending join, in document order, each with the
  // number of lines before it, which orders it among the join's blocks.
  const followers: Array<
    Readonly<{
      follows: ReadonlySet<string>;
      node: Node;
      order: number;
    }>
  > = [];
  let lines = 0;
  const collectFollowers = (nodes: readonly Node[]) => {
    for (const node of nodes) {
      if (isText(node)) continue;

      const follows = new Set(
        pending(node).flatMap((mark) => {
          const key = followsOf(mark);

          return key ? [key] : [];
        })
      );

      if (follows.size > 0) followers.push({ follows, node, order: lines });
      if (isTextBlock(node)) lines += 1;
      else collectFollowers(node.children ?? []);
    }
  };

  collectFollowers(children);

  const passage = joinPassage(children, pending, survives);
  const precedesJoin = ({ path }: TextBlock, keys: ReadonlySet<string>) =>
    followers.length > 0 && passage.passesOver(path, keys);

  blocks.forEach(({ ancestors, node }, index) => {
    if (!structureOf(node).join) return;
    // A join on a block the decision removes has nothing to merge, so the
    // block's pending content decides with the join, unless content that
    // stays whatever is pending keeps the block.
    const waited = (node.children ?? []).some(keptContent)
      ? []
      : contentMarksIn(node);
    const land = (effect?: () => void) => {
      if (
        waited.some((mark) => decisionOf(mark) === 'keep') &&
        pending(node).some(
          (mark) => mark.kind === 'join' && isEditingChange(mark.change)
        )
      ) {
        retainedJoins.add(node);
        return;
      }
      wait(waited);
      effect?.();
    };

    if (!survives(node)) {
      land();
      return;
    }

    const boundary =
      [...ancestors]
        .reverse()
        .find(
          (ancestor) => survives(ancestor) && !structureOf(ancestor).unwrap
        ) ?? null;
    let target: Node | null = null;
    // Rejecting a split makes its pieces one block again, and both pieces
    // carry the insertions of the block that was cut. A piece that goes only
    // because one of those insertions goes is still the block the rejected
    // split rejoins, which this block's surviving content keeps.
    const cutFrom = pending(node).some(
      (mark) => mark.kind === 'split' && resultOf(mark) === 'reject'
    )
      ? new Set(
          pending(node).flatMap((mark) =>
            mark.kind === 'insert' ? [incarnationOf(mark)] : []
          )
        )
      : null;
    const rejoins = (candidate: Node) => {
      const removing = pending(candidate).filter((mark) =>
        removes(mark, resultOf(mark))
      );

      return (
        !!cutFrom &&
        removing.length > 0 &&
        removing.every(
          (mark) => mark.kind === 'insert' && cutFrom.has(incarnationOf(mark))
        )
      );
    };

    const keys = new Set(
      pending(node).flatMap((mark) =>
        mark.kind === 'join' ? [incarnationOf(mark)] : []
      )
    );

    for (let previous = index - 1; previous >= 0; previous -= 1) {
      const candidate = blocks[previous];

      if (boundary && !candidate.ancestors.includes(boundary)) {
        // Unwrapping the boundary would let the join reach further, so its
        // pending enclosure decides with the join.
        waited.push(
          ...pending(boundary).filter(
            (mark) => mark.kind === 'unwrap' || mark.kind === 'wrap'
          )
        );
        break;
      }
      if (
        emptiedTargets.has(candidate.node) ||
        (!survives(candidate.node) && !rejoins(candidate.node)) ||
        precedesJoin(candidate, keys)
      ) {
        continue;
      }
      target = finalOf(candidate.node);
      break;
    }

    // With no block to merge into, the join drops and its block stays.
    if (!target) {
      land();
      return;
    }

    const into = target;

    // Whether the target keeps content, and so which block survives the
    // merge, depends on its pending content and enclosure.
    // Content no pending change touches keeps the target either way.
    waited.push(
      ...pending(into).filter((mark) =>
        CONTENT_AND_ENCLOSURE_KINDS.has(mark.kind)
      ),
      ...((into.children ?? []).some(keptContent)
        ? []
        : (into.children ?? []).flatMap(contentMarksIn))
    );
    // A block that structure removes takes its pending marks with it, so
    // they decide with the join.
    if (!keepsContent(into, joinOf(node))) {
      waited.push(...subtreeMarks(into));
      // As Editing's merge does, an empty target goes and the joining block
      // keeps its own type and properties.
      land(() => emptiedTargets.add(into));
      return;
    }
    waited.push(...pending(node));
    land(() => {
      mergedInto.set(node, into);
      mergedBlocks.set(into, [...(mergedBlocks.get(into) ?? []), node]);
    });
  });

  const afterDecision = survivalAfter(pending, decisionOf);
  const lapsed = subtreesOf(
    lapsedHeldLines(
      heldLines,
      mergedInto,
      mergedBlocks,
      afterDecision.liveContent
    )
  );

  // A block that goes with an accepted join lands right after the joined
  // line, wherever the join takes it.
  const placedAfter = new Map<Node, Node[]>();
  const placed = new Set<Node>();

  for (const { follows, node, order } of followers) {
    const claims = pending(node).filter((mark) => followsOf(mark));

    if (
      pending(node).some(
        (mark) => mark.kind === 'split' && resultOf(mark) === 'reject'
      ) ||
      mergedInto.has(node) ||
      emptiedTargets.has(node) ||
      !survives(node)
    ) {
      continue;
    }

    // The join's block it follows, or the first one after it when it was
    // written between the join's target and line.
    const joins = [...follows]
      .flatMap(joinBlocksOf)
      .toSorted((left, right) => left.index - right.index);
    const source =
      joins.findLast((joinBlock) => joinBlock.index < order) ?? joins[0];

    if (!source || !survives(source.node)) continue;
    if (mergedInto.has(source.node) && resultOf(source.mark) === 'accept') {
      const anchor = finalOf(source.node);

      placed.add(node);
      placedAfter.set(anchor, [...(placedAfter.get(anchor) ?? []), node]);
      continue;
    }
    if (!claims.some((mark) => resultOf(mark) === 'accept')) continue;
    if (claims.some((mark) => isEditingChange(mark.change))) {
      if (decisionOf(source.mark) === 'keep') retainedFollowers.add(node);
    } else {
      wait([source.mark]);
    }
  }

  // A pending join waits on a decision that removes the block it would join.
  blocks.forEach(({ ancestors, node }, index) => {
    const joins = pending(node).filter(
      (mark) => mark.kind === 'join' && decisionOf(mark) === 'keep'
    );

    // A block the decision removes takes its pending join with it.
    if (joins.length === 0 || !survives(node)) return;

    const container = ancestors.at(-1);
    const keys = new Set(joins.map(incarnationOf));
    let before = index - 1;

    while (before >= 0 && precedesJoin(getDefined(blocks[before]), keys)) {
      before -= 1;
    }

    const candidate = blocks[before];
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
    ({ tag }) => decisionOf(tag) === 'reject'
  );

  for (const { end, start, tag } of cutSides.values()) {
    if (
      end === undefined ||
      start === undefined ||
      end >= start ||
      decisionOf(tag) !== 'reject' ||
      finalOf(getDefined(blocks[start]).node) ===
        finalOf(getDefined(blocks[end]).node)
    ) {
      continue;
    }
    for (let index = end + 1; index <= start; index += 1) {
      wait(
        pending(getDefined(blocks[index]).node).filter(
          (mark) => mark.kind === 'join' || mark.kind === 'split'
        )
      );
    }
  }

  // Phase two: rebuild the document with decided content removed.
  const resolveList = (
    input: readonly Node[],
    parentType: string | null,
    path: readonly number[],
    landing = false
  ): Readonly<{ changed: boolean; dirty: number[]; list: Node[] }> => {
    const out: Node[] = [];
    const dirty: number[] = [];
    const { joined, nodes } = joinsCuts
      ? joinRejectedCuts(input, {
          dependencies,
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
    const land = (anchor: Node) => {
      const pieces = placedAfter.get(anchor);

      if (!pieces) return;

      const landed = resolveList(pieces, parentType, path, true);

      for (const at of landed.dirty) dirty.push(out.length + at);
      out.push(...landed.list);
      restructured = true;
    };

    for (const [index, node] of nodes.entries()) {
      const marks = pending(node);
      const stored = readMembers(node);
      const original = joined.get(node) ?? node;

      if (
        mergedInto.has(node) ||
        emptiedTargets.has(node) ||
        (placed.has(node) && !landing)
      ) {
        restructured = true;
        continue;
      }
      if (lapsed.has(node) && !afterDecision.survives(node)) {
        if (isText(node)) changed = true;
        else restructured = true;
        continue;
      }
      // An Editing unwrap of a line removes a wrapper that stands for the
      // content pending inside it, as a removal does.
      const unwrapsLine =
        isTextBlock(node) &&
        marks.some(
          (mark) =>
            mark.kind === 'unwrap' &&
            isEditingChange(mark.change) &&
            resultOf(mark) === 'accept'
        );
      // Deciding a block's own removal decides with the content pending
      // inside it, which keeps the block or lets it go.
      const inner =
        !isText(node) && (settled(node) || unwrapsLine)
          ? (node.children ?? []).flatMap(contentMarksIn)
          : [];

      wait(inner);
      if (settled(node) && !survives(node)) {
        // Its pending cuts would have nothing to join, so they decide with it.
        wait(cutsOf(node));
        // Corrections derive values from elements, not from text runs.
        if (isText(node)) changed = true;
        else restructured = true;
        continue;
      }

      const props = propsOf(node);
      const formats = decideFormats(props, marks, decisionOf);

      for (const change of formats?.waits ?? []) waits.add(change);

      const kept = keptMembers(node, marks, (mark) => {
        const result = resultOf(mark);

        return mark.kind === 'format'
          ? (formats?.kept.has(mark) ?? false)
          : result === 'keep' ||
              heldDeletion(node, mark) ||
              (mark.kind === 'join' && retainedJoins.has(node)) ||
              ((mark.kind === 'split' || followsOf(mark) !== undefined) &&
                retainedFollowers.has(node));
      });
      // A block whose removal is decided stands only for the pending content
      // inside it, so it takes that content's deletions and goes with it.
      const outlived = [
        ...new Map(
          inner
            .filter(
              (mark) =>
                mark.kind === 'delete' &&
                decisionOf(mark) === 'keep' &&
                !kept.includes(mark)
            )
            .map((mark) => [incarnationOf(mark), mark])
        ).values(),
      ];
      const formatted = {
        kept: outlived.length > 0 ? [...kept, ...outlived] : kept,
        props: formats?.props ?? props,
      };
      const selfChanged =
        (formats?.changed ?? false) ||
        formatted.kept.length !== stored.length ||
        formatted.kept.some((member, at) => member !== stored[at]);

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

      if (structureOf(node).unwrap && !(unwrapsLine && outlived.length > 0)) {
        restructured = true;
        if (
          resolved.some(isText) &&
          contentOf(parentType)?.allowsText === false
        ) {
          unplaceable = true;
        }
        wait(pending({ [AUTHORED_MARKS_KEY]: formatted.kept }));
        // Unwrapping moves the join boundary of the block's first child and
        // of the block after it.
        wait(
          [resolved[0], nodes[index + 1]].flatMap((item) =>
            pending(item).filter(
              (mark) => mark.kind === 'join' || mark.kind === 'split'
            )
          )
        );
        for (const at of childDirty) dirty.push(out.length + at);
        out.push(...resolved);
        land(node);
        continue;
      }

      const emptied = resolved.length === 0 && (node.children ?? []).length > 0;

      // A block a decision empties stays, as it does in Editing, so its own
      // pending marks decide with that decision.
      if (emptied) {
        wait(pending({ [AUTHORED_MARKS_KEY]: formatted.kept }));
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
      land(node);
    }

    if (restructured) {
      diagnostics.push({
        code: 'authored-uncorrected',
        message: `A decision restructured the children of ${
          parentType ?? 'an element'
        }, and corrections that depend on them did not run.`,
        path,
        severity: 'warning',
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
      pending(parent).filter(
        (mark) =>
          STRUCTURE_KINDS.has(mark.kind) ||
          mark.kind === 'delete' ||
          (mark.kind === 'format' && mark.key === 'type')
      )
    );
    for (const child of level) {
      wait(pending(child).filter((mark) => STRUCTURE_KINDS.has(mark.kind)));
    }
    for (const ancestor of ancestors) {
      wait(pending(ancestor).filter((mark) => STRUCTURE_KINDS.has(mark.kind)));
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
    const insertions = [...front].flatMap((node) =>
      pending(node).filter((mark) => mark.kind === 'insert')
    );

    if (insertions.length === 0) return;

    const without = completeHere(
      level.filter((node) => !front.has(node) || !isInserted(node))
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
      wait(insertions);
    }
  };
  // An element built inside pending insertions is part of them, as the
  // recorder's fills are, so rejecting any of them removes it.
  const underInsertions = (
    completion: Completion<Node>,
    site: readonly Node[]
  ): Completion<Node> => {
    const marks = site.flatMap((node) =>
      pending(node).filter(
        (mark) => mark.kind === 'insert' && decisionOf(mark) === 'keep'
      )
    );

    if (marks.length === 0 || completion.built.length === 0) return completion;

    const marked = new Map(
      completion.built.map(({ node }) => [
        node,
        dependencies.throughout(node as JsonNode, marks) as Node,
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

    const start = startOccupants(startLevel, isInserted);
    const completeHere = (items: readonly Node[]) =>
      complete(items, site, startLevel, (slot, candidate) =>
        vacatesSlot(
          start,
          slot,
          origins.get(candidate) ?? candidate,
          isInserted
        )
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
    top.changed || top.list.length < (part?.min ?? 0),
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
  outcome: LayerOutcome
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
  schema: AuthoredResolveSchema | null = null,
  options: Readonly<{ holdsRejectedDeletions?: boolean }> = {}
) => {
  const facts = factsOf(value);
  const dependencies = createDependencies(facts);
  const resolveOptions = { ...options, dependencies, facts };
  const main = resolveAuthoredChildren(
    value.children,
    outcome,
    schema,
    'main',
    resolveOptions
  );
  const roots = Object.entries(value.roots ?? {}).map(
    ([root, children]) =>
      [
        root,
        resolveAuthoredChildren(
          children,
          outcome,
          schema,
          root,
          resolveOptions
        ),
      ] as const
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
    value: deriveValue(
      value,
      {
        children: main.children,
        ...(value.roots
          ? {
              roots: Object.fromEntries(
                roots.map(([root, resolution]) => [root, resolution.children])
              ),
            }
          : {}),
      },
      putContexts(dependencies.minted())
    ),
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
