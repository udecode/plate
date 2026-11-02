import type {
  DocumentIndex,
  IndexedNodeRange,
  NodeList,
} from './document-index';
import { convergedResult } from './join';
import type { JsonRecord } from './json';
import { RootChange, transformChange } from './root-change';
import {
  closeToken,
  isElementNode,
  type JsonNode,
  openToken,
  PreparedTokenSlice,
} from './tokens';

export type EnclosureShell = JsonRecord & { children?: never; text?: never };

/**
 * Enclose children `[index, index + count)` of the element at `path` in a new
 * element. The change inserts the element's open token before the first
 * child and its close token after the last, and keeps every token between,
 * so each enclosed letter keeps its identity.
 */
export const wrapChildrenChange = (
  document: DocumentIndex,
  path: readonly number[],
  index: number,
  count: number,
  wrapper: EnclosureShell
) => {
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError(`Cannot wrap ${count} children at [${path}].`);
  }

  return RootChange.create(document, [
    {
      from: document.childPosition(path, index),
      insert: PreparedTokenSlice.fromTokens([openToken('element', wrapper)]),
    },
    {
      from: document.childPosition(path, index + count),
      insert: PreparedTokenSlice.fromTokens([closeToken('element')]),
    },
  ]);
};

/**
 * Remove the element at `path` and keep its children in its place: the
 * change deletes only the element's open and close tokens.
 */
export const unwrapNodeChange = (
  document: DocumentIndex,
  path: readonly number[]
) => {
  if (!isElementNode(document.node(path))) {
    throw new Error(`Cannot unwrap the text at [${path}].`);
  }

  const { from, to } = document.nodeRange(path);

  return RootChange.create(document, [
    { from, to: from + 1 },
    { from: to - 1, to },
  ]);
};

type Edit = Readonly<{ from: number; insert: PreparedTokenSlice; to: number }>;

/**
 * Apply a change that only wraps or unwraps one element by splicing its
 * parent's children, or return null for any other change.
 */
export const enclosureApplied = (
  document: DocumentIndex,
  edits: readonly Edit[]
): Readonly<{ after: DocumentIndex; parent: readonly number[] }> | null => {
  if (edits.length !== 2) return null;

  const [first, second] = edits.toSorted(
    (left, right) => left.from - right.from
  );
  const [open] = first.insert.tokens;
  const [close] = second.insert.tokens;

  if (
    first.from === first.to &&
    second.from === second.to &&
    first.insert.tokens.length === 1 &&
    second.insert.tokens.length === 1 &&
    open?.kind === 'open' &&
    open.nodeKind === 'element' &&
    close?.kind === 'close' &&
    close.nodeKind === 'element'
  ) {
    const start = document.childBoundaryAt(first.from);
    const end = document.childBoundaryAt(second.from);

    if (
      !start ||
      !end ||
      end.index <= start.index ||
      start.parentPath.join(',') !== end.parentPath.join(',')
    ) {
      return null;
    }

    const { parentPath } = start;
    const children =
      parentPath.length === 0
        ? document.nodes.slice(start.index, end.index)
        : (document.node(parentPath).children ?? []).slice(
            start.index,
            end.index
          );

    return {
      after: document.withSplicedNodes(
        parentPath,
        start.index,
        end.index - start.index,
        [{ ...open.props, children }]
      ),
      parent: parentPath,
    };
  }

  if (
    first.insert.length !== 0 ||
    second.insert.length !== 0 ||
    first.to !== first.from + 1 ||
    second.to !== second.from + 1
  ) {
    return null;
  }

  const node = document.nodeStartingAt(first.from);

  if (node?.kind !== 'element' || node.to !== second.to) return null;

  const parent = node.path.slice(0, -1);

  return {
    after: document.withSplicedNodes(
      parent,
      node.path.at(-1) ?? 0,
      1,
      document.node(node.path).children ?? []
    ),
    parent,
  };
};

type Section = Readonly<{
  from: number;
  insert: PreparedTokenSlice | null;
  to: number;
}>;

type Insertion = Section & Readonly<{ insert: PreparedTokenSlice }>;

const isInsertion = (section: Section): section is Insertion =>
  section.from === section.to && section.insert !== null;

/** The sections that replace content, or null when one writes properties. */
const replacementsOf = (change: RootChange) => {
  const replacements: Section[] = [];
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];

    if (inserted === -2) return null;
    if (inserted >= 0) {
      replacements.push({
        from: position,
        insert: change.data[index / 2] as PreparedTokenSlice | null,
        to: position + length,
      });
    }
    position += length;
  }

  return replacements;
};

