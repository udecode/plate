import {
  createInternalDocumentChange,
  DocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentRootChange,
} from '../../core/change/document-change';
import { DocumentIndex } from '../../core/change/document-index';
import { deepFreeze, jsonEqual, type JsonRecord } from '../../core/change/json';
import {
  type DocumentSetPropertyResolver,
  RootChange,
  type RootChangeSection,
} from '../../core/change/root-change';
import {
  type JsonEditorValue,
  type JsonNode,
  type JsonToken,
  type OpenToken,
  PreparedTokenSlice,
  PreparedTokenSliceStructureError,
} from '../../core/change/tokens';
import { deriveValue } from '../../core/record-store';
import { survivalUnder } from '../../core/survival';
import { marksOf, type ReviewFacts } from '../facts/facts';
import { countLedgerWork } from '../ledger/work';
import {
  AUTHORED_MARKS_KEY,
  type AuthoredMark,
  isAuthoredSetValued,
  readAuthoredMarks,
} from './marks';
import { proposedSurvival } from './proposed';
import {
  acceptedOwnShape,
  failInTests,
  hasJoinMark,
  isTextBlock,
  mergesUp,
  removes,
} from './resolve';

export type AlignmentOptions = Readonly<{
  isSetValued?: DocumentSetPropertyResolver;
}>;

const { survives } = proposedSurvival;

const withoutStruckChildren = (
  children: readonly JsonNode[]
): readonly JsonNode[] =>
  children
    .filter(survives)
    .map((node) =>
      node.children
        ? { ...node, children: withoutStruckChildren(node.children) }
        : node
    );

const withoutStruck = (value: JsonEditorValue): JsonEditorValue =>
  deriveValue(value, {
    children: withoutStruckChildren(value.children),
    ...(value.roots
      ? {
          roots: Object.fromEntries(
            Object.entries(value.roots).map(([root, children]) => [
              root,
              withoutStruckChildren(children),
            ])
          ),
        }
      : {}),
  });

const UNSET_MARKS = Object.freeze([
  Object.freeze({ key: AUTHORED_MARKS_KEY, type: 'unset' as const }),
]);

const leafProps = (node: JsonNode) => {
  const { [AUTHORED_MARKS_KEY]: _marks, text: _text, ...props } = node;

  return props;
};

const tokenLengths = new WeakMap<object, number>();
/** A node's length in tokens, memoized per node. */
export const tokenLength = (node: JsonNode): number => {
  let value = tokenLengths.get(node);

  if (value === undefined) {
    value =
      typeof node.text === 'string'
        ? node.text.length + 2
        : (node.children ?? []).reduce(
            (sum, child) => sum + tokenLength(child),
            2
          );
    tokenLengths.set(node, value);
  }

  return value;
};

/**
 * A settled tree and the elements in it that no stored node becomes, which
 * completion built. The map adds those instead of pairing them.
 */
export type Settled = Readonly<{
  children: readonly JsonNode[];
  unstored: ReadonlySet<JsonNode>;
}>;

export const NOTHING_UNSTORED: ReadonlySet<JsonNode> = Object.freeze(
  new Set<JsonNode>()
);

const setAside = (
  children: readonly JsonNode[],
  unstored: ReadonlySet<JsonNode>
) => {
  let found = 0;
  let position = 0;
  let read = 0;
  let removed = 0;
  const spans: Array<{ at: number; nodes: JsonNode[]; to: number }> = [];
  const count = (node: JsonNode) => {
    read += 1;
    if (unstored.has(node)) found += 1;
    node.children?.forEach(count);
  };
  const strip = (nodes: readonly JsonNode[]): readonly JsonNode[] => {
    let out: JsonNode[] | null = null;

    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      const length = tokenLength(node);

      if (unstored.has(node)) {
        count(node);

        const last = spans.at(-1);

        if (last && last.to === position) {
          last.nodes.push(node);
          last.to += length;
        } else {
          spans.push({
            at: position - removed,
            nodes: [node],
            to: position + length,
          });
        }
        position += length;
        removed += length;
        out ??= nodes.slice(0, index);
        continue;
      }

      let kept = node;

      read += 1;
      if (typeof node.text === 'string') {
        position += length;
      } else {
        position += 1;

        const inner = strip(node.children ?? []);

        position += 1;
        if (inner !== node.children) kept = { ...node, children: inner };
      }
      if (kept !== node) out ??= nodes.slice(0, index);
      out?.push(kept);
    }

    return out ?? nodes;
  };
  const reduced = strip(children);

  countLedgerWork('setAsideNodes', read);

  const restore = (): RootChange | null => {
    if (spans.length === 0) return null;

    const sections: number[] = [];
    const data: Array<PreparedTokenSlice | null> = [];
    let at = 0;

    for (const span of spans) {
      if (span.at > at) {
        sections.push(span.at - at, -1);
        data.push(null);
      }

      const insert = DocumentIndex.fromValue(span.nodes).slice(0);

      sections.push(0, insert.length);
      data.push(insert);
      ({ at } = span);
    }

    const length = position - removed;

    if (length > at) {
      sections.push(length - at, -1);
      data.push(null);
    }

    return RootChange.fromSections(sections, data);
  };

  return { found, reduced, restore };
};

