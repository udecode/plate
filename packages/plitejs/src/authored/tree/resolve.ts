import type { AuthoredProjectionDiagnostic } from '../../core/authored-document-capability';
import type { NodeList } from '../../core/change/document-index';
import type { JsonRecord } from '../../core/change/json';
import { jsonEqual } from '../../core/change/json';
import type { JsonEditorValue, JsonNode } from '../../core/change/tokens';
import {
  composeRecordOps,
  deriveValue,
  withoutValueRoots,
} from '../../core/record-store';
import type { ListPart } from '../../core/representation';
import { orphanedValueRoots } from '../../core/root-ownership';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
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
import {
  incarnationOf,
  type LandedRecord,
  landedOf,
  putContexts,
  putLanded,
} from '../facts/records';
import { countLedgerWork } from '../ledger/work';
import { cutsOf, joinedShell, joinRejectedCuts } from './cuts';
import {
  type Around,
  type Assignment,
  type Half,
  type Halves,
  type Settled,
  supplies,
  type Verdict,
  verdictOf,
} from './halves';
import { heldProps, type Place } from './holds';
import {
  decideKey,
  type FormatTag,
  type KeyReading,
  tipsWrittenValue,
} from './layers';
import {
  type AuthoredMark,
  type AuthoredMember,
  AUTHORED_MARKS_KEY,
  type CutTag,
  heldOf,
  isPlaceChange,
  isStructureChange,
  readAuthoredMarks,
  readMembers,
  withMembers,
} from './marks';

/**
 * One verdict for every change, as a projection reads them, or one per
 * change, where 'keep' leaves it pending.
 */
export type AuthoredOutcome =
  | 'accept'
  | 'reject'
  | ((changeId: string) => 'accept' | 'keep' | 'reject');

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
    part?: ListPart
  ) => Completion<JsonNode>;
  /** Whether `node` can stand in prefix slot `slot` of `root`. */
  fitsPrefix?: (node: JsonNode, slot: number, root: string) => boolean;
  /**
   * A text's properties made canonical for the element it sits in, given by
   * type with the types of its ancestors, nearest first.
   */
  canonicalizeTextProperties?: (
    props: JsonRecord,
    types: readonly string[],
    root: string,
    preferredKey: string
  ) => Readonly<JsonRecord>;
  content: (
    type: string | null,
    root: string
  ) => Readonly<{
    allowsText: boolean;
    max: number | null;
    min: number;
    prefix: number;
  }> | null;
  /**
   * The type Editing's split of `source` gives the element after it at
   * `slot` of the container `site` names, nearest first or none at a root:
   * the slot's own type when `source` cannot stand there.
   */
  continuationType?: (
    source: JsonNode,
    slot: number,
    site: readonly JsonRecord[],
    root: string
  ) => string | null;
  ownership: CompiledEditorSchema;
}>;

