import type { Facts, Streams } from './effect-ledger';

export type Origin = string;

export type ElementIdentity = Readonly<{
  /** The element whose properties it carries: itself when its open is older, else what its first content's element carries. */
  carries: Origin;
  /** Itself when its open is a birth, then every element whose open, close or text it holds now, transitively, in document order. */
  continues: readonly Origin[];
}>;

export type Identity = Readonly<{
  elements: ReadonlyMap<Origin, ElementIdentity>;
  heirs: ReadonlyMap<Origin, readonly Origin[]>;
  /** Token id to its owner: an element owns its open and close, a text block owns its text tokens and letters. */
  owners: ReadonlyMap<Origin, Origin>;
}>;

const ownersOf = (facts: Facts, streams: Streams) => {
  const owners = new Map(facts.owners);
  for (const stream of streams.values()) {
    const opens: Origin[] = [];
    for (const token of stream) {
      if (token.kind === 'skip' || token.nodeKind !== 'element') continue;
      if (token.kind === 'open') {
        owners.set(token.id, token.id);
        opens.push(token.id);
      } else if (token.kind === 'close') {
        const open = opens.pop();
        if (open !== undefined) owners.set(token.id, open);
      }
    }
  }
  return owners;
};

const heirsOf = (elements: ReadonlyMap<Origin, ElementIdentity>) => {
  const heirs = new Map<Origin, Origin[]>();
  for (const [id, { continues }] of elements) {
    for (const origin of continues) {
      const into = heirs.get(origin);
      if (into === undefined) heirs.set(origin, [id]);
      else into.push(id);
    }
  }
  return heirs;
};

export const baseIdentity = (facts: Facts, streams: Streams): Identity => {
  const elements = new Map<Origin, ElementIdentity>();
  for (const id of facts.elements.keys()) {
    elements.set(id, { carries: id, continues: [id] });
  }
  return {
    elements,
    heirs: heirsOf(elements),
    owners: ownersOf(facts, streams),
  };
};

export const stepIdentity = (
  prior: Identity,
  facts: Facts,
  streams: Streams
): Identity => {
  const owners = ownersOf(facts, streams);
  const from = new Map<Origin, Origin[]>();
  for (const [token, owner] of owners) {
    const was = prior.owners.get(token);
    if (was === undefined || was === owner) continue;
    const list = from.get(owner);
    if (list === undefined) from.set(owner, [was]);
    else if (!list.includes(was)) list.push(was);
  }
  const elements = new Map<Origin, ElementIdentity>();
  for (const id of facts.elements.keys()) {
    const sources = from.get(id) ?? [];
    const known = prior.elements.get(id);
    const continues = new Set<Origin>(known ? known.continues : [id]);
    for (const source of sources) {
      for (const origin of prior.elements.get(source)?.continues ?? [source]) {
        continues.add(origin);
      }
    }
    const first = sources[0];
    elements.set(id, {
      carries: known
        ? known.carries
        : first === undefined
          ? id
          : (prior.elements.get(first)?.carries ?? first),
      continues: [...continues],
    });
  }
  return { elements, heirs: heirsOf(elements), owners };
};

export const withLineage = (
  identity: Identity,
  continues: (id: Origin) => readonly Origin[]
): Identity => {
  const elements = new Map<Origin, ElementIdentity>();
  for (const [id, { carries }] of identity.elements) {
    elements.set(id, { carries, continues: continues(id) });
  }
  return { elements, heirs: heirsOf(elements), owners: identity.owners };
};

export const renamedIdentity = (
  identity: Identity,
  rename: (id: Origin) => Origin
): Identity => {
  const elements = new Map<Origin, ElementIdentity>();
  for (const [id, { carries, continues }] of identity.elements) {
    elements.set(rename(id), {
      carries: rename(carries),
      continues: continues.map(rename),
    });
  }
  const owners = new Map<Origin, Origin>();
  for (const [token, owner] of identity.owners) {
    owners.set(rename(token), rename(owner));
  }
  return { elements, heirs: heirsOf(elements), owners };
};

type Lineage = Readonly<{ facts: Facts; identity: Identity }>;

export const alive = (fold: Lineage, origin: Origin): boolean =>
  fold.facts.letters.has(origin) ||
  (fold.identity.heirs.get(origin)?.length ?? 0) > 0;

const heirOf = (fold: Lineage, origin: Origin) =>
  fold.facts.letters.has(origin)
    ? origin
    : fold.identity.heirs.get(origin)?.[0];