type Align = (
  stored: JsonEditorValue,
  settled: JsonEditorValue
) => DocumentChange | null;

export const settledChange = (
  stored: JsonEditorValue,
  { children, unstored }: Settled,
  align: Align
) => {
  if (unstored.size === 0) return align(stored, { children });

  const aside = setAside(children, unstored);
  const change = align(stored, { children: aside.reduced });
  const restore = aside.restore();

  if (aside.found !== unstored.size) {
    failInTests(
      `The settled tree holds ${aside.found} of the ${unstored.size} elements completion built.`
    );
  }

  return change && restore
    ? change.compose(createInternalDocumentChange(new Map([['main', restore]])))
    : change;
};

// The accept-all change of kept top-level blocks, built in one token walk:
// struck nodes and the boundary each join removes leave, equal neighboring
// leaves merge, and marks unset. Null when the result is not the resolver's,
// such as a join whose emptied first line gives way to the second.
const structuralChange = (
  blocks: readonly JsonNode[],
  accepted: readonly JsonNode[]
): RootChange | null => {
  // 0 keeps a token, 1 drops it, 2 keeps it and unsets its marks.
  const ops: number[] = [];
  type Leaf = { close: number; node: JsonNode } | null;
  // The last kept leaf a following leaf can merge with, and the last leaf of
  // the previous kept block, which a joined block's first leaf meets.
  let leaf: Leaf = null;
  let blockEnd: Leaf = null;

  const visit = (node: JsonNode, top: boolean): boolean => {
    const shape = acceptedOwnShape(node);

    if (shape === 'drop') {
      if (top) return false;
      for (let index = tokenLength(node); index > 0; index -= 1) ops.push(1);
      return true;
    }
    if (shape === 'bail') return false;

    const marked = readAuthoredMarks(node).length > 0;

    if (typeof node.text === 'string') {
      if (leaf && jsonEqual(leafProps(leaf.node), leafProps(node))) {
        ops[leaf.close] = 1;
        ops.push(1);
      } else {
        ops.push(marked ? 2 : 0);
      }
      for (let index = node.text.length; index > 0; index -= 1) ops.push(0);
      leaf = { close: ops.length, node };
      ops.push(0);
      return true;
    }
    const unwraps = shape === 'liftChildren';

    if (shape === 'mergeUp' && ops.length > 0) {
      ops[ops.lastIndexOf(0)] = 1;
      ops.push(1);
      leaf = blockEnd;
    } else if (unwraps) {
      ops.push(1);
    } else {
      ops.push(marked ? 2 : 0);
      leaf = null;
    }
    for (const child of node.children ?? []) {
      if (!visit(child, false)) return false;
    }

    const end = leaf;

    ops.push(unwraps ? 1 : 0);
    if (!unwraps) {
      leaf = null;
      blockEnd = end;
    }
    return true;
  };

  for (const block of blocks) if (!visit(block, true)) return null;

  const sections: number[] = [];
  const data: Array<PreparedTokenSlice | null | typeof UNSET_MARKS> = [];

  for (let index = 0; index < ops.length;) {
    const op = ops[index];

    if (op === 2) {
      sections.push(1, -2);
      data.push(UNSET_MARKS);
      index += 1;
      continue;
    }
    let end = index + 1;

    while (end < ops.length && ops[end] === op) end += 1;
    sections.push(end - index, op === 0 ? -1 : 0);
    data.push(op === 0 ? null : PreparedTokenSlice.empty);
    index = end;
  }

  const change = RootChange.fromSections(sections, data);

  // A join after a block whose last line sits inside a container leaves the
  // ops unbalanced, which the generic paths handle.
  try {
    return jsonEqual(
      change.apply(DocumentIndex.fromIndexedNodes(blocks)).value,
      accepted
    )
      ? change
      : null;
  } catch (error) {
    if (error instanceof PreparedTokenSliceStructureError) return null;
    throw error;
  }
};