export type AuthoredResolution = Readonly<{
  /** Pending changes the decision waits on, which must be decided with it. */
  blockers: readonly string[];
  children: readonly JsonNode[];
  decided: readonly string[];
  diagnostics: readonly AuthoredProjectionDiagnostic[];
  landed: readonly LandedRecord[];
  /**
   * The stored blocks the decision shows away from their stored place, in the
   * order they land: each lands as the next sibling of `after`, once the
   * placements before it have landed. A block goes with a join it follows,
   * merges into a block that does, or stands, as a rejected split's piece, in
   * the place of the piece it rejoins when the decision empties that piece.
   * It counts only when a line the decision shows lies between its place and
   * its landing point, or it leaves an element the decision shows.
   */
  placements: readonly AuthoredPlacement[];
  /** The blocks the decision hides whole, with the shown block each collapses into. */
  hidden: readonly AuthoredHiddenBlock[];
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

export type AuthoredPlacement = Readonly<{ after: JsonNode; node: JsonNode }>;

export type AuthoredHiddenBlock = Readonly<{
  /** The block's path in the children the decision was given. */
  at: readonly number[];
  /**
   * The path in the resolved children of the shown block it collapses into,
   * or null when it collapses between top-level blocks.
   */
  owner: readonly number[] | null;
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
export const claimsBreakBefore = (node: unknown) =>
  readAuthoredMarks(node).some(
    (mark) =>
      mark.kind === 'join' || (mark.kind === 'split' && mark.cut === undefined)
  );

/** @internal */
export const hasBoundaryMark = (node: unknown) =>
  readAuthoredMarks(node).some(
    (mark) => mark.kind === 'join' || mark.kind === 'split'
  );

type JoinMoment = Readonly<{ at: number; own: ReadonlySet<string> }>;

const deletesBeforeJoin = (mark: AuthoredMark, join: JoinMoment) =>
  mark.at <= join.at && !join.own.has(incarnationOf(mark));

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
  /**
   * Resolves for storage: keeps held members and holds rejected deletions of
   * inserted content.
   */
  stores?: boolean;
  /**
   * The rejected changes are withdrawn by their writer, so no later edit can
   * reopen them and their deletions leave no held member.
   */
  withdraws?: boolean;
  /**
   * The part of a root the children resolve as. A part with fewer nodes than
   * its minimum completes even when no decision changed it, because blocks
   * the rest of the root dropped leave the root short.
   */
  part?: ListPart;
  /**
   * Children the caller hides whole before deciding, which the resolution
   * records in `hidden` and otherwise never reads.
   */
  removed?: ReadonlySet<JsonNode>;
  /** The containers the children sit in, nearest first; none at a root. */
  site?: readonly JsonNode[];
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
  const blocks = textBlocksIn(children, []);
  const firstJoins = new Map<string, Path>();
  // Scans only as far as the join's first block, so a key beside a join near
  // the top of a long level reads no block past it.
  const firstJoinOf = (key: string) => {
    while (!firstJoins.has(key)) {
      const next = blocks.next();

      if (next.done) break;
      countLedgerWork('joinScans');
      for (const join of joinKeysOf(claimsOf(next.value.node))) {
        if (!firstJoins.has(join)) firstJoins.set(join, next.value.path);
      }
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

function* textBlocksIn(
  nodes: NodeList<Node>,
  base: Path
): Generator<Readonly<{ node: Node; path: Path }>> {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = getDefined(nodes.at(index));

    if (isText(node)) continue;
    if (isTextBlock(node)) yield { node, path: [...base, index] };
    else yield* textBlocksIn(node.children ?? [], [...base, index]);
  }
}

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

const subtreesOf = (roots: readonly Node[]) => {
  const nodes = new WeakSet<Node>();
  const add = (node: Node) => {
    nodes.add(node);
    for (const child of node.children ?? []) add(child);
  };

  roots.forEach(add);

  return nodes;
};

type Landing = { children: Landing[]; node: Node; parent: Landing | null };

/**
 * The landings phase two made, applied in order to a model of the stored
 * elements, keeping each one that moves a block past a line the resolved
 * tree shows, or out of an element it shows. A landing that passes only
 * lines it does not show already shows where the stored order puts it, and
 * so do all of them when the elements the tree shows keep their stored order
 * and nesting.
 */
const placementsOf = (
  children: readonly Node[],
  landings: readonly AuthoredPlacement[],
  shows: (node: Node) => boolean
): AuthoredPlacement[] => {
  if (landings.length === 0) return [];

  const items = new Map<Node, Landing>();
  const top: Landing = { children: [], node: {}, parent: null };
  const build = (nodes: readonly Node[], parent: Landing) => {
    for (const node of nodes) {
      if (isText(node)) continue;

      const item: Landing = { children: [], node, parent };

      items.set(node, item);
      parent.children.push(item);
      if (!isTextBlock(node)) build(node.children ?? [], item);
    }
  };

  build(children, top);

  const linesOf = (item: Landing): Landing[] =>
    item !== top && isTextBlock(item.node)
      ? [item]
      : item.children.flatMap(linesOf);
  const holds = (outer: Landing, inner: Landing) => {
    for (let at: Landing | null = inner; at; at = at.parent) {
      if (at === outer) return true;
    }

    return false;
  };
  const outline = (item: Landing, into: Array<Node | null> = []) => {
    for (const child of item.children) {
      const shown = shows(child.node);

      if (shown) into.push(child.node);
      outline(child, into);
      if (shown) into.push(null);
    }

    return into;
  };
  const stored = outline(top);
  const placements: AuthoredPlacement[] = [];

  for (const placement of landings) {
    const item = items.get(placement.node);
    const target = items.get(placement.after);

    if (!item || !target || holds(item, target) || holds(target, item)) {
      continue;
    }

    const lines = linesOf(top);
    const own = linesOf(item);
    const first = own[0] ? lines.indexOf(own[0]) : -1;
    const landing = lines.indexOf(getDefined(linesOf(target).at(-1))) + 1;
    const from = getDefined(item.parent);
    const into = getDefined(target.parent);

    if (
      first === -1 ||
      !(
        (first < landing
          ? lines.slice(first + own.length, landing)
          : lines.slice(landing, first)
        ).some((line) => shows(line.node)) ||
        (from !== into && from !== top && shows(from.node))
      )
    ) {
      continue;
    }

    from.children.splice(from.children.indexOf(item), 1);
    into.children.splice(into.children.indexOf(target) + 1, 0, item);
    item.parent = into;
    placements.push(placement);
  }

  const shown = outline(top);

  return shown.length === stored.length &&
    shown.every((node, index) => node === stored[index])
    ? []
    : placements;
};

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
  given: readonly JsonNode[],
  outcome: AuthoredOutcome,
  schema: AuthoredResolveSchema | null = null,
  root = 'main',
  options: AuthoredResolveOptions = {}
): AuthoredResolution =>
  getDefined(resolveIn(given, outcome, schema, root, options, null));

/**
 * A run that reads one rejected cut's verdict under an assignment: the cut
 * an inline cut's id names, or the right block of a block split, with the
 * left half the deciding run found. It stops once it has the verdict.
 */
type Probe = {
  key: string | Node;
  left: Node;
  /** The keys the deciding run's join takes from the right half. */
  rightKeys: ReadonlySet<string>;
  settled: Settled | undefined;
};

const resolveIn = (
  given: readonly JsonNode[],
  outcome: AuthoredOutcome,
  schema: AuthoredResolveSchema | null,
  root: string,
  options: AuthoredResolveOptions,
  probe: Probe | null
): AuthoredResolution | null => {
  const {
    facts = NO_FACTS,
    dependencies = createDependencies(facts),
    stores = false,
    withdraws = false,
    part,
    removed,
    site = [],
  } = options;
  const children = removed ? given.filter((node) => !removed.has(node)) : given;
  const outcomeOf = typeof outcome === 'string' ? () => outcome : outcome;
  const pending = (node: unknown) =>
    standingClaimsOf(node, facts, dependencies);
  const isInserted = (node: unknown) =>
    pending(node).some((mark) => mark.kind === 'insert');
  const keepsRejectedDeletion = (mark: AuthoredMark) =>
    stores &&
    !withdraws &&
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
      if (member.kind === 'held') return stores ? [member] : [];
      if (member.kind === 'in') {
        return resting.length > 0 && contextIntact ? [member] : [];
      }

      const settledByVerdict = !pendingSet.has(member);

      if (settledByVerdict || keeps(member)) {
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
    at: readonly Node[],
    startLevel: readonly Node[],
    vacated: (slot: number, candidate: Node) => boolean,
    listPart: ListPart | undefined
  ) =>
    schema?.complete
      ? (schema.complete(
          nodes as readonly JsonNode[],
          at,
          root,
          vacated,
          listPart
        ) as Completion<Node>)
      : {
          built: [],
          children:
            nodes.length === 0 && at.length > 0 && startLevel.some(isText)
              ? [{ text: '' }]
              : mergeTextsWithEqualProps(nodes),
        };
  const decided = new Set<string>();
  const waits = new Set<string>();
  const landings = new Map<string, LandedRecord>();
  const diagnostics: AuthoredProjectionDiagnostic[] = [];
  const origins = new Map<object, object>();
  // Elements whose children or properties a decision changed, which the
  // completion pass brings to canonical form, and for each element on the way
  // to one, the indexes of its children that lead there.
  const touched = new WeakSet<Node>();
  const dirtyChildren = new WeakMap<Node, readonly number[]>();
  let unplaceable = false;
  const decisionOf = (mark: AuthoredMark) =>
    isAccepted(facts, mark) ? ('accept' as const) : outcomeOf(mark.change);
  const resultOf = (mark: AuthoredMark) => {
    if (isAccepted(facts, mark)) return 'accept';

    const result = outcomeOf(mark.change);

    if (result !== 'keep') decided.add(mark.change);

    return result;
  };
  const wait = (marks: readonly AuthoredMark[]) => {
    for (const mark of marks) {
      if (decisionOf(mark) === 'keep') waits.add(mark.change);
    }
  };
  const waitOnPlaceChanges = (at: readonly Node[]) => {
    for (const node of at) wait(pending(node).filter(isPlaceChange));
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

  const settledMemo = new WeakMap<Node, boolean>();
  const settled = (node: Node) => {
    let value = settledMemo.get(node);

    if (value === undefined) {
      value = pending(node).some((mark) => removes(mark, resultOf(mark)));
      settledMemo.set(node, value);
    }

    return value;
  };
  const { survives } = survivalUnder(settled);
  const reading: KeyReading = {
    accepted: (member) => isAccepted(facts, member),
    landed: facts.landed,
    outcome: (tag) => outcomeOf(tag.change),
  };
  const decidedPropsOf = (node: Node) =>
    decideFormats(propsOf(node), pending(node), reading)?.props ??
    propsOf(node);
  /** The place of a node under `chain`, its containers nearest first. */
  const placeUnder = (chain: readonly Node[]): Place => {
    const [parent = null, ...outer] = chain.map((node) =>
      typeOf(decidedPropsOf(node))
    );

    return {
      outerTypes: outer.flatMap((type) => type ?? []),
      parentType: parent,
      root,
    };
  };
  /** One side of a cut, from the claims its verdict site already read. */
  const halfOf = (
    node: Node,
    claims: readonly AuthoredMark[],
    place: Place
  ): Half => {
    const values =
      decideFormats(propsOf(node), claims, reading)?.props ?? propsOf(node);

    return {
      decided: values,
      node,
      pending: claims.filter((mark) => decisionOf(mark) === 'keep'),
      props: schema
        ? heldProps(schema.ownership, values, { ...place, text: false })
        : values,
    };
  };
  const pendingOf =
    typeof outcome === 'string'
      ? null
      : (node: Node) =>
          pending(node).filter((mark) => decisionOf(mark) === 'keep');
  const valuesOf = (props: Readonly<JsonRecord>) => {
    const { [AUTHORED_MARKS_KEY]: _marks, ...values } = props;

    return values;
  };
  const probed = new Map<string | Node, Map<string, Settled>>();
  const probeUnder = (
    assignment: Assignment,
    key: string | Node,
    left: Node,
    rightKeys: ReadonlySet<string>
  ) => {
    const id = [...assignment]
      .map(([change, action]) => `${action}:${change}`)
      .join(' ');
    const known = probed.get(key)?.get(id);

    if (known) return known;

    const run: Probe = { key, left, rightKeys, settled: undefined };

    resolveIn(
      given,
      (change) => assignment.get(change) ?? outcomeOf(change),
      schema,
      root,
      { ...options, dependencies: createDependencies(facts), facts },
      run
    );
    const found = getDefined(run.settled);

    probed.set(key, (probed.get(key) ?? new Map()).set(id, found));

    return found;
  };
  // Whether the join the deciding run makes while this probe's changes are
  // pending stores what a join made after them does, so no order of
  // decisions changes the joined values.
  const joinKeeps = (
    key: string | Node,
    { left, right }: Halves,
    rightKeys: ReadonlySet<string>
  ) =>
    jsonEqual(
      valuesOf(
        decidedPropsOf(
          joinedShell(
            left.node,
            right.node,
            typeof key === 'string' ? key : null,
            dependencies,
            (name) => !rightKeys.has(name)
          )
        )
      ),
      { ...valuesOf(right.decided), ...valuesOf(left.decided) }
    );
  const rightKeysOf = ({ left, right }: Halves) =>
    new Set(
      [
        ...Object.keys(propsOf(right.node)),
        ...right.pending.flatMap((mark) =>
          mark.kind === 'format' ? [mark.key] : []
        ),
      ].filter((name) => !supplies(left, name))
    );
  /**
   * The verdict on a rejected cut, or 'wait' once its touching changes join
   * this run's waits. `left` is the left half as the stored tree holds it.
   */
  const cutVerdict = (
    key: string | Node,
    left: Node,
    halves: Halves,
    around: Around
  ): Verdict | 'wait' => {
    let rightKeys: ReadonlySet<string> | undefined;
    const result = verdictOf(schema?.ownership ?? null, halves, around, {
      pendingOf,
      probe: probe
        ? null
        : (assignment) =>
            probeUnder(
              assignment,
              key,
              left,
              (rightKeys ??= rightKeysOf(halves))
            ),
      survives,
    });

    if (probe?.key === key) {
      probe.settled =
        probe.left !== left
          ? { verdict: 'apart' }
          : 'verdict' in result &&
              result.verdict === 'together' &&
              !joinKeeps(key, halves, probe.rightKeys)
            ? { waits: [] }
            : result;
    }
    if ('waits' in result) {
      for (const change of result.waits) waits.add(change);

      return 'wait';
    }

    return result.verdict;
  };
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

  // Phase one: where each decided join lands.
  const mergedInto = new Map<Node, Node>();
  const mergedBlocks = new Map<Node, Node[]>();
  const emptiedTargets = new Set<Node>();
  const standsFor = new Map<Node, Node>();
  const standsIn = new Set<Node>();
  const lastIn = (links: ReadonlyMap<Node, Node>) => (node: Node) => {
    let current = node;

    for (let next = links.get(current); next; next = links.get(current)) {
      current = next;
    }

    return current;
  };
  const finalOf = lastIn(mergedInto);
  const standingOf = lastIn(standsFor);
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
  const rejoinsSplit = (node: Node) =>
    pending(node).some(
      (mark) => mark.kind === 'split' && resultOf(mark) === 'reject'
    );
  // The rejected split a block rejoins the line before it by, unless an
  // accepted join merges it whatever the halves read.
  const rejectedSplitOf = (claims: readonly AuthoredMark[]) =>
    claims.some((mark) => mark.kind === 'join' && resultOf(mark) === 'accept')
      ? undefined
      : claims.find(
          (mark) =>
            mark.kind === 'split' &&
            mark.cut === undefined &&
            resultOf(mark) === 'reject'
        );
  // Each rejoined block, with the target's half it was judged against.
  const rejoined = new Map<Node, Half>();
  /**
   * The left half a rejected block split rejoins `into` with, or null when
   * the halves stay apart or wait. `own` and `target` are the blocks'
   * claims, which phase one already read.
   */
  const rejoinOf = (
    cut: AuthoredMark,
    node: Node,
    own: readonly AuthoredMark[],
    into: Node,
    target: readonly AuthoredMark[],
    ancestors: readonly Node[]
  ): Half | null => {
    const chain: readonly Node[] = [...[...ancestors].reverse(), ...site];
    const place = placeUnder(chain);
    const left = halfOf(into, target, place);
    // A save from before the recorder tagged the continuation's type shows
    // only the type Editing's split would have forced there.
    const typed = own.some(
      (mark) =>
        mark.kind === 'format' &&
        mark.key === 'type' &&
        mark.change === cut.change
    );
    const forced =
      typed || !schema?.continuationType
        ? null
        : schema.continuationType(
            { ...left.props, children: into.children ?? [] } as JsonNode,
            (ancestors.at(-1)?.children ?? children).indexOf(node),
            chain,
            root
          );

    return cutVerdict(
      node,
      into,
      {
        change: cut.change,
        forced,
        left,
        place,
        right: halfOf(node, own, place),
      },
      { between: [], met: true, place: chain }
    ) === 'together'
      ? left
      : null;
  };
  // Where the decided join on `node` lands in its target `into`, and the
  // pending marks that landing reads. An accepted join merges into the
  // target, which keeps its type and properties whatever it still shows. A
  // rejected split rejoins into the piece before it while that piece keeps
  // content. Otherwise that piece goes with its pending marks, and the
  // joining piece keeps its own type and properties, as Editing's merge of
  // an empty line does.
  const landingOf = (node: Node, into: Node) => {
    if (!rejoinsSplit(node)) return { merges: true, reads: [] };

    // Content no pending change touches keeps the piece either way.
    const reads = (into.children ?? []).some(keptContent)
      ? []
      : (into.children ?? []).flatMap(contentMarksIn);

    return keepsContent(into, joinOf(node))
      ? { merges: true, reads }
      : { merges: false, reads: [...reads, ...subtreeMarks(into)] };
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
    const cutFrom = rejoinsSplit(node)
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
    const landing = landingOf(node, into);

    // The target's own pending content and enclosure decide whether the join
    // reaches it.
    const intoClaims = pending(into);

    waited.push(
      ...intoClaims.filter((mark) =>
        CONTENT_AND_ENCLOSURE_KINDS.has(mark.kind)
      ),
      ...landing.reads
    );
    if (!landing.merges) {
      land(() => {
        emptiedTargets.add(into);
        standsFor.set(into, node);
        standsIn.add(node);
      });
      return;
    }
    const own = pending(node);
    const cut = rejectedSplitOf(own);
    const left = cut && rejoinOf(cut, node, own, into, intoClaims, ancestors);

    // A rejected split waits only on what its verdict reads. An accepted join
    // lands with the block's own pending marks, which decide with it.
    if (!cut) waited.push(...own);
    else if (!left) {
      land();
      return;
    }
    land(() => {
      if (left) rejoined.set(node, left);
      mergedInto.set(node, into);
      mergedBlocks.set(into, [...(mergedBlocks.get(into) ?? []), node]);
    });
  });

  if (probe && typeof probe.key !== 'string') {
    probe.settled ??= { verdict: survives(probe.left) ? 'apart' : 'gone' };

    return null;
  }

  // A block that goes with an accepted join lands right after the joined
  // line, wherever the join takes it.
  const placedAfter = new Map<Node, Node[]>();
  const placed = new Set<Node>();

  for (const { follows, node, order } of followers) {
    const claims = pending(node).filter((mark) => followsOf(mark));

    if (
      rejoinsSplit(node) ||
      mergedInto.has(node) ||
      standsIn.has(node) ||
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
    const anchor = mergedInto.has(source.node)
      ? standingOf(finalOf(source.node))
      : standsIn.has(source.node)
        ? standingOf(source.node)
        : null;

    if (anchor && resultOf(source.mark) === 'accept') {
      placed.add(node);
      placedAfter.set(anchor, [...(placedAfter.get(anchor) ?? []), node]);
      continue;
    }
    if (emptiedTargets.has(node)) continue;
    if (!claims.some((mark) => resultOf(mark) === 'accept')) continue;
    if (claims.some((mark) => isEditingChange(mark.change))) {
      if (decisionOf(source.mark) === 'keep') retainedFollowers.add(node);
    } else {
      wait([source.mark]);
    }
  }

  const movedWith = (node: Node): Node[] => {
    if (!emptiedTargets.has(node)) {
      return [node, ...(mergedBlocks.get(node) ?? [])];
    }

    const line = standsFor.get(node);

    return [node, ...(line ? movedWith(line) : [])];
  };

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

  // A rejected cut joins only fragments that end up in one block. Its
  // fragments in two blocks stay apart, unless a pending change could bring
  // them together.
  const cutSides = new Map<
    string,
    {
      end?: number;
      endNode?: Node;
      start?: number;
      startNode?: Node;
      tag: CutTag;
    }
  >();
  const collectCuts = (nodes: readonly Node[], index: number) => {
    for (const child of nodes) {
      for (const cut of cutsOf(child)) {
        const sides = cutSides.get(cut.cut) ?? { tag: cut };

        sides[cut.side] = index;
        sides[cut.side === 'end' ? 'endNode' : 'startNode'] = child;
        cutSides.set(cut.cut, sides);
      }
      if (child.children) collectCuts(child.children, index);
    }
  };

  blocks.forEach(({ node }, index) => collectCuts(node.children ?? [], index));
  const joinsCuts = [...cutSides.values()].some(
    ({ tag }) => decisionOf(tag) === 'reject'
  );
  const lineChain = ({ ancestors, node }: TextBlock): readonly Node[] => [
    node,
    ...[...ancestors].reverse(),
    ...site,
  ];

  for (const { end, endNode, start, startNode, tag } of cutSides.values()) {
    if (
      end === undefined ||
      start === undefined ||
      !endNode ||
      !startNode ||
      end >= start ||
      decisionOf(tag) !== 'reject' ||
      finalOf(getDefined(blocks[start]).node) ===
        finalOf(getDefined(blocks[end]).node)
    ) {
      continue;
    }
    const left = lineChain(getDefined(blocks[end]));
    const right = lineChain(getDefined(blocks[start]));
    const place = placeUnder(left);

    cutVerdict(
      tag.cut,
      endNode,
      {
        change: tag.change,
        forced: null,
        left: halfOf(endNode, pending(endNode), place),
        place,
        right: halfOf(startNode, pending(startNode), placeUnder(right)),
      },
      {
        between: blocks.slice(end + 1, start).map(({ node }) => node),
        met: false,
        place: [...left, ...right],
      }
    );
  }

  if (probe?.settled) return null;

  // A node resolved under a parent other than its stored one is content a
  // decision moved, judged at its new place. Only a merge, a rejected cut's
  // join or a landing moves content, so a run with none never indexes parents.
  const movesContent =
    mergedBlocks.size > 0 ||
    joinsCuts ||
    placedAfter.size > 0 ||
    standsFor.size > 0;
  let storedParents: WeakMap<Node, Node | null> | null = null;
  const storedParentOf = (node: Node) => {
    if (!storedParents) {
      const parents = new WeakMap<Node, Node | null>();
      const index = (nodes: readonly Node[], parent: Node | null) => {
        for (const child of nodes) {
          parents.set(child, parent);
          if (child.children) index(child.children, child);
        }
      };

      index(children, null);
      storedParents = parents;
    }

    return storedParents.get(node);
  };
  const movedFrom = (owner: Node | null, original: Node) =>
    movesContent && storedParentOf(original) !== owner;

  const moves: Array<Readonly<{ after: Node; node: Node }>> = [];
  const shown = new WeakSet<Node>();
  const unwrapped = new WeakSet<Node>();
  const hidden = new Set<Node>();
  const pieceSubtrees = new WeakMap<Node, WeakSet<Node>>();
  const inPiece = (piece: Node, node: Node) => {
    let nodes = pieceSubtrees.get(piece);

    if (!nodes) {
      nodes = subtreesOf([piece]);
      pieceSubtrees.set(piece, nodes);
    }

    return nodes.has(node);
  };

  // Phase two: rebuild the document with decided content removed.
  const resolveList = (
    input: readonly Node[],
    /** The stored element whose children `input` stands for; null at the top. */
    owner: Node | null,
    parentType: string | null,
    ancestors: readonly string[],
    path: readonly number[],
    landing = false,
    landingBlock: Node | null = null,
    placeChangedAbove = false,
    above: readonly Node[] = []
  ): Readonly<{ changed: boolean; dirty: number[]; list: Node[] }> => {
    const out: Node[] = [];
    const dirty: number[] = [];
    const place = { outerTypes: ancestors, parentType, root };
    const { joined, nodes } = joinsCuts
      ? joinRejectedCuts(input, {
          dependencies,
          endSurvives: (cut) => {
            const end = cutSides.get(cut)?.endNode;

            return end !== undefined && survives(end);
          },
          join: ({ between, cut, left, original, right }) => {
            const halves = {
              change: cut.change,
              forced: null,
              left: halfOf(left, pending(left), place),
              place,
              right: halfOf(right, pending(right), place),
            };

            return cutVerdict(cut.cut, original, halves, {
              between,
              met: true,
              place: above,
            }) === 'together'
              ? (key: string) => supplies(halves.left, key)
              : null;
          },
          rejected: (cut) => resultOf(cut) === 'reject',
          schema: schema?.ownership ?? null,
          survives,
        })
      : { joined: new Map<Node, Node>(), nodes: input };
    let restructured = joined.size > 0;
    let changed = false;
    const landHere = (pieces: readonly Node[]) => {
      const landed = resolveList(
        pieces,
        owner,
        parentType,
        ancestors,
        path,
        true,
        null,
        placeChangedAbove,
        above
      );

      for (const at of landed.dirty) dirty.push(out.length + at);
      out.push(...landed.list);
    };
    const land = (anchor: Node) => {
      const pieces = placedAfter.get(anchor);

      if (!pieces) return;

      let after = getDefined(movedWith(anchor).at(-1));

      // Each piece records the blocks merged into it as it resolves.
      for (const node of pieces) {
        moves.push({ after, node });
        after = node;
      }
      landHere(pieces);
      restructured = true;
    };

    for (const [index, node] of nodes.entries()) {
      if (probe?.settled) break;
      const shell = (mergedBlocks.get(node) ?? []).reduce((left, block) => {
        const judged = rejoined.get(block);

        if (!judged) return left;

        // A second rejoined block meets the shell the first one made.
        const supplier =
          judged.node === left ? judged : halfOf(left, pending(left), place);

        return joinedShell(left, block, null, dependencies, (key) =>
          supplies(supplier, key)
        );
      }, node);
      const marks = pending(shell);
      const stored = readMembers(shell);
      const original = joined.get(node) ?? node;
      const landedIn = landing ? node : landingBlock;

      if ((placed.has(node) || standsIn.has(node)) && !landing) {
        restructured = true;
        continue;
      }
      if (emptiedTargets.has(node)) {
        const line = standsFor.get(node);

        hidden.add(original);
        if (line) {
          moves.push({ after: node, node: line });
          landHere([line]);
        }
        restructured = true;
        continue;
      }
      if (mergedInto.has(node)) {
        restructured = true;
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
        else {
          restructured = true;
          hidden.add(original);
        }
        continue;
      }

      const props = propsOf(shell);
      const formats = decideFormats(
        props,
        marks,
        reading,
        isText(node)
          ? (candidate, key) =>
              schema?.canonicalizeTextProperties?.(
                candidate,
                parentType ? [parentType, ...ancestors] : [],
                root,
                key
              ) ?? candidate
          : undefined
      );

      for (const change of formats?.waits ?? []) waits.add(change);
      for (const tag of formats?.landed ?? []) {
        if (!facts.landed(tag.id)) landings.set(tag.id, landedOf(tag));
      }
      const decidedProps = formats?.props ?? props;
      const placeChanged =
        placeChangedAbove ||
        movedFrom(owner, original) ||
        typeOf(decidedProps) !== typeOf(props);
      const placedProps =
        schema && (placeChanged || formats?.changed)
          ? heldProps(schema.ownership, decidedProps, {
              outerTypes: ancestors,
              parentType,
              root,
              text: isText(node),
            })
          : decidedProps;

      const dropsValue = placedProps !== decidedProps;

      if (dropsValue) waitOnPlaceChanges([node, ...above]);

      const kept = keptMembers(shell, marks, (mark) => {
        const result = resultOf(mark);

        return mark.kind === 'format'
          ? (formats?.kept.has(mark) ?? false)
          : result === 'keep' ||
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
        props: placedProps,
      };
      const selfChanged =
        (formats?.changed ?? false) ||
        dropsValue ||
        formatted.kept.length !== stored.length ||
        formatted.kept.some((member, at) => member !== stored[at]);

      if (selfChanged) changed = true;
      shown.add(node);
      shown.add(original);
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

      // A landing block takes the blocks merged into its lines from outside
      // it, and a joined line takes its own ahead of the blocks that follow
      // it, so a block stored between them, such as a quote a follower was
      // wrapped in, shows after those blocks.
      if (landedIn || placedAfter.has(node)) {
        let after = node;

        for (const block of merged) {
          if (!landedIn || !inPiece(landedIn, block)) {
            moves.push({ after, node: block });
          }
          after = block;
        }
      }

      const lifts =
        structureOf(node).unwrap && !(unwrapsLine && outlived.length > 0);
      const {
        changed: childrenChanged,
        dirty: childDirty,
        list: resolved,
      } = resolveList(
        [
          ...(node.children ?? []),
          ...merged.flatMap((block) => block.children ?? []),
        ],
        original,
        lifts ? parentType : type,
        lifts || !parentType ? ancestors : [parentType, ...ancestors],
        [...path, index],
        false,
        landedIn,
        placeChanged || lifts,
        lifts ? above : [node, ...above]
      );
      const element = withMarks(
        { ...formatted.props, children: resolved },
        formatted.kept
      );

      if (lifts) {
        restructured = true;
        unwrapped.add(node);
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

  // A decision that builds waits on every pending change whose outcome
  // changes what it builds. A built element's properties can read any
  // ancestor, so it waits on each ancestor's pending restructuring.
  const waitOnBuild = (level: readonly Node[], at: readonly Node[]) => {
    const [parent, ...ancestors] = at;

    // The element's type picks the content its completion builds for.
    wait(
      pending(parent).filter(
        (mark) => isPlaceChange(mark) || mark.kind === 'delete'
      )
    );
    for (const child of level) {
      wait(pending(child).filter(isStructureChange));
    }
    for (const ancestor of ancestors) {
      wait(pending(ancestor).filter(isStructureChange));
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
    at: readonly Node[]
  ): Completion<Node> => {
    const marks = at.flatMap((node) =>
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
  // Each element at its final placement, children first. Only the given
  // children are a part of their list; each element below them holds all of
  // its own children.
  const completeLevel = (
    level: readonly Node[],
    at: readonly Node[],
    startLevel: readonly Node[],
    changed: boolean,
    dirty: readonly number[],
    listPart?: ListPart
  ): readonly Node[] => {
    let copy: Node[] | null = null;

    for (const index of dirty) {
      const node = getDefined(level[index]);
      const original = origins.get(node) as Node | undefined;
      const completed = completeLevel(
        node.children ?? [],
        [node, ...at],
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
      complete(
        items,
        at,
        startLevel,
        (slot, candidate) =>
          vacatesSlot(
            start,
            slot,
            origins.get(candidate) ?? candidate,
            isInserted
          ),
        listPart
      );
    const completion = underInsertions(completeHere(nodes), at);
    const slots = contentOf(at[0] ? typeOf(at[0]) : null)?.prefix ?? 0;

    if (completion.built.length > 0) {
      waitOnBuild(nodes, at);
    }
    if (slots > 0) {
      waitOnPrefix(nodes, completion, start, completeHere, slots);
    }

    return mergeTextsWithEqualProps(completion.children);
  };

  const top = resolveList(
    children,
    null,
    site[0] ? typeOf(site[0]) : null,
    site.slice(1).flatMap((node) => typeOf(node) ?? []),
    [],
    false,
    null,
    false,
    site
  );

  if (probe) {
    probe.settled ??= { verdict: survives(probe.left) ? 'apart' : 'gone' };

    return null;
  }
  // A line merged into a joined line shows only the content it keeps there.
  const placements = placementsOf(
    children,
    moves as readonly AuthoredPlacement[],
    (node) =>
      (shown.has(node) && !unwrapped.has(node)) ||
      (mergedInto.has(node) &&
        (node.children ?? []).some((child) => shown.has(child)))
  );
  const resolvedChildren = completeLevel(
    top.list,
    site,
    children,
    top.changed || top.list.length < (part?.min ?? 0),
    top.dirty,
    part
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
  const resolvedOf = (original: unknown) => {
    if (typeof original !== 'object' || original === null) return null;

    resolvedNodes ??= indexResolved(new Map(), resolvedChildren);

    return resolvedNodes.get(original) ?? null;
  };

  for (const node of removed ?? []) hidden.add(node);

  return {
    blockers: [...waits],
    children: resolvedChildren as readonly JsonNode[],
    decided: [...decided],
    diagnostics,
    hidden:
      hidden.size > 0
        ? hiddenBlocksOf(given, hidden, {
            lines: [
              ...[...mergedBlocks].map(([into, merged]) => ({
                first: into,
                head: standingOf(into),
                last: merged,
              })),
              ...[...standsFor].map(([target, line]) => ({
                first: target,
                head: standingOf(line),
                last: movedWith(target).slice(1),
              })),
            ],
            resolved: resolvedChildren,
            resolvedOf,
            shows: (node) => shown.has(node) && !unwrapped.has(node),
          })
        : [],
    landed: [...landings.values()],
    placements,
    resolvedOf: (original) => resolvedOf(original) as JsonNode | null,
    unplaceable,
  };
};

type Line = Readonly<{ first: Node; head: Node; last: readonly Node[] }>;

/**
 * Which shown block each block a decision hides whole collapses into. A
 * block stored between the pieces of a joined line collapses into that line,
 * unless a shown element holds the block and not the line's first piece, as
 * an emptied quote the line's pieces pass over does. Any other block
 * collapses into its nearest shown ancestor.
 */
const hiddenBlocksOf = (
  given: readonly JsonNode[],
  hidden: ReadonlySet<Node>,
  {
    lines,
    resolved,
    resolvedOf,
    shows,
  }: Readonly<{
    lines: readonly Line[];
    resolved: readonly Node[];
    resolvedOf: (original: unknown) => Node | null;
    shows: (node: Node) => boolean;
  }>
): AuthoredHiddenBlock[] => {
  type Spot = { at: number; end: number; parent: Node | null; path: number[] };
  const places = new Map<Node, Spot>();
  let count = 0;
  const walk = (
    nodes: readonly Node[],
    parent: Node | null,
    path: readonly number[]
  ) => {
    for (const [index, node] of nodes.entries()) {
      if (isText(node)) continue;

      const place = { at: count, end: 0, parent, path: [...path, index] };

      count += 1;
      places.set(node, place);
      walk(node.children ?? [], node, place.path);
      place.end = count - 1;
    }
  };

  walk(given, null, []);

  const spans = lines.flatMap(({ first, head, last }) => {
    const start = places.get(first);

    return start
      ? [
          {
            first,
            head,
            start: start.at,
            to: Math.max(...last.map((node) => places.get(node)?.at ?? -1)),
          },
        ]
      : [];
  });
  let outputPaths: Map<Node, readonly number[]> | null = null;
  const outputPathOf = (node: Node) => {
    if (!outputPaths) {
      const paths = new Map<Node, readonly number[]>();
      const index = (nodes: readonly Node[], path: readonly number[]) => {
        for (const [at, child] of nodes.entries()) {
          if (isText(child)) continue;
          paths.set(child, [...path, at]);
          index(child.children ?? [], [...path, at]);
        }
      };

      index(resolved, []);
      outputPaths = paths;
    }

    const output = resolvedOf(node);

    return (output && outputPaths.get(output)) ?? null;
  };

  return [...hidden].flatMap((node) => {
    const place = places.get(node);

    if (!place) return [];

    let container = place.parent;

    while (container && !shows(container)) {
      container = places.get(container)?.parent ?? null;
    }

    const box = container ? places.get(container) : undefined;
    let owner = container;
    let from = -1;

    for (const line of spans) {
      if (
        (line.first === node ||
          (line.start < place.at && place.at < line.to)) &&
        line.start > from &&
        (!box || (box.at < line.start && line.start <= box.end))
      ) {
        owner = line.head;
        from = line.start;
      }
    }

    return [{ at: place.path, owner: owner && outputPathOf(owner) }];
  });
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
  reading: KeyReading,
  canonicalize?: (props: JsonRecord, key: string) => Readonly<JsonRecord>
) => {
  if (!marks.some((mark) => mark.kind === 'format')) return null;

  const kept = new Set<AuthoredMark>();
  const landed: FormatTag[] = [];
  const waits: string[] = [];
  const keys = new Set(
    marks.flatMap((mark) => (mark.kind === 'format' ? [mark.key] : []))
  );
  const next: JsonRecord = { ...props };
  let changed = false;

  for (const key of keys) {
    const tags = marks.filter(
      (mark): mark is FormatTag => mark.kind === 'format' && mark.key === key
    );
    const decision = decideKey(tags, reading);

    waits.push(...decision.waits);
    landed.push(...decision.landed);
    for (const tag of decision.kept) kept.add(tag);
    if (decision.value.kind !== 'set') {
      if (
        decision.waits.length > 0 ||
        Object.hasOwn(props, key) ||
        !canonicalize
      ) {
        continue;
      }
      const value = tipsWrittenValue(tags);
      if (value === undefined) continue;
      const candidate = { ...props, [key]: value };
      const fitted = canonicalize(candidate, key);
      if (
        !Object.keys(props).some((sibling) => !Object.hasOwn(fitted, sibling))
      ) {
        continue;
      }
      next[key] = value;
      changed = true;
      continue;
    }
    changed = true;
    if (decision.value.value === undefined) delete next[key];
    else next[key] = decision.value.value;
  }

  return { changed, kept, landed, props: next, waits };
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
  options: Readonly<{ stores?: boolean; withdraws?: boolean }> = {}
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
  const changedRoots = new Map<string, undefined>(
    roots.flatMap(([root, resolution]) =>
      resolution.children === value.roots?.[root] ? [] : [[root, undefined]]
    )
  );

  if (main.children !== value.children) changedRoots.set('main', undefined);

  const dropped = new Set(
    schema && changedRoots.size > 0
      ? orphanedValueRoots(
          schema.ownership,
          value,
          {
            children: main.children,
            roots: Object.fromEntries(
              roots.map(([root, resolution]) => [root, resolution.children])
            ),
          },
          changedRoots
        )
      : []
  );
  const kept = roots.filter(([root]) => !dropped.has(root));
  const live = [main, ...kept.map(([, resolution]) => resolution)];
  const byRoot = new Map([['main', main], ...kept]);
  const base = dropped.size > 0 ? withoutValueRoots(value, dropped) : value;

  return {
    blockers: [...new Set(all.flatMap((resolution) => resolution.blockers))],
    decided: [...new Set(all.flatMap((resolution) => resolution.decided))],
    diagnostics: live.flatMap((resolution) => resolution.diagnostics),
    landed: live.flatMap((resolution) => resolution.landed),
    resolvedIn: (root: string) => byRoot.get(root)?.resolvedOf ?? null,
    resolvedOf: (original: unknown) =>
      live.reduce<JsonNode | null>(
        (found, resolution) => found ?? resolution.resolvedOf(original),
        null
      ),
    unplaceable: live.some((resolution) => resolution.unplaceable),
    value: deriveValue(
      base,
      {
        children: main.children,
        ...(base.roots
          ? {
              roots: Object.fromEntries(
                kept.map(([root, resolution]) => [root, resolution.children])
              ),
            }
          : {}),
      },
      composeRecordOps(
        putContexts(dependencies.minted()),
        putLanded(live.flatMap((resolution) => resolution.landed))
      )
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
    projection === 'proposed' ? 'accept' : 'reject',
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