/**
 * Whether the other side's deletion of `origin` takes the side's edit of it:
 * a change of its own facts, or a move that turned it past a block the other
 * side kept, unless the other side kept something the move carried or the
 * merge kept a birth of the side's that the move carried where the move put it.
 */
export const editTaken = (
  side: Readonly<{ intent: Intent }>,
  other: Lineage,
  origin: Origin,
  keptBirth: (id: Origin, past: ReadonlySet<Origin>) => boolean
): boolean => {
  const { intent } = side;
  if (intent.letters.has(origin) || intent.elements.has(origin)) return true;
  const move = intent.moves.get(origin);
  if (move === undefined) return false;
  for (const node of move.carried) {
    if (node === origin) continue;
    if (alive(other, node) || keptBirth(node, move.past)) return false;
  }
  return [...move.past].some((stood) => alive(other, stood));
};

export type Move = Readonly<{
  carried: ReadonlySet<Origin>;
  /**
   * The base blocks the head ends on the other side of, against where it
   * stood: base order for a base block, the order its birth step left for a
   * birth, which counts through the base blocks its lineage continues.
   */
  past: ReadonlySet<Origin>;
}>;

export type Intent = Readonly<{
  /** Elements whose carriers' properties, or whose carriers' parent lines, changed. */
  elements: ReadonlySet<Origin>;
  /** Letters whose own facts changed: marks or inline elements. */
  letters: ReadonlySet<Origin>;
  /** Each head a command of the side moved, read net over the side's steps. */
  moves: ReadonlyMap<Origin, Move>;
  /**
   * Each letter the side typed, by the base lines whose letters its line held
   * when the step that typed it ended, or by that line when it was an empty
   * base line.
   */
  typed: ReadonlyMap<Origin, ReadonlySet<Origin>>;
}>;

export const renamedIntent = (
  intent: Intent,
  rename: (id: Origin) => Origin
): Intent => {
  const moves = new Map<Origin, Move>();
  for (const [head, { carried, past }] of intent.moves) {
    moves.set(rename(head), {
      carried: new Set([...carried].map(rename)),
      past,
    });
  }
  return {
    elements: new Set([...intent.elements].map(rename)),
    letters: new Set([...intent.letters].map(rename)),
    moves,
    typed: new Map(
      [...intent.typed].map(([letter, lines]) => [rename(letter), lines])
    ),
  };
};

/** The heads one step moved, with what each carried, read from the trees the step's own change kept whole. */
export const movesOf = (
  trees: ReadonlyArray<readonly Origin[]>,
  before: Facts
): Map<Origin, ReadonlySet<Origin>> => {
  const moves = new Map<Origin, ReadonlySet<Origin>>();
  for (const tree of trees) {
    const [head] = tree;
    if (head === undefined || !before.elements.has(head)) continue;
    moves.set(head, new Set(tree));
  }
  return moves;
};

export type MoveStep = Readonly<{
  after: Facts;
  moved: ReadonlyMap<Origin, ReadonlySet<Origin>>;
}>;