// The characters of the leaves `removed` keeps, at their token positions. It
// walks the nodes, not the index's tokens, because an index copies the marks
// it reads and `removed` matches marks by identity.
const liveCharacters = (
  index: DocumentIndex,
  nodes: readonly JsonNode[],
  removed: (node: unknown) => boolean
) => {
  const positions: number[] = [];
  let text = '';
  const visit = (list: readonly JsonNode[], path: readonly number[]) => {
    list.forEach((node, at) => {
      if (typeof node.text !== 'string') {
        visit(node.children ?? [], [...path, at]);
        return;
      }
      if (removed(node)) return;

      const { from } = index.nodeRange([...path, at]);

      for (let offset = 0; offset < node.text.length; offset += 1) {
        positions.push(from + 1 + offset);
      }
      text += node.text;
    });
  };

  visit(nodes, []);

  return { positions, text };
};

// The most token pairs the middle of a gap compares; past it, the middle is
// replaced whole.
const MIDDLE_LIMIT = 250_000;

const sameShape = (left: JsonToken, right: JsonToken) =>
  left.kind === 'text' || right.kind === 'text'
    ? left.kind === 'text' && right.kind === 'text' && left.text === right.text
    : left.kind === right.kind &&
      left.nodeKind === right.nodeKind &&
      (left.kind === 'close' ||
        (left.props as JsonRecord).type === (right as OpenToken).props.type);

const propertyDelta = (before: JsonRecord, after: JsonRecord) => {
  const set = Object.fromEntries(
    Object.entries(after).filter(
      ([key, value]) => !jsonEqual(before[key], value)
    )
  );
  const unset = Object.keys(before).filter((key) => !Object.hasOwn(after, key));

  return {
    ...(Object.keys(set).length > 0 ? { set } : {}),
    ...(unset.length > 0 ? { unset } : {}),
  };
};

/** How a decision settles a node by its own marks. */
export type SettledBy = Readonly<{
  joins: (node: unknown) => boolean;
  removes: (node: unknown) => boolean;
}>;

const acceptingAll: SettledBy = {
  joins: hasJoinMark,
  removes: (node) =>
    readAuthoredMarks(node).some((mark) => mark.kind === 'delete'),
};

/**
 * The change of the main root to its settled form aligned by characters: the
 * decision keeps each character no removed leaf holds, in order, so each one
 * keeps its place, and only the tokens between two of them change. Between
 * two characters, matching tokens at either end stay, with their props set to
 * the settled ones, and the rest is replaced. Null when the characters differ
 * or the change does not give `accepted`.
 */