/** Elements whose open and close tokens `change` deletes in two places. */
const unwrapsOf = (document: DocumentIndex, sections: readonly Section[]) => {
  const deletions = sections.filter(
    ({ from, insert, to }) => from < to && !insert?.length
  );
  const unwraps: IndexedNodeRange[] = [];

  for (const deletion of deletions) {
    for (let at = deletion.from; at < deletion.to; at += 1) {
      const node = document.nodeStartingAt(at);

      if (!node) continue;
      // A node the deletion holds whole holds no unwrap.
      if (node.to <= deletion.to) {
        at = node.to - 1;
        continue;
      }
      if (
        node.kind === 'element' &&
        deletions.some(({ from, to }) => from < node.to && node.to <= to)
      ) {
        unwraps.push(node);
      }
    }
  }

  return unwraps;
};

const depthAt = (document: DocumentIndex, at: number) =>
  document
    .openContextAt(at)
    .filter((range) => range.contentFrom <= at && at <= range.contentTo).length;

/**
 * The tokens of `insert`, placed inside `element` at `at`, that close a
 * piece of the element or open the next one, as a split of it writes them.
 */
const pieceEdgesOf = (
  document: DocumentIndex,
  element: IndexedNodeRange,
  at: number,
  insert: PreparedTokenSlice
) => {
  const { type } = document.node(element.path);
  const edges: number[] = [];
  let level = depthAt(document, at) - element.path.length;

  for (const [index, token] of insert.tokens.entries()) {
    if (token.kind === 'close') {
      if (level === 0 && token.nodeKind === 'element') edges.push(index);
      level -= 1;
    } else if (token.kind === 'open') {
      level += 1;
      if (level === 0 && token.nodeKind === 'element') {
        if (token.props.type !== type) return null;
        edges.push(index);
      }
    }
  }

  return edges;
};

/** How far `insert` climbs out of the place it goes in, as a negative depth. */
const lowestDepth = (insert: PreparedTokenSlice) => {
  let depth = 0;
  let lowest = 0;

  for (const token of insert.tokens) {
    if (token.kind === 'open') depth += 1;
    else if (token.kind === 'close') lowest = Math.min(lowest, (depth -= 1));
  }

  return { depth, lowest };
};

export type PieceProps = (
  element: JsonNode,
  parent: readonly number[],
  nodes: NodeList
) => JsonRecord;

/**
 * `lead`, the tokens that open a wrap whose parent sits `parent` deep, with
 * the element it opens given the properties of a piece at `at`.
 */
const pieceLead = (
  document: DocumentIndex,
  lead: PreparedTokenSlice,
  parent: number,
  at: number,
  pieceProps: PieceProps | undefined
) => {
  if (!pieceProps) return lead;

  const path =
    document
      .openContextAt(at)
      .filter((range) => range.contentFrom <= at && at <= range.contentTo)[
      parent - 1
    ]?.path ?? [];
  const { lowest } = lowestDepth(lead);
  let level = 0;

  return PreparedTokenSlice.fromTokens(
    lead.tokens.map((token) => {
      if (token.kind === 'close') level -= 1;
      if (token.kind !== 'open') return token;
      level += 1;

      return level === lowest + 1 && token.nodeKind === 'element'
        ? openToken(
            'element',
            pieceProps({ ...token.props, children: [] }, path, document.nodes)
          )
        : token;
    })
  );
};

/**
 * Rebase a wrap over a split between its edges that closes the parent the
 * wrap puts its element in, as a split of the line a link's letters sit in
 * does: the wrap closes a piece before each such split and opens the next
 * after it, so each side keeps a piece over its own letters. Each next piece
 * takes the properties `pieceProps` gives it, or the wrap's own without it.
 */