const netMoves = (
  base: Facts,
  fold: Lineage,
  steps: readonly MoveStep[],
  isBase: (id: Origin) => boolean
) => {
  const final = fold.facts;
  const bornAt = new Map<Origin, number>();
  for (const [at, step] of steps.entries()) {
    for (const id of step.after.elements.keys()) {
      if (!isBase(id) && !bornAt.has(id)) bornAt.set(id, at);
    }
  }
  const factsAt = (at: number) => (at < 0 ? base : steps[at].after);
  const order = (facts: Facts, left: Origin, right: Origin) =>
    (facts.index.get(left) ?? -1) < (facts.index.get(right) ?? -1);
  const stepOf = (id: Origin) => (isBase(id) ? -1 : (bornAt.get(id) ?? -1));
  const carriedBy = new Map<Origin, Set<Origin>>();
  for (const { moved } of steps) {
    for (const [head, tree] of moved) {
      const into = carriedBy.get(head);
      if (into === undefined) carriedBy.set(head, new Set(tree));
      else for (const id of tree) into.add(id);
    }
  }
  const blocks = new Set<Origin>();
  for (const [id, fact] of base.elements) if (fact.block) blocks.add(id);
  for (const id of bornAt.keys()) {
    if (final.elements.get(id)?.block) blocks.add(id);
  }
  const moves = new Map<Origin, Move>();
  for (const [head, carried] of carriedBy) {
    const past = new Set<Origin>();
    moves.set(head, { carried, past });
    // A split at the head's end leaves an empty half that continues it too,
    // and the head stands where the tree the move carried stands.
    const here =
      fold.identity.heirs.get(head)?.find((heir) => carried.has(heir)) ??
      heirOf(fold, head);
    if (here === undefined) continue;
    const now = final.elements.get(here);
    for (const block of blocks) {
      if (block === head || carried.has(block)) continue;
      const there = heirOf(fold, block);
      if (there === undefined || there === here) continue;
      const ref = factsAt(Math.max(stepOf(head), stepOf(block)));
      const was = ref.elements.get(head);
      const stood = ref.elements.get(block);
      if (was === undefined || stood === undefined || stood.root !== was.root) {
        continue;
      }
      if (isAncestor(ref, block, head) || isAncestor(ref, head, block)) {
        continue;
      }
      if (isAncestor(final, there, here) || isAncestor(final, here, there)) {
        continue;
      }
      const thereNow = final.elements.get(there);
      if (now === undefined || thereNow === undefined) continue;
      if (now.root === was.root) {
        if (thereNow.root !== now.root) continue;
        if (order(ref, head, block) === order(final, here, there)) continue;
        // The pair counts for this head only when its own move made the last
        // turn, so a block another move took past it stays unmoved.
        let mover: boolean | undefined;
        let prior = order(ref, head, block);
        const from = Math.max(stepOf(head), stepOf(block)) + 1;
        for (let at = from; at < steps.length; at += 1) {
          const { after, moved } = steps[at];
          if (!after.elements.has(head) || !after.elements.has(block)) continue;
          const next = order(after, head, block);
          if (next !== prior) mover = moved.has(head);
          prior = next;
        }
        if (mover === false) continue;
      }
      // Which half of a split is new depends on where the caret sat, so a
      // birth counts through the base blocks its lineage continues.
      for (const origin of isBase(block)
        ? [block]
        : (fold.identity.elements.get(block)?.continues ?? []).filter(isBase)) {
        past.add(origin);
      }
    }
  }
  return moves;
};

const isAncestor = (facts: Facts, ancestor: Origin, id: Origin) => {
  let at = facts.elements.get(id)?.parent;
  while (at !== undefined) {
    if (at === ancestor) return true;
    at = facts.elements.get(at)?.parent;
  }
  return false;
};

export const intentOf = (
  base: Readonly<{ facts: Facts }>,
  fold: Lineage,
  steps: readonly MoveStep[],
  same: Readonly<{
    element: (
      left: Facts,
      leftId: Origin,
      right: Facts,
      rightId: Origin
    ) => boolean;
    letter: (left: Facts, right: Facts, id: Origin) => boolean;
  }>
): Intent => {
  const B = base.facts;
  const F = fold.facts;
  const letters = new Set<Origin>();
  for (const [id, was] of B.letters) {
    const now = F.letters.get(id);
    if (now === undefined) continue;
    if (now.inline !== was.inline || !same.letter(B, F, id)) letters.add(id);
  }
  const elements = new Set<Origin>();
  for (const [id, element] of F.elements) {
    const { carries } = fold.identity.elements.get(id) as ElementIdentity;
    const was = B.elements.get(carries);
    if (was === undefined) continue;
    if (!same.element(B, carries, F, id)) {
      elements.add(carries);
      continue;
    }
    const { parent } = element;
    // An unwrap edits only its container, so a child it lifts out answers to
    // the nearest base ancestor the side kept.
    let baseParent = was.parent;
    for (
      let up = B.elements.get(baseParent);
      up !== undefined && !alive(fold, baseParent);
      up = B.elements.get(baseParent)
    ) {
      baseParent = up.parent;
    }
    const lineHolds =
      element.root === was.root &&
      (parent === baseParent ||
        (fold.identity.elements.get(parent)?.continues.includes(baseParent) ??
          false));
    if (!lineHolds) elements.add(carries);
  }
  const typed = new Map<Origin, ReadonlySet<Origin>>();
  for (const { after } of steps) {
    for (const [id, letter] of after.letters) {
      if (B.letters.has(id) || typed.has(id)) continue;
      const lines = new Set(
        (after.blocks.get(letter.block) ?? []).flatMap((held) => {
          const line = B.letters.get(held)?.block;
          return line === undefined ? [] : [line];
        })
      );
      if (lines.size === 0 && B.elements.has(letter.block)) {
        lines.add(letter.block);
      }
      typed.set(id, lines);
    }
  }
  return {
    elements,
    letters,
    moves: netMoves(
      B,
      fold,
      steps,
      (id) => B.elements.has(id) || B.letters.has(id)
    ),
    typed,
  };
};