export const characterAlignedChange = (
  stored: JsonEditorValue,
  accepted: JsonEditorValue,
  settledBy: SettledBy = acceptingAll
): DocumentChange | null => {
  if (stored.roots || accepted.roots) return null;

  const settled =
    settledBy === acceptingAll
      ? proposedSurvival
      : survivalUnder<JsonNode>(settledBy.removes);
  const before = DocumentIndex.fromValue(stored.children);
  const after = DocumentIndex.fromValue(accepted.children);
  const kept = liveCharacters(before, stored.children, settledBy.removes);
  const target = liveCharacters(after, accepted.children, () => false);

  if (kept.text !== target.text) return null;

  // No token of an element accepting removes has an accepted counterpart,
  // even where completion builds one like it, and neither has the open of a
  // joined element.
  const removed = new Uint8Array(before.length);
  // Nor have the closes of the text block a join merges into, of its last
  // text and of the elements around it up to the block before the joined
  // one, which close after the joined content.
  const dropCloses = (node: JsonNode, at: readonly number[]) => {
    removed[before.nodeRange(at).to - 1] = 1;

    const children = node.children ?? [];

    if (isTextBlock(node)) {
      if (typeof children.at(-1)?.text === 'string') {
        removed[before.nodeRange([...at, children.length - 1]).to - 1] = 1;
      }
      return;
    }

    const last = children.findLastIndex(
      (child) => typeof child.text !== 'string' && settled.survives(child)
    );

    if (last !== -1) dropCloses(children[last], [...at, last]);
  };
  const collect = (nodes: readonly JsonNode[], path: readonly number[]) => {
    let previous: number | null = null;

    nodes.forEach((node, index) => {
      if (typeof node.text === 'string') return;

      const at = [...path, index];
      const range = before.nodeRange(at);

      if (!settled.survives(node)) {
        removed.fill(1, range.from, range.to);
        return;
      }
      // A join lands in the block before it inside the same container, so
      // the first block of one keeps its open.
      if (settledBy.joins(node) && previous !== null) {
        removed[range.from] = 1;
        dropCloses(nodes[previous], [...path, previous]);
      }
      previous = index;
      collect(node.children ?? [], at);
    });
  };

  collect(stored.children, []);

  const sections: RootChangeSection[] = [];

  for (let index = 0; index <= kept.positions.length; index += 1) {
    const from = index === 0 ? 0 : kept.positions[index - 1] + 1;
    const to =
      index === kept.positions.length ? before.length : kept.positions[index];
    const afterFrom = index === 0 ? 0 : target.positions[index - 1] + 1;
    const afterTo =
      index === target.positions.length
        ? after.length
        : target.positions[index];
    const left = before.slice(from, to);
    const right = after.slice(afterFrom, afterTo);
    const at = (mine: number) =>
      mine < left.tokens.length ? from + left.offsets[mine] : to;
    const matches = (mine: number, theirs: number) =>
      removed[at(mine)] === 0 &&
      sameShape(left.tokens[mine], right.tokens[theirs]);
    // A join drops the earlier block's close, so the gap's end matches first.
    let tail = 0;

    while (
      tail < left.tokens.length &&
      tail < right.tokens.length &&
      matches(left.tokens.length - 1 - tail, right.tokens.length - 1 - tail)
    ) {
      tail += 1;
    }

    let head = 0;

    while (
      head < left.tokens.length - tail &&
      head < right.tokens.length - tail &&
      matches(head, head)
    ) {
      head += 1;
    }

    // Pairs of a kept token of `left` and its accepted token, in order: both
    // ends, then the longest run of matches between them.
    const pairs: Array<readonly [number, number]> = [];

    for (let mine = 0; mine < head; mine += 1) pairs.push([mine, mine]);

    const rows = left.tokens.length - tail - head;
    const columns = right.tokens.length - tail - head;

    if (rows > 0 && columns > 0 && rows * columns <= MIDDLE_LIMIT) {
      const width = columns + 1;
      const longest = new Int32Array((rows + 1) * width);

      for (let row = rows - 1; row >= 0; row -= 1) {
        for (let column = columns - 1; column >= 0; column -= 1) {
          longest[row * width + column] = matches(head + row, head + column)
            ? longest[(row + 1) * width + column + 1] + 1
            : Math.max(
                longest[(row + 1) * width + column],
                longest[row * width + column + 1]
              );
        }
      }
      for (let row = 0, column = 0; row < rows && column < columns;) {
        if (
          matches(head + row, head + column) &&
          longest[row * width + column] ===
            longest[(row + 1) * width + column + 1] + 1
        ) {
          pairs.push([head + row, head + column]);
          row += 1;
          column += 1;
        } else if (
          longest[(row + 1) * width + column] >=
          longest[row * width + column + 1]
        ) {
          row += 1;
        } else {
          column += 1;
        }
      }
    }
    for (let back = tail; back > 0; back -= 1) {
      pairs.push([left.tokens.length - back, right.tokens.length - back]);
    }
    pairs.push([left.tokens.length, right.tokens.length]);

    // Between two kept tokens the stored ones, struck letters included, give
    // way to the accepted ones, and each kept open takes the accepted props.
    const afterAt = (theirs: number) =>
      theirs < right.tokens.length
        ? afterFrom + right.offsets[theirs]
        : afterTo;
    let mine = 0;
    let theirs = 0;

    for (const [nextMine, nextTheirs] of pairs) {
      if (nextMine > mine || nextTheirs > theirs) {
        sections.push({
          from: at(mine),
          insert: after.slice(afterAt(theirs), afterAt(nextTheirs)),
          to: at(nextMine),
        });
      }

      const token = left.tokens[nextMine];
      const next = right.tokens[nextTheirs];

      if (
        nextMine < left.tokens.length &&
        token.kind === 'open' &&
        next.kind === 'open'
      ) {
        const properties = propertyDelta(token.props, next.props);

        if (Object.keys(properties).length > 0) {
          sections.push({ from: at(nextMine), properties });
        }
      }
      mine = nextMine + 1;
      theirs = nextTheirs + 1;
    }
  }

  const change = RootChange.create(before, sections);

  return jsonEqual(change.apply(before).value, accepted.children)
    ? createInternalDocumentChange(new Map([['main', change]]))
    : null;
};

