import {
  createInternalDocumentChange,
  DocumentChange,
  getInternalDocumentRootChange,
} from '../../core/change/document-change';
import { DocumentIndex } from '../../core/change/document-index';
import { deepFreeze, jsonEqual, type JsonRecord } from '../../core/change/json';
import {
  addSection,
  type DocumentSetPropertyResolver,
  RootChange,
  type RootChangeSection,
  type SectionData,
} from '../../core/change/root-change';
import {
  type JsonEditorValue,
  type JsonNode,
  type JsonToken,
  type OpenToken,
  PreparedTokenSlice,
  PreparedTokenSliceStructureError,
} from '../../core/change/tokens';
import { survivalUnder } from '../../core/survival';
import { getDefined } from '../../internal/get-defined';
import { factsOf, type ReviewFacts } from '../facts/facts';
import { AUTHORED_MARKS_KEY, readAuthoredMarks } from './marks';
import { proposedSurvival } from './proposed';
import {
  acceptedOwnShape,
  type AuthoredResolveSchema,
  hasBoundaryMark,
  hasJoinMark,
  isTextBlock,
  projectAuthoredValue,
  resolveAuthoredChildren,
} from './resolve';

type Options = Readonly<{ isSetValued?: DocumentSetPropertyResolver }>;
type Projection = Readonly<{
  carried?: Readonly<{ change: RootChange; from: readonly JsonNode[] }>;
  change: DocumentChange;
  value: JsonEditorValue;
}>;
type Run = Readonly<{
  accepted: readonly JsonNode[];
  change: RootChange | null;
  nodes: readonly JsonNode[];
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

const withoutStruck = (value: JsonEditorValue): JsonEditorValue => ({
  ...value,
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
const tokenLength = (node: JsonNode): number => {
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

const liveCharacters = (
  tokens: PreparedTokenSlice,
  removes: (node: unknown) => boolean = (node) =>
    readAuthoredMarks(node).some((mark) => mark.kind === 'delete')
) => {
  const positions: number[] = [];
  let text = '';
  let live = true;

  tokens.tokens.forEach((token, index) => {
    if (token.kind === 'open' && token.nodeKind === 'text') {
      live = !removes(token.props);
    } else if (token.kind === 'text' && live) {
      for (let at = 0; at < token.text.length; at += 1) {
        positions.push(tokens.offsets[index] + at);
      }
      text += token.text;
    }
  });

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
  const kept = liveCharacters(before.tokens, settledBy.removes);
  const target = liveCharacters(after.tokens, () => false);

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
      if (settledBy.joins(node)) {
        removed[range.from] = 1;
        if (previous !== null) {
          dropCloses(nodes[previous], [...path, previous]);
        }
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

// The change from a stored run to its accepted form: structural when the
// walk reproduces the resolver, else aligned by characters, else two diffs,
// struck nodes first, so a kept leaf stays aligned.
const acceptedChange = (
  stored: JsonEditorValue,
  accepted: JsonEditorValue,
  options: Options
): DocumentChange => {
  const structural =
    structuralAcceptedChange(stored, accepted) ??
    characterAlignedChange(stored, accepted);

  if (structural) return structural;

  const unstruck = deepFreeze(withoutStruck(stored));

  return DocumentChange.between(stored, unstruck, options).compose(
    DocumentChange.between(unstruck, accepted, options)
  );
};

const projectWhole = (
  stored: JsonEditorValue,
  schema: AuthoredResolveSchema | null,
  options: Options
): Projection | null => {
  const accepted = deepFreeze(
    projectAuthoredValue(stored, 'proposed', schema).value
  );
  const change = acceptedChange(stored, accepted, options);

  return change.empty ? null : { change, value: accepted };
};

// A block with no marks anywhere in it: reading its few properties is cheaper
// than a memo lookup, so most blocks of a long document never enter a memo.
const bare = (node: JsonNode): boolean =>
  readAuthoredMarks(node).length === 0 &&
  (typeof node.text === 'string' || (node.children ?? []).every(bare));

const hasAuthoredMemo = new WeakMap<object, boolean>();
const hasAuthored = (node: JsonNode): boolean => {
  let value = hasAuthoredMemo.get(node);

  if (value === undefined) {
    value =
      readAuthoredMarks(node).length > 0 ||
      (node.children ?? []).some(hasAuthored);
    hasAuthoredMemo.set(node, value);
  }

  return value;
};

// A top-level block whose first line carries a join or split decides with the
// blocks before it.
const opensWithStructure = (node: JsonNode): boolean => {
  for (let current: JsonNode | undefined = node; current;) {
    if (hasBoundaryMark(current)) return true;
    if (typeof current.text === 'string') return false;
    current = current.children?.[0];
  }

  return false;
};

const isRemoved = (node: JsonNode): boolean =>
  !survives(node) && !hasBoundaryMark(node);

const deleting = (
  length: number,
  ranges: ReadonlyArray<readonly [number, number]>
) => {
  const sections: number[] = [];
  const data: Array<PreparedTokenSlice | null> = [];
  let at = 0;

  for (const [from, to] of ranges) {
    if (from > at) {
      sections.push(from - at, -1);
      data.push(null);
    }
    sections.push(to - from, 0);
    data.push(PreparedTokenSlice.empty);
    at = to;
  }
  if (length > at) {
    sections.push(length - at, -1);
    data.push(null);
  }

  return RootChange.fromSections(sections, data);
};

const resolveRun = (
  nodes: readonly JsonNode[],
  schema: AuthoredResolveSchema | null,
  options: Options,
  runByFirstNode: WeakMap<JsonNode, Run>,
  facts: ReviewFacts
): Run => {
  const cached = runByFirstNode.get(getDefined(nodes[0]));

  if (
    cached?.nodes.length === nodes.length &&
    cached.nodes.every((node, index) => node === nodes[index])
  ) {
    return cached;
  }

  const kept = nodes.filter((node) => !isRemoved(node));
  const ranges: Array<[number, number]> = [];
  let storedLength = 0;

  for (const node of nodes) {
    const length = tokenLength(node);

    if (isRemoved(node)) {
      const last = ranges.at(-1);

      if (last && last[1] === storedLength) last[1] += length;
      else ranges.push([storedLength, storedLength + length]);
    }
    storedLength += length;
  }

  const accepted =
    kept.length === 0 || !kept.some(survives)
      ? []
      : deepFreeze(
          resolveAuthoredChildren(kept, () => 'accept', schema, 'main', {
            facts,
          })
        ).children;
  let change: RootChange | null = null;

  if (kept.length > 0) {
    const local = acceptedChange(
      { children: kept },
      { children: accepted },
      options
    );

    change = local.empty
      ? null
      : (getInternalDocumentRootChange(local, 'main') ?? null);
  }
  if (ranges.length > 0) {
    const removal = deleting(storedLength, ranges);

    change = change ? removal.compose(change) : removal;
  }

  const run: Run = { accepted, change, nodes };

  runByFirstNode.set(getDefined(nodes[0]), run);

  return run;
};

type Segment = Readonly<{ from: number; run: Run; to: number }>;
type State = Readonly<{
  accepted: DocumentIndex;
  carried?: Projection['carried'];
  change: DocumentChange | null;
  segments: readonly Segment[];
  stored: readonly JsonNode[];
}>;

// Split `children[from, to)` into runs: a block that opens with a join or
// split links back past removed blocks to the nearest kept block, which it
// merges into. Neighboring removed blocks outside a run share one segment.
const segment = (
  children: readonly JsonNode[],
  from: number,
  to: number,
  schema: AuthoredResolveSchema | null,
  options: Options,
  runByFirstNode: WeakMap<JsonNode, Run>,
  facts: ReviewFacts
) => {
  const linked = new Uint8Array(to - from);
  const marked = new Uint8Array(to - from);

  for (let index = from; index < to; index += 1) {
    marked[index - from] = bare(children[index]) ? 0 : 1;
  }
  for (let index = from + 1; index < to; index += 1) {
    if (!marked[index - from] || !opensWithStructure(children[index])) continue;
    for (let back = index; back > from; back -= 1) {
      linked[back - from] = 1;
      if (!marked[back - 1 - from] || !isRemoved(children[back - 1])) break;
    }
  }

  const accepted: JsonNode[] = [];
  const segments: Segment[] = [];

  for (let index = from; index < to;) {
    let end = index + 1;

    while (end < to && linked[end - from]) end += 1;
    if (
      end === index + 1 &&
      marked[index - from] &&
      isRemoved(children[index])
    ) {
      while (
        end < to &&
        !linked[end - from] &&
        marked[end - from] &&
        isRemoved(children[end]) &&
        !(end + 1 < to && linked[end + 1 - from])
      ) {
        end += 1;
      }
    }

    if (end === index + 1 && !marked[index - from]) {
      accepted.push(children[index]);
    } else {
      const run = resolveRun(
        children.slice(index, end),
        schema,
        options,
        runByFirstNode,
        facts
      );

      accepted.push(...run.accepted);
      segments.push({ from: index, run, to: end });
    }
    index = end;
  }

  return { accepted, segments };
};

const acceptedIndexOf = (segments: readonly Segment[], index: number) =>
  segments.reduce(
    (at, { from, run, to }) =>
      to <= index ? at + run.accepted.length - (to - from) : at,
    index
  );

const changeOf = (
  stored: DocumentIndex,
  segments: readonly Segment[]
): RootChange | null => {
  const sections: number[] = [];
  const data: SectionData[] = [];
  let at = 0;

  for (const { from, run } of segments) {
    if (!run.change) continue;

    const start = stored.childPosition([], from);

    addSection(sections, data, start - at, -1, null);
    for (let index = 0; index < run.change.sections.length; index += 2) {
      addSection(
        sections,
        data,
        run.change.sections[index],
        run.change.sections[index + 1],
        run.change.data[index / 2]
      );
    }
    at = start + run.change.length;
  }
  if (sections.length === 0) return null;
  addSection(sections, data, stored.length - at, -1, null);

  return RootChange.fromSections(sections, data);
};

const finish = (
  stored: JsonEditorValue,
  storedIndex: DocumentIndex,
  accepted: DocumentIndex,
  segments: readonly Segment[],
  change = changeOf(storedIndex, segments)
): State => ({
  accepted,
  change: change
    ? createInternalDocumentChange(new Map([['main', change]]))
    : null,
  segments,
  stored: stored.children,
});

/**
 * The accepted projection for commands, memoized per top-level run and
 * carried from one stored document to the next: only the runs inside the
 * window where the two documents' top-level blocks differ resolve again, and
 * the accepted index takes one change there, so a key costs the same
 * however long the document is.
 */
export const createCommandProjector = (
  schemaOf: () => AuthoredResolveSchema | null,
  options: Options
) => {
  const runByFirstNode = new WeakMap<JsonNode, Run>();
  let state: State | null = null;

  const full = (stored: JsonEditorValue) => {
    const storedIndex = DocumentIndex.fromValue(stored.children);
    const { segments } = segment(
      stored.children,
      0,
      stored.children.length,
      schemaOf(),
      options,
      runByFirstNode,
      factsOf(stored)
    );
    const change = changeOf(storedIndex, segments);

    return finish(
      stored,
      storedIndex,
      change ? change.apply(storedIndex) : storedIndex,
      segments,
      change
    );
  };

  const carry = (previous: State, stored: JsonEditorValue): State => {
    const before = previous.stored;
    const after = stored.children;
    let start = 0;

    while (
      start < before.length &&
      start < after.length &&
      before[start] === after[start]
    ) {
      start += 1;
    }

    let tail = 0;

    while (
      tail < before.length - start &&
      tail < after.length - start &&
      before[before.length - 1 - tail] === after[after.length - 1 - tail]
    ) {
      tail += 1;
    }

    const shift = after.length - before.length;
    let from = start;
    let to = before.length - tail;

    for (let grown = true; grown;) {
      grown = false;
      for (const run of previous.segments) {
        if (run.from < Math.max(to, from + 1) && run.to > from) {
          if (run.from < from) {
            ({ from } = run);
            grown = true;
          }
          if (run.to > to) {
            ({ to } = run);
            grown = true;
          }
        }
      }
      // A block opening with a join reaches back past removed blocks to the
      // kept block it merges into, so the window does too, even when the
      // removed blocks open it.
      for (let first = from; from > 0; first = from) {
        while (first < after.length && isRemoved(after[first])) first += 1;
        if (first >= after.length || !opensWithStructure(after[first])) break;
        from -= 1;
        while (from > 0 && isRemoved(after[from])) from -= 1;
        grown = true;
      }
      for (let next = to + shift; next < after.length; next += 1) {
        if (isRemoved(after[next])) continue;
        if (opensWithStructure(after[next])) {
          to = next - shift + 1;
          grown = true;
        }
        break;
      }
    }

    const region = segment(
      after,
      from,
      to + shift,
      schemaOf(),
      options,
      runByFirstNode,
      factsOf(stored)
    );
    const acceptedFrom = acceptedIndexOf(previous.segments, from);
    const acceptedTo = acceptedIndexOf(previous.segments, to);
    const windowChange = RootChange.between(
      DocumentIndex.fromIndexedNodes(
        previous.accepted.value.slice(acceptedFrom, acceptedTo)
      ),
      DocumentIndex.fromValue(region.accepted),
      options
    ).embed(
      previous.accepted.length,
      previous.accepted.childPosition([], acceptedFrom)
    );
    const segments = [
      ...previous.segments.filter((run) => run.to <= from),
      ...region.segments,
      ...previous.segments
        .filter((run) => run.from >= to)
        .map((run) => ({ ...run, from: run.from + shift, to: run.to + shift })),
    ];

    return {
      ...finish(
        stored,
        DocumentIndex.fromValue(after),
        windowChange.apply(previous.accepted),
        segments
      ),
      carried: { change: windowChange, from: previous.accepted.value },
    };
  };

  return (stored: JsonEditorValue): Projection | null => {
    const root = schemaOf()?.content(null, 'main');

    // Runs resolve apart, and no run alone can check a required prefix or a
    // minimum above one block on the main root.
    if (
      (root && (root.prefix > 0 || root.min > 1)) ||
      Object.values(stored.roots ?? {}).some((children) =>
        children.some(hasAuthored)
      )
    ) {
      state = null;
      return projectWhole(stored, schemaOf(), options);
    }
    if (state?.stored !== stored.children) {
      state = state ? carry(state, stored) : full(stored);
    }
    // When accepting removes every top-level block, only the whole
    // document's resolve gives the root its completed line.
    if (state.accepted.value.length === 0 && stored.children.length > 0) {
      return projectWhole(stored, schemaOf(), options);
    }

    return (
      state.change && {
        carried: state.carried,
        change: state.change,
        value: Object.freeze({ ...stored, children: state.accepted.value }),
      }
    );
  };
};