const wrapOverPieces = (
  document: DocumentIndex,
  wrap: RootChange,
  wrapSections: readonly Section[],
  split: RootChange,
  splitSections: readonly Section[],
  wrapFirst: boolean,
  pieceProps: PieceProps | undefined
) => {
  if (
    wrapSections.length !== 2 ||
    !wrapSections.every(isInsertion) ||
    !splitSections.every(isInsertion)
  ) {
    return null;
  }

  const [lead, tail] = wrapSections;
  const opening = lowestDepth(lead.insert);

  if (
    opening.depth !== 1 ||
    lowestDepth(tail.insert).depth !== -1 ||
    splitSections.some(({ insert }) => lowestDepth(insert).depth !== 0)
  ) {
    return null;
  }

  const parent = depthAt(document, lead.from) + opening.lowest;
  const inner = splitSections.filter(
    ({ from, insert }) =>
      lead.from < from &&
      from < tail.from &&
      depthAt(document, from) + lowestDepth(insert).lowest < parent
  );

  if (
    inner.length === 0 ||
    inner.some(
      ({ from }) => depthAt(document, from) !== depthAt(document, tail.from)
    )
  ) {
    return null;
  }

  const afterSplit = split.apply(document);
  const pieces = inner.map(({ from, insert }) => {
    const start = split.mapPos(from, -1) ?? from;
    const at = start + insert.length;

    return {
      at,
      from,
      lead: pieceLead(afterSplit, lead.insert, parent, at, pieceProps),
      start,
    };
  });
  const edges = RootChange.create(
    afterSplit,
    pieces.flatMap((piece) => [
      { from: piece.start, insert: tail.insert },
      { from: piece.at, insert: piece.lead },
    ])
  );
  const wrapOver = edges.compose(
    transformChange(transformChange(wrap, split, wrapFirst), edges, true)
  );
  const splitOver = transformChange(
    RootChange.create(
      document,
      splitSections.map(({ from, insert }) => {
        const piece = pieces.find((each) => each.from === from);

        return {
          from,
          insert: piece
            ? PreparedTokenSlice.fromTokens([
                ...tail.insert.tokens,
                ...insert.tokens,
                ...piece.lead.tokens,
              ])
            : insert,
        };
      })
    ),
    wrap,
    !wrapFirst
  );

  return { split: splitOver, wrap: wrapOver };
};

/**
 * Rebase an unwrap over a teammate's split of the element it unwraps: the
 * unwrap also deletes the open and close tokens of every piece, and the split
 * keeps only the tokens that split the content around them. A wrap rebased
 * over a split of its line takes `pieceProps` for each next piece.
 *
 * @internal
 */
export const rebaseOverPieces = (
  a: RootChange,
  b: RootChange,
  document: DocumentIndex,
  pieceProps?: PieceProps
) => {
  const aSections = replacementsOf(a);
  const bSections = replacementsOf(b);

  if (!aSections || !bSections) return null;

  const over = (
    unwrap: RootChange,
    unwrapSections: readonly Section[],
    split: RootChange,
    splitSections: readonly Section[],
    unwrapFirst: boolean
  ) => {
    const elements = unwrapsOf(document, unwrapSections);

    if (elements.length === 0) return null;

    const kept: Section[] = [];
    const removed: Array<Readonly<{ from: number; to: number }>> = [];

    for (const section of splitSections) {
      const element =
        section.from === section.to && section.insert
          ? elements.find(
              ({ from, to }) => from < section.from && section.from < to
            )
          : undefined;
      const edges =
        element && section.insert
          ? pieceEdgesOf(document, element, section.from, section.insert)
          : null;

      if (!edges?.length || !section.insert) {
        kept.push(section);
        continue;
      }

      const start = split.mapPos(section.from, -1) ?? section.from;
      const tokens = section.insert.tokens.filter(
        (_, index) => !edges.includes(index)
      );

      for (const edge of edges) {
        removed.push({ from: start + edge, to: start + edge + 1 });
      }
      kept.push({ ...section, insert: PreparedTokenSlice.fromTokens(tokens) });
    }

    if (removed.length === 0) return null;

    const afterSplit = split.apply(document);
    const edges = RootChange.create(afterSplit, removed);
    const unwrapOverSplit = transformChange(unwrap, split, unwrapFirst);
    const unwrapOver = edges.compose(
      transformChange(unwrapOverSplit, edges, true)
    );
    const splitOver = transformChange(
      RootChange.create(
        document,
        kept.map(({ from, insert, to }) => ({
          from,
          insert: insert ?? PreparedTokenSlice.empty,
          to,
        }))
      ),
      unwrap,
      !unwrapFirst
    );

    return { split: splitOver, unwrap: unwrapOver };
  };

  const aUnwraps = over(a, aSections, b, bSections, true);

  if (aUnwraps) {
    return convergedResult(document, a, b, {
      a: aUnwraps.unwrap,
      b: aUnwraps.split,
    });
  }

  const bUnwraps = over(b, bSections, a, aSections, false);

  if (bUnwraps) {
    return convergedResult(document, a, b, {
      a: bUnwraps.split,
      b: bUnwraps.unwrap,
    });
  }

  const aWraps = wrapOverPieces(
    document,
    a,
    aSections,
    b,
    bSections,
    true,
    pieceProps
  );

  if (aWraps) {
    return convergedResult(document, a, b, {
      a: aWraps.wrap,
      b: aWraps.split,
    });
  }

  const bWraps = wrapOverPieces(
    document,
    b,
    bSections,
    a,
    aSections,
    false,
    pieceProps
  );

  return bWraps
    ? convergedResult(document, a, b, { a: bWraps.split, b: bWraps.wrap })
    : null;
};