/**
 * The change that accepts every pending change, built from the marks so a
 * position inside merged pieces keeps its place, or null when that walk does
 * not give `accepted`. The walk reads the main root alone.
 */
export const structuralAcceptedChange = (
  stored: JsonEditorValue,
  accepted: JsonEditorValue
): DocumentChange | null => {
  const change = stored.roots
    ? null
    : structuralChange(stored.children, accepted.children);

  return change && createInternalDocumentChange(new Map([['main', change]]));
};

type Outcome = 'accept' | 'reject';

export type Decision = Readonly<{
  facts: ReviewFacts;
  outcomes: Outcome | ReadonlyMap<string, Outcome>;
}>;

/**
 * The change from stored content to `decided`, the same content with each
 * pending change taken by `decision`, when it aligns: structural when the
 * walk reproduces it, else by characters, so a caret after a letter typed at
 * a pending join stays after it and every kept letter keeps its place.
 */
export const decidedAlignment = (
  stored: JsonEditorValue,
  decided: JsonEditorValue,
  { facts, outcomes }: Decision
): DocumentChange | null => {
  const outcomeOf = (mark: AuthoredMark) =>
    typeof outcomes === 'string' ? outcomes : outcomes.get(mark.change);
  // The structural walk models accepting, and a rejected move's two equal
  // copies can let it reproduce the result through the wrong one.
  const rejects =
    typeof outcomes === 'string'
      ? outcomes === 'reject'
      : [...outcomes.values()].includes('reject');

  return (
    (rejects ? null : structuralAcceptedChange(stored, decided)) ??
    characterAlignedChange(stored, decided, {
      joins: (node) =>
        marksOf(node, facts).some((mark) => mergesUp(mark, outcomeOf(mark))),
      removes: (node) =>
        marksOf(node, facts).some((mark) => removes(mark, outcomeOf(mark))),
    })
  );
};

const rootByRoot = (
  stored: JsonEditorValue,
  settled: JsonEditorValue,
  align: (stored: JsonEditorValue, settled: JsonEditorValue) => DocumentChange
): DocumentChange => {
  if (!stored.roots && !settled.roots) return align(stored, settled);

  const childrenOf = (value: JsonEditorValue, root: string) =>
    root === 'main' ? value.children : value.roots?.[root];
  const named = (value: JsonEditorValue) => Object.keys(value.roots ?? {});
  const changes = new Map<string, RootChange>();

  for (const root of ['main', ...named(stored)]) {
    const before = childrenOf(stored, root);
    const after = childrenOf(settled, root);

    if (!before || !after || before === after) continue;
    const change = getInternalDocumentRootChange(
      align({ children: before }, { children: after }),
      'main'
    );

    if (change && !change.empty) changes.set(root, change);
  }

  const only = (value: JsonEditorValue, other: JsonEditorValue) =>
    Object.fromEntries(
      Object.entries(value.roots ?? {}).filter(
        ([root]) => !childrenOf(other, root)
      )
    );
  const lifecycle = DocumentChange.between(
    {
      children: settled.children,
      roots: only(stored, settled),
    },
    {
      children: settled.children,
      roots: only(settled, stored),
    },
    { isSetValued: isAuthoredSetValued }
  );

  return createInternalDocumentChange(
    new Map([...changes, ...getInternalDocumentChangeEntries(lifecycle)]),
    { createRoots: lifecycle.createRoots, deleteRoots: lifecycle.deleteRoots }
  );
};

export const decidedContentChange = (
  stored: JsonEditorValue,
  decided: JsonEditorValue,
  decision: Decision
): DocumentChange =>
  rootByRoot(
    stored,
    decided,
    (from, to) =>
      decidedAlignment(from, to, decision) ??
      DocumentChange.between(from, to, { isSetValued: isAuthoredSetValued })
  );

/** The accept-all change when it aligns: structural, else by characters. */
export const acceptedAlignment = (
  stored: JsonEditorValue,
  accepted: JsonEditorValue
): DocumentChange | null =>
  structuralAcceptedChange(stored, accepted) ??
  characterAlignedChange(stored, accepted);

/**
 * The accept-all change as two diffs, struck nodes first, so a kept leaf
 * stays aligned, for content no alignment pairs.
 */
export const diffedAcceptedChange = (
  stored: JsonEditorValue,
  accepted: JsonEditorValue,
  options: AlignmentOptions
): DocumentChange => {
  const unstruck = deepFreeze(withoutStruck(stored));

  return DocumentChange.between(stored, unstruck, options).compose(
    DocumentChange.between(unstruck, accepted, options)
  );
};
