import { DiffMatchPatch, DiffOp } from 'diff-match-patch-ts';

import { jsonEqual } from '../../core/change/tokens';
import {
  comparisonTextPoint,
  comparisonTextRuns,
  comparisonTextSpans,
  type ComparisonDocumentIndex,
  type ComparisonIndexNode,
} from './comparison-index';
import {
  assertComparisonActive,
  stableStringify,
  yieldComparisonWork,
} from './comparison-internal';
import type {
  ComparedChange,
  ComparisonCorrespondence,
  ComparisonDiagnostic,
  ComparisonEffect,
  ComparisonEvidence,
  ComparisonSpan,
} from './comparison-types';

type PrimaryRelation = Readonly<{
  after: readonly number[];
  ambiguous: boolean;
  before: readonly number[];
  evidence: ComparisonEvidence;
  kind: 'join' | 'many' | 'match' | 'split';
}>;

type CopyRelation = Readonly<{
  after: number;
  before: number;
}>;

type NodePair = Readonly<{
  after: number;
  ambiguous: boolean;
  before: number;
  evidence: ComparisonEvidence;
}>;

type Candidate = Readonly<{
  after: number;
  before: number;
  score: number;
}>;

type EffectInput = ComparisonEffect extends infer TEffect
  ? TEffect extends ComparisonEffect
    ? Omit<TEffect, 'id'>
    : never
  : never;

export type ComparisonMatchResult = Readonly<{
  candidateEdges: number;
  changes: readonly ComparedChange[];
  diagnostics: readonly ComparisonDiagnostic[];
  localAlignmentCells: number;
  visibleEquivalent: boolean;
}>;

/** Native owners may supply only already-validated retained correspondence. */
export type ComparisonRecordedLineage =
  | Readonly<{
      kind: 'complete';
      relations: ReadonlyArray<
        Readonly<{
          after: readonly ComparisonSpan[];
          before: readonly ComparisonSpan[];
          operationIds: readonly string[];
        }>
      >;
    }>
  | Readonly<{ kind: 'expired' }>;

const CANDIDATES_PER_NODE = 24;
const DIRECT_CANDIDATES_PER_NODE = 8;
const MAX_CANDIDATE_EDGES = 100_000;
const MAX_DIRECT_WINDOW_DISAMBIGUATIONS = 128;
const MAX_WINDOW = 4;
const YIELD_INTERVAL = 4096;

const dmp = new DiffMatchPatch();

dmp.Diff_Timeout = 0.2;

const compareNodeOrder = (
  left: ComparisonIndexNode,
  right: ComparisonIndexNode
) => {
  const rootOrder = (left.root ?? '').localeCompare(right.root ?? '');

  if (rootOrder !== 0) return rootOrder;
  for (
    let index = 0;
    index < Math.min(left.path.length, right.path.length);
    index += 1
  ) {
    const difference = left.path[index] - right.path[index];

    if (difference !== 0) return difference;
  }

  return left.path.length - right.path.length;
};

const nodeKey = (node: ComparisonIndexNode) =>
  `${node.root ?? ''}:${stableStringify(node.path)}`;

const pairKey = (before: number, after: number) => `${before}:${after}`;

const spanKey = ({ from, root, to }: ComparisonSpan) =>
  `${root === null ? 'primary' : `named:${root}`}:${from}:${to}`;

const lastPathIndex = (node: ComparisonIndexNode) => node.path.at(-1) ?? 0;

const graphemeSegmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter('und', { granularity: 'grapheme' })
    : null;

const semanticTokens = (text: string) => {
  const tokens = new Set<string>();
  const lower = text.toLocaleLowerCase('und');

  for (const match of lower.matchAll(/[\p{L}\p{N}]+|[^\s]/gu)) {
    const token = match[0];

    tokens.add(`w:${token}`);
    if (tokens.size >= 96) break;
  }
  const compact = lower.replaceAll(/\s/gu, '');
  const characters = graphemeSegmenter
    ? Array.from(graphemeSegmenter.segment(compact), ({ segment }) => segment)
    : Array.from(compact);

  for (let index = 0; index + 2 < characters.length; index += 2) {
    tokens.add(`g:${characters.slice(index, index + 3).join('')}`);
    if (tokens.size >= 128) break;
  }

  return tokens;
};

const textSimilarityFromTokens = (
  beforeText: string,
  afterText: string,
  beforeTokens: ReadonlySet<string>,
  afterTokens: ReadonlySet<string>
) => {
  const similarity = semanticSimilarity(beforeTokens, afterTokens);
  const length =
    beforeText.length === 0 && afterText.length === 0
      ? 1
      : Math.min(beforeText.length, afterText.length) /
        Math.max(beforeText.length, afterText.length, 1);

  return similarity * 0.75 + length * 0.25;
};

const textSimilarity = (beforeText: string, afterText: string) =>
  textSimilarityFromTokens(
    beforeText,
    afterText,
    semanticTokens(beforeText),
    semanticTokens(afterText)
  );

const setSimilarity = (
  left: ReadonlySet<string>,
  right: ReadonlySet<string>
) => {
  if (left.size === 0 && right.size === 0) return 1;
  let intersection = 0;

  for (const value of left) {
    if (right.has(value)) intersection += 1;
  }

  return (2 * intersection) / (left.size + right.size);
};

const semanticSimilarity = (
  left: ReadonlySet<string>,
  right: ReadonlySet<string>
) => {
  const select = (values: ReadonlySet<string>, prefix: string) =>
    new Set([...values].filter((value) => value.startsWith(prefix)));
  const leftWords = select(left, 'w:');
  const rightWords = select(right, 'w:');
  const leftGrams = select(left, 'g:');
  const rightGrams = select(right, 'g:');

  return Math.max(
    setSimilarity(left, right),
    leftWords.size > 0 && rightWords.size > 0
      ? setSimilarity(leftWords, rightWords)
      : 0,
    leftGrams.size > 0 && rightGrams.size > 0
      ? setSimilarity(leftGrams, rightGrams)
      : 0
  );
};

const createTokenNodeIndex = (
  nodeIndexes: readonly number[],
  index: ComparisonDocumentIndex
) => {
  const result = new Map<string, number[]>();

  for (const nodeIndex of nodeIndexes) {
    const tokens = semanticTokens(index.nodes[nodeIndex].text);

    for (const token of tokens) {
      const values = result.get(token) ?? [];

      if (values.length < CANDIDATES_PER_NODE) values.push(nodeIndex);
      result.set(token, values);
    }
  }

  return result;
};

const boundedMatchingWindow = (
  text: string,
  siblingIndexes: readonly number[],
  positionByIndex: ReadonlyMap<number, number>,
  tokenNodes: ReadonlyMap<string, readonly number[]>,
  index: ComparisonDocumentIndex,
  matched: ReadonlySet<number>
) => {
  const candidates = new Map<string, readonly number[]>();

  for (const token of semanticTokens(text)) {
    for (const anchor of tokenNodes.get(token) ?? []) {
      const position = positionByIndex.get(anchor);

      if (position === undefined) continue;
      for (let size = 2; size <= MAX_WINDOW; size += 1) {
        for (let offset = 0; offset < size; offset += 1) {
          const start = position - offset;
          const window = siblingIndexes.slice(start, start + size);

          if (
            start < 0 ||
            window.length !== size ||
            window.some(
              (nodeIndex) =>
                matched.has(nodeIndex) ||
                index.nodes[nodeIndex].text.length === 0
            )
          ) {
            continue;
          }
          candidates.set(`${start}:${size}`, window);
          if (candidates.size >= CANDIDATES_PER_NODE) break;
        }
        if (candidates.size >= CANDIDATES_PER_NODE) break;
      }
      if (candidates.size >= CANDIDATES_PER_NODE) break;
    }
    if (candidates.size >= CANDIDATES_PER_NODE) break;
  }

  const ranked = [...candidates.values()]
    .map((window) => ({
      score: textSimilarity(
        text,
        window.map((nodeIndex) => index.nodes[nodeIndex].text).join('')
      ),
      window,
    }))
    .toSorted((left, right) => right.score - left.score);

  return Object.freeze({
    score: ranked[0]?.score ?? 0,
    window: ranked[0]?.score >= 0.62 ? ranked[0].window : undefined,
    work: candidates.size,
  });
};

const propertySimilarity = (
  before: ComparisonIndexNode,
  after: ComparisonIndexNode
) => {
  if (jsonEqual(before.properties, after.properties)) return 1;
  const beforeKeys = new Set(Object.keys(before.properties));
  const afterKeys = new Set(Object.keys(after.properties));

  return setSimilarity(beforeKeys, afterKeys);
};

const candidateScore = (
  before: ComparisonIndexNode,
  after: ComparisonIndexNode,
  beforeTokens: ReadonlySet<string>,
  afterTokens: ReadonlySet<string>
) => {
  if (before.blockContainer !== after.blockContainer) return 0;
  const text = semanticSimilarity(beforeTokens, afterTokens);
  const length =
    before.text.length === 0 && after.text.length === 0
      ? 1
      : Math.min(before.text.length, after.text.length) /
        Math.max(before.text.length, after.text.length, 1);
  const properties = propertySimilarity(before, after);
  const type = before.type === after.type ? 1 : 0;
  const structure =
    before.structure?.kind === after.structure?.kind &&
    before.structure !== null &&
    after.structure !== null
      ? 1
      : 0;
  const position = nodeKey(before) === nodeKey(after) ? 1 : 0;

  if (
    text < 0.24 &&
    position === 0 &&
    !(before.text.length === 0 && properties === 1 && type === 1)
  ) {
    return 0;
  }

  return (
    text * 0.45 +
    length * 0.15 +
    properties * 0.1 +
    type * 0.15 +
    structure * 0.05 +
    position * 0.25
  );
};

const longestIncreasingPairKeys = (
  pairs: readonly NodePair[],
  after: ComparisonDocumentIndex
) => {
  type Sequence = Readonly<{
    exact: number;
    length: number;
    pairIndex: number;
  }>;

  const positions = pairs
    .map((pair) => lastPathIndex(after.nodes[pair.after]))
    .toSorted((left, right) => left - right)
    .filter(
      (value, index, values) => index === 0 || value !== values[index - 1]
    );
  const positionByValue = new Map(
    positions.map((value, index) => [value, index + 1])
  );
  const tree = new Array<Sequence | undefined>(positions.length + 1);
  const previous = new Array<number>(pairs.length).fill(-1);
  const better = (left: Sequence | undefined, right: Sequence | undefined) => {
    if (!left) return right;
    if (!right) return left;

    return right.length > left.length ||
      (right.length === left.length && right.exact > left.exact) ||
      (right.length === left.length &&
        right.exact === left.exact &&
        right.pairIndex < left.pairIndex)
      ? right
      : left;
  };
  const query = (position: number) => {
    let result: Sequence | undefined;

    for (let cursor = position; cursor > 0; cursor -= cursor & -cursor) {
      result = better(result, tree[cursor]);
    }

    return result;
  };
  const update = (position: number, value: Sequence) => {
    for (
      let cursor = position;
      cursor < tree.length;
      cursor += cursor & -cursor
    ) {
      tree[cursor] = better(tree[cursor], value);
    }
  };

  pairs.forEach((pair, pairIndex) => {
    const value = lastPathIndex(after.nodes[pair.after]);
    const position = positionByValue.get(value);

    if (position === undefined) {
      throw new Error('Comparison placement coordinate is missing.');
    }
    const prior = query(position - 1);
    const sequence: Sequence = {
      exact:
        (prior?.exact ?? 0) +
        (pair.evidence.kind === 'inferred' && pair.evidence.basis === 'exact'
          ? 1
          : 0),
      length: (prior?.length ?? 0) + 1,
      pairIndex,
    };

    previous[pairIndex] = prior?.pairIndex ?? -1;
    update(position, sequence);
  });

  const result = new Set<string>();
  let cursor = query(positions.length)?.pairIndex ?? -1;

  while (cursor >= 0) {
    const pair = pairs[cursor];

    result.add(pairKey(pair.before, pair.after));
    cursor = previous[cursor];
  }

  return result;
};

const matchedParent = (
  pair: NodePair,
  before: ComparisonDocumentIndex,
  after: ComparisonDocumentIndex,
  byBefore: ReadonlyMap<number, NodePair>
) => {
  const beforeNode = before.nodes[pair.before];
  const afterNode = after.nodes[pair.after];

  if (beforeNode.parentIndex === null || afterNode.parentIndex === null) {
    return beforeNode.parentIndex === afterNode.parentIndex;
  }

  return byBefore.get(beforeNode.parentIndex)?.after === afterNode.parentIndex;
};

const placementPairs = (
  pairs: readonly NodePair[],
  before: ComparisonDocumentIndex,
  after: ComparisonDocumentIndex
) => {
  const byBefore = new Map(pairs.map((pair) => [pair.before, pair]));
  const stable = new Set<string>();
  const siblings = new Map<string, NodePair[]>();

  for (const pair of pairs) {
    const beforeNode = before.nodes[pair.before];
    const afterNode = after.nodes[pair.after];

    if (
      beforeNode.root !== afterNode.root ||
      !matchedParent(pair, before, after, byBefore)
    ) {
      continue;
    }
    const key = `${beforeNode.root ?? ''}:${beforeNode.parentIndex ?? 'root'}:${afterNode.parentIndex ?? 'root'}`;
    const values = siblings.get(key) ?? [];

    values.push(pair);
    siblings.set(key, values);
  }

  for (const values of siblings.values()) {
    const ordered = values.toSorted(
      (left, right) =>
        lastPathIndex(before.nodes[left.before]) -
        lastPathIndex(before.nodes[right.before])
    );

    for (const key of longestIncreasingPairKeys(ordered, after)) {
      stable.add(key);
    }
  }

  return new Set(
    pairs.flatMap((pair) => {
      const beforeNode = before.nodes[pair.before];
      const afterNode = after.nodes[pair.after];
      const key = pairKey(pair.before, pair.after);

      return beforeNode.root !== afterNode.root ||
        !matchedParent(pair, before, after, byBefore) ||
        !stable.has(key)
        ? [key]
        : [];
    })
  );
};

const hasMovedMatchedAncestor = (
  pair: NodePair,
  moved: ReadonlySet<string>,
  before: ComparisonDocumentIndex,
  byBefore: ReadonlyMap<number, NodePair>
) => {
  let parent = before.nodes[pair.before].parentIndex;

  while (parent !== null) {
    const parentPair = byBefore.get(parent);

    if (!parentPair) return false;
    if (moved.has(pairKey(parentPair.before, parentPair.after))) return true;
    parent = before.nodes[parent].parentIndex;
  }

  return false;
};

const textDifferenceParts = (
  beforeTextValue: string,
  afterTextValue: string,
  beforeRange: (from: number, to: number) => readonly ComparisonSpan[],
  afterRange: (from: number, to: number) => readonly ComparisonSpan[],
  beforePoint: (offset: number) => ComparisonSpan,
  afterPoint: (offset: number) => ComparisonSpan
) => {
  if (beforeTextValue === afterTextValue) return [];
  const chunks = dmp.diff_main(beforeTextValue, afterTextValue);

  dmp.diff_cleanupSemantic(chunks);
  const differences: Array<{
    after: readonly ComparisonSpan[];
    afterText: string;
    before: readonly ComparisonSpan[];
    beforeText: string;
  }> = [];
  let beforeOffset = 0;
  let afterOffset = 0;
  let index = 0;

  while (index < chunks.length) {
    const [operation, text] = chunks[index];

    if (operation === DiffOp.Equal) {
      beforeOffset += text.length;
      afterOffset += text.length;
      index += 1;
      continue;
    }
    const beforeStart = beforeOffset;
    const afterStart = afterOffset;
    let beforeText = '';
    let afterText = '';

    while (index < chunks.length && chunks[index][0] !== DiffOp.Equal) {
      const [innerOperation, innerText] = chunks[index];

      if (innerOperation === DiffOp.Delete) {
        beforeText += innerText;
        beforeOffset += innerText.length;
      } else {
        afterText += innerText;
        afterOffset += innerText.length;
      }
      index += 1;
    }
    differences.push({
      after:
        afterText.length === 0
          ? [afterPoint(afterStart)]
          : afterRange(afterStart, afterOffset),
      afterText,
      before:
        beforeText.length === 0
          ? [beforePoint(beforeStart)]
          : beforeRange(beforeStart, beforeOffset),
      beforeText,
    });
  }

  return differences;
};

const textDifferences = (
  before: ComparisonIndexNode,
  after: ComparisonIndexNode
) =>
  textDifferenceParts(
    before.text,
    after.text,
    (from, to) => comparisonTextSpans(before, from, to),
    (from, to) => comparisonTextSpans(after, from, to),
    (offset) => comparisonTextPoint(before, offset),
    (offset) => comparisonTextPoint(after, offset)
  );

const sequenceTextSpans = (
  nodes: readonly ComparisonIndexNode[],
  from: number,
  to: number
) => {
  let offset = 0;

  return Object.freeze(
    nodes.flatMap((node) => {
      const nodeFrom = offset;
      const nodeTo = nodeFrom + node.text.length;
      const overlapFrom = Math.max(from, nodeFrom);
      const overlapTo = Math.min(to, nodeTo);

      offset = nodeTo;

      return overlapFrom < overlapTo
        ? comparisonTextSpans(
            node,
            overlapFrom - nodeFrom,
            overlapTo - nodeFrom
          )
        : [];
    })
  );
};

const sequenceTextPoint = (
  nodes: readonly ComparisonIndexNode[],
  offset: number
) => {
  let from = 0;

  for (const node of nodes) {
    const to = from + node.text.length;

    if (offset < to) return comparisonTextPoint(node, offset - from);
    from = to;
  }
  const last = nodes.at(-1);

  if (!last) throw new Error('Comparison relation has no text owner.');

  return comparisonTextPoint(last, last.text.length);
};

const sequenceTextRuns = (nodes: readonly ComparisonIndexNode[]) => {
  const result: Array<
    Readonly<{ properties: Readonly<Record<string, unknown>>; text: string }>
  > = [];

  for (const node of nodes) {
    for (const run of comparisonTextRuns(node)) {
      const previous = result.at(-1);

      if (
        previous &&
        stableStringify(previous.properties) === stableStringify(run.properties)
      ) {
        result[result.length - 1] = Object.freeze({
          properties: previous.properties,
          text: previous.text + run.text,
        });
      } else {
        result.push(
          Object.freeze({ properties: run.properties, text: run.text })
        );
      }
    }
  }

  return Object.freeze(result);
};

const sequenceOwnProperties = (nodes: readonly ComparisonIndexNode[]) => {
  const result: Array<Readonly<Record<string, unknown>>> = [];

  for (const { properties } of nodes) {
    if (
      result.length === 0 ||
      stableStringify(result.at(-1)) !== stableStringify(properties)
    ) {
      result.push(properties);
    }
  }

  return Object.freeze(result);
};

const sequenceTextDifferences = (
  beforeNodes: readonly ComparisonIndexNode[],
  afterNodes: readonly ComparisonIndexNode[]
) => {
  const beforeText = beforeNodes.map(({ text }) => text).join('');
  const afterText = afterNodes.map(({ text }) => text).join('');

  return textDifferenceParts(
    beforeText,
    afterText,
    (from, to) => sequenceTextSpans(beforeNodes, from, to),
    (from, to) => sequenceTextSpans(afterNodes, from, to),
    (offset) => sequenceTextPoint(beforeNodes, offset),
    (offset) => sequenceTextPoint(afterNodes, offset)
  );
};

const childOrderChanged = (
  pair: NodePair,
  before: ComparisonDocumentIndex,
  after: ComparisonDocumentIndex,
  byBefore: ReadonlyMap<number, NodePair>
) => {
  const beforeChildren = before.nodes[pair.before].childIndexes.filter(
    (index) => before.nodes[index].kind === 'element'
  );
  const afterChildren = after.nodes[pair.after].childIndexes.filter(
    (index) => after.nodes[index].kind === 'element'
  );
  const mapped = beforeChildren.flatMap((index) => {
    const child = byBefore.get(index);

    return child ? [child.after] : [];
  });

  return (
    mapped.length !== beforeChildren.length ||
    mapped.length !== afterChildren.length ||
    mapped.some((index, position) => index !== afterChildren[position])
  );
};

const changedMatchedElementDescendants = (
  pair: NodePair,
  before: ComparisonDocumentIndex,
  after: ComparisonDocumentIndex,
  byBefore: ReadonlyMap<number, NodePair>
) => {
  const result: NodePair[] = [];
  const pending = [...before.nodes[pair.before].childIndexes];

  while (pending.length > 0) {
    const sourceIndex = pending.pop();

    if (sourceIndex === undefined) continue;
    const source = before.nodes[sourceIndex];

    pending.push(...source.childIndexes);
    if (source.kind !== 'element') continue;
    const targetPair = byBefore.get(sourceIndex);

    if (targetPair && source.text !== after.nodes[targetPair.after].text) {
      result.push(targetPair);
    }
  }

  return result;
};

const spanContains = (outer: ComparisonSpan, inner: ComparisonSpan) =>
  outer.root === inner.root && outer.from <= inner.from && outer.to >= inner.to;

const textDifferenceOwnedByDescendant = (
  difference: Readonly<{
    after: readonly ComparisonSpan[];
    before: readonly ComparisonSpan[];
  }>,
  descendants: readonly NodePair[],
  before: ComparisonDocumentIndex,
  after: ComparisonDocumentIndex
) =>
  descendants.some((descendant) => {
    const source = before.nodes[descendant.before].span;
    const target = after.nodes[descendant.after].span;

    return (
      difference.before.every((span) => spanContains(source, span)) &&
      difference.after.every((span) => spanContains(target, span))
    );
  });

const maximalUnmatched = (
  index: ComparisonDocumentIndex,
  matched: ReadonlySet<number>
) =>
  index.nodes.filter((node) => {
    if (node.kind !== 'element' || matched.has(node.index)) return false;

    return node.parentIndex === null || matched.has(node.parentIndex);
  });

const ancestorsWithMatchedDescendants = (
  index: ComparisonDocumentIndex,
  matched: ReadonlySet<number>
) => {
  const result = new Set<number>();

  for (const matchedIndex of matched) {
    let parent = index.nodes[matchedIndex].parentIndex;

    while (parent !== null) {
      result.add(parent);
      parent = index.nodes[parent].parentIndex;
    }
  }

  return result;
};

const relationSpans = (
  indexes: readonly number[],
  source: ComparisonDocumentIndex
) => Object.freeze(indexes.map((index) => source.nodes[index].span));

const uniqueSpans = (spans: readonly ComparisonSpan[]) =>
  Object.freeze([
    ...new Map(spans.map((value) => [spanKey(value), value])).values(),
  ]);

const composeWrapperGroups = (changes: readonly ComparedChange[]) => {
  let result = [...changes];
  const wrappers = changes
    .flatMap((change) =>
      change.effects.flatMap((effect) =>
        effect.kind === 'wrapper' ? [{ change, effect }] : []
      )
    )
    .toSorted((left, right) => {
      const leftSpan =
        left.effect.action === 'add'
          ? left.effect.after[0]
          : left.effect.before[0];
      const rightSpan =
        right.effect.action === 'add'
          ? right.effect.after[0]
          : right.effect.before[0];

      return leftSpan.to - leftSpan.from - (rightSpan.to - rightSpan.from);
    });

  for (const { change: originalWrapper, effect } of wrappers) {
    const wrapperIndex = result.findIndex(
      ({ id }) => id === originalWrapper.id
    );

    if (wrapperIndex === -1) continue;
    const wrapper = result[wrapperIndex];
    const wrapperSpan =
      effect.action === 'add' ? effect.after[0] : effect.before[0];
    const nestedIndexes = result.flatMap((candidate, index) => {
      if (index === wrapperIndex) return [];
      const spans =
        effect.action === 'add' ? candidate.after : candidate.before;
      const nested = spans.some(
        (candidateSpan) =>
          candidateSpan.root === wrapperSpan.root &&
          candidateSpan.from >= wrapperSpan.from &&
          candidateSpan.to <= wrapperSpan.to
      );

      return nested ? [index] : [];
    });

    if (nestedIndexes.length === 0) continue;
    const merged = [wrapper, ...nestedIndexes.map((index) => result[index])];
    const insertAt = Math.min(wrapperIndex, ...nestedIndexes);
    const nestedSet = new Set([wrapperIndex, ...nestedIndexes]);
    const value: ComparedChange = Object.freeze({
      after: uniqueSpans(merged.flatMap(({ after: spans }) => spans)),
      before: uniqueSpans(merged.flatMap(({ before: spans }) => spans)),
      correspondence: Object.freeze(
        merged.flatMap(({ correspondence }) => correspondence)
      ),
      effects: Object.freeze(merged.flatMap(({ effects }) => effects)),
      evidence: wrapper.evidence,
      id: wrapper.id,
      requiredChangeIds: Object.freeze([
        ...new Set(
          merged.flatMap(({ requiredChangeIds }) => requiredChangeIds)
        ),
      ]),
    });
    const next = result.filter((_change, index) => !nestedSet.has(index));

    next.splice(insertAt, 0, value);
    result = next;
  }

  return Object.freeze(result);
};

const mergeChangeIndexes = (
  changes: readonly ComparedChange[],
  indexes: readonly number[],
  ownerIndex: number
) => {
  const selected = new Set(indexes);
  const merged = indexes.map((index) => changes[index]);
  const owner = changes[ownerIndex];
  const value: ComparedChange = Object.freeze({
    after: uniqueSpans(merged.flatMap(({ after: spans }) => spans)),
    before: uniqueSpans(merged.flatMap(({ before: spans }) => spans)),
    correspondence: Object.freeze(
      merged.flatMap(({ correspondence }) => correspondence)
    ),
    effects: Object.freeze(merged.flatMap(({ effects }) => effects)),
    evidence: owner.evidence,
    id: owner.id,
    requiredChangeIds: Object.freeze([
      ...new Set(merged.flatMap(({ requiredChangeIds }) => requiredChangeIds)),
    ]),
  });
  const result = changes.filter((_change, index) => !selected.has(index));

  result.splice(Math.min(...indexes), 0, value);

  return result;
};

const logicalOutlineSpan = (
  index: ComparisonDocumentIndex,
  node: ComparisonIndexNode
) => {
  if (node.structure?.kind !== 'outline') return null;
  const siblings =
    node.parentIndex === null
      ? (index.roots.get(node.root)?.topLevelIndexes ?? [])
      : index.nodes[node.parentIndex].childIndexes;
  const position = siblings.indexOf(node.index);
  const levelValue = node.properties[node.structure.level.key];
  const level = typeof levelValue === 'number' ? levelValue : 1;
  const { from, root, to: nodeTo } = node;
  let to = nodeTo;

  for (let cursor = position + 1; cursor < siblings.length; cursor += 1) {
    const sibling = index.nodes[siblings[cursor]];

    if (sibling.structure?.kind === 'outline') {
      const siblingLevelValue = sibling.properties[sibling.structure.level.key];
      const siblingLevel =
        typeof siblingLevelValue === 'number' ? siblingLevelValue : 1;

      if (siblingLevel <= level) break;
    }
    const { to: siblingTo } = sibling;

    to = siblingTo;
  }

  return Object.freeze({ from, root, to });
};

const spanWithin = (span: ComparisonSpan, container: ComparisonSpan) =>
  span.root === container.root &&
  span.from >= container.from &&
  span.to <= container.to;

const composeLogicalGroups = (
  changes: readonly ComparedChange[],
  pairs: readonly NodePair[],
  before: ComparisonDocumentIndex,
  after: ComparisonDocumentIndex
) => {
  let result = [...changes];
  const logicalPairs = pairs.filter((pair) => {
    const source = before.nodes[pair.before];
    const target = after.nodes[pair.after];

    return (
      (source.structure?.kind === 'outline' &&
        target.structure?.kind === 'outline') ||
      (source.structure?.kind === 'grid' &&
        source.structure.role === 'row' &&
        target.structure?.kind === 'grid' &&
        target.structure.role === 'row')
    );
  });

  for (const pair of logicalPairs) {
    const source = before.nodes[pair.before];
    const target = after.nodes[pair.after];
    const sourceSpan =
      source.structure?.kind === 'outline'
        ? logicalOutlineSpan(before, source)
        : source.span;
    const targetSpan =
      target.structure?.kind === 'outline'
        ? logicalOutlineSpan(after, target)
        : target.span;

    if (!sourceSpan || !targetSpan) continue;
    const indexes = result.flatMap((change, index) => {
      const beforeContained =
        change.before.length === 0 ||
        change.before.every((span) => spanWithin(span, sourceSpan));
      const afterContained =
        change.after.length === 0 ||
        change.after.every((span) => spanWithin(span, targetSpan));

      return beforeContained && afterContained ? [index] : [];
    });

    if (indexes.length < 2) continue;
    const ownerIndex =
      indexes.find((index) =>
        result[index].effects.some(({ kind }) => kind === 'placement')
      ) ?? -1;
    if (ownerIndex === -1) continue;
    result = mergeChangeIndexes(result, indexes, ownerIndex);
  }

  return Object.freeze(result);
};

export const matchComparison = async (
  before: ComparisonDocumentIndex,
  after: ComparisonDocumentIndex,
  comparisonId: string,
  options: Readonly<{
    createdRoots: ReadonlySet<string>;
    deletedRoots: ReadonlySet<string>;
    lineage?: ComparisonRecordedLineage;
    signal?: AbortSignal;
  }>
): Promise<ComparisonMatchResult> => {
  const { createdRoots, deletedRoots, lineage, signal } = options;
  const beforeElements = before.nodes.filter(
    ({ kind, root }) => kind === 'element' && !deletedRoots.has(root ?? '')
  );
  const afterElements = after.nodes.filter(
    ({ kind, root }) => kind === 'element' && !createdRoots.has(root ?? '')
  );
  const exactBefore = new Map<string, ComparisonIndexNode[]>();
  const exactAfter = new Map<string, ComparisonIndexNode[]>();
  const pairs: NodePair[] = [];
  const matchedBefore = new Set<number>();
  const matchedAfter = new Set<number>();
  const structuralRelations: PrimaryRelation[] = [];
  const diagnostics: ComparisonDiagnostic[] = [];
  let ambiguous = false;
  let work = 0;
  let candidateEdges = 0;
  let directWindowDisambiguations = 0;
  let localAlignmentCells = 0;
  const recordPair = (
    source: ComparisonIndexNode,
    target: ComparisonIndexNode,
    duplicate: boolean,
    evidence: ComparisonEvidence = Object.freeze({
      basis: 'exact',
      kind: 'inferred',
    })
  ) => {
    pairs.push(
      Object.freeze({
        after: target.index,
        ambiguous: duplicate,
        before: source.index,
        evidence,
      })
    );
    matchedBefore.add(source.index);
    matchedAfter.add(target.index);
  };

  if (lineage?.kind === 'expired') {
    diagnostics.push(
      Object.freeze({
        code: 'expired-lineage',
        message:
          'Recorded continuity is no longer available; this comparison uses content inference without historical attribution.',
        severity: 'warning',
      })
    );
  } else if (lineage?.kind === 'complete') {
    const beforeBySpan = new Map(
      beforeElements.map((node) => [spanKey(node.span), node])
    );
    const afterBySpan = new Map(
      afterElements.map((node) => [spanKey(node.span), node])
    );

    for (const relation of lineage.relations) {
      const sourceNodes = relation.before.map((value) =>
        beforeBySpan.get(spanKey(value))
      );
      const targetNodes = relation.after.map((value) =>
        afterBySpan.get(spanKey(value))
      );
      const valid =
        relation.operationIds.length > 0 &&
        sourceNodes.length > 0 &&
        targetNodes.length > 0 &&
        sourceNodes.every((node) => node !== undefined) &&
        targetNodes.every((node) => node !== undefined) &&
        sourceNodes.every((node) => !matchedBefore.has(node.index)) &&
        targetNodes.every((node) => !matchedAfter.has(node.index));

      if (!valid) {
        diagnostics.push(
          Object.freeze({
            code: 'identity-hint-rejected',
            message:
              'A recorded correspondence did not bind unique endpoint spans and was ignored.',
            severity: 'warning',
            spans: Object.freeze([...relation.before, ...relation.after]),
          })
        );
        continue;
      }
      const sources = sourceNodes as ComparisonIndexNode[];
      const targets = targetNodes as ComparisonIndexNode[];
      const evidence: ComparisonEvidence = Object.freeze({
        kind: 'recorded',
        operationIds: Object.freeze([...relation.operationIds]),
      });

      if (sources.length === 1 && targets.length === 1) {
        recordPair(sources[0], targets[0], false, evidence);
      } else {
        structuralRelations.push(
          Object.freeze({
            after: Object.freeze(targets.map(({ index }) => index)),
            ambiguous: false,
            before: Object.freeze(sources.map(({ index }) => index)),
            evidence,
            kind:
              sources.length === 1
                ? 'split'
                : targets.length === 1
                  ? 'join'
                  : 'many',
          })
        );
        sources.forEach(({ index }) => matchedBefore.add(index));
        targets.forEach(({ index }) => matchedAfter.add(index));
      }
    }
  }

  for (const node of beforeElements) {
    const values = exactBefore.get(node.exactHash) ?? [];

    values.push(node);
    exactBefore.set(node.exactHash, values);
  }
  for (const node of afterElements) {
    const values = exactAfter.get(node.exactHash) ?? [];

    values.push(node);
    exactAfter.set(node.exactHash, values);
  }

  for (const [hash, beforeBucket] of exactBefore) {
    const afterBucket = exactAfter.get(hash);

    if (!afterBucket) continue;
    if (
      beforeBucket.length === 1 &&
      afterBucket.length === 1 &&
      beforeBucket[0].canonical === afterBucket[0].canonical &&
      !matchedBefore.has(beforeBucket[0].index) &&
      !matchedAfter.has(afterBucket[0].index)
    ) {
      recordPair(beforeBucket[0], afterBucket[0], false);
      continue;
    }
    const byCanonicalBefore = Map.groupBy(
      beforeBucket,
      ({ canonical }) => canonical
    );
    const byCanonicalAfter = Map.groupBy(
      afterBucket,
      ({ canonical }) => canonical
    );

    for (const [canonical, sourceNodes] of byCanonicalBefore) {
      const targetNodes = byCanonicalAfter.get(canonical);

      if (!targetNodes) continue;
      const availableSources = sourceNodes.filter(
        ({ index }) => !matchedBefore.has(index)
      );
      const availableTargets = targetNodes.filter(
        ({ index }) => !matchedAfter.has(index)
      );
      const duplicate =
        availableSources.length > 1 || availableTargets.length > 1;

      if (availableSources.length === 1 && availableTargets.length === 1) {
        recordPair(availableSources[0], availableTargets[0], false);
        continue;
      }
      const sortedSources = availableSources.toSorted(compareNodeOrder);
      const sortedTargets = availableTargets.toSorted(compareNodeOrder);
      const targetByPath = new Map(
        sortedTargets.map((target) => [nodeKey(target), target])
      );
      const usedTargets = new Set<number>();
      const remainingSources: ComparisonIndexNode[] = [];

      for (const source of sortedSources) {
        const target = targetByPath.get(nodeKey(source));

        if (target && !usedTargets.has(target.index)) {
          recordPair(source, target, duplicate);
          usedTargets.add(target.index);
        } else {
          remainingSources.push(source);
        }
      }
      const remainingTargets = sortedTargets.filter(
        (target) => !usedTargets.has(target.index)
      );

      for (
        let index = 0;
        index < Math.min(remainingSources.length, remainingTargets.length);
        index += 1
      ) {
        recordPair(remainingSources[index], remainingTargets[index], duplicate);
      }
      ambiguous ||=
        duplicate &&
        Math.min(availableSources.length, availableTargets.length) > 0;
    }
  }

  let matchedGridParent = true;

  while (matchedGridParent) {
    matchedGridParent = false;
    const pairByBefore = new Map(pairs.map((pair) => [pair.before, pair]));
    const sources = beforeElements
      .filter(
        (node) =>
          !matchedBefore.has(node.index) && node.structure?.kind === 'grid'
      )
      .toSorted((left, right) => right.path.length - left.path.length);

    for (const source of sources) {
      const sourceStructure = source.structure;

      if (sourceStructure?.kind !== 'grid') continue;
      const counts = new Map<number, number>();

      for (const childIndex of source.childIndexes) {
        const childPair = pairByBefore.get(childIndex);

        if (!childPair) continue;
        const targetParent = after.nodes[childPair.after].parentIndex;

        if (targetParent !== null) {
          counts.set(targetParent, (counts.get(targetParent) ?? 0) + 1);
        }
      }
      const candidates = [...counts.entries()]
        .filter(([targetIndex, count]) => {
          const target = after.nodes[targetIndex];
          const targetStructure = target.structure;
          const sourceChildren = source.childIndexes.filter(
            (index) => before.nodes[index].kind === 'element'
          ).length;
          const targetChildren = target.childIndexes.filter(
            (index) => after.nodes[index].kind === 'element'
          ).length;

          return (
            !matchedAfter.has(targetIndex) &&
            target.type === source.type &&
            targetStructure?.kind === 'grid' &&
            targetStructure.role === sourceStructure.role &&
            count * 2 >= Math.min(sourceChildren, targetChildren)
          );
        })
        .toSorted(
          (left, right) =>
            right[1] - left[1] ||
            compareNodeOrder(after.nodes[left[0]], after.nodes[right[0]])
        );

      if (!candidates[0] || candidates[0][1] === candidates[1]?.[1]) continue;
      recordPair(
        source,
        after.nodes[candidates[0][0]],
        false,
        Object.freeze({ basis: 'structure', kind: 'inferred' })
      );
      matchedGridParent = true;
    }
  }

  for (const [root, beforeRoot] of before.roots) {
    const afterRoot = after.roots.get(root);

    if (!afterRoot) continue;
    const beforeNodes = beforeRoot.topLevelIndexes.filter(
      (index) =>
        before.nodes[index].kind === 'element' && !matchedBefore.has(index)
    );
    const afterNodes = afterRoot.topLevelIndexes.filter(
      (index) =>
        after.nodes[index].kind === 'element' && !matchedAfter.has(index)
    );
    const targetWindows = new Map<string, number[][]>();
    const targetWindowCounts = new Map<string, number>();
    const sourceWindows = new Map<string, number[][]>();
    const targetPositionByIndex = new Map(
      afterNodes.map((nodeIndex, position) => [nodeIndex, position])
    );
    const sourcePositionByIndex = new Map(
      beforeNodes.map((nodeIndex, position) => [nodeIndex, position])
    );
    const targetTokenNodes = createTokenNodeIndex(afterNodes, after);
    const sourceTokenNodes = createTokenNodeIndex(beforeNodes, before);
    const targetByPath = new Map(
      afterNodes.map((index) => [nodeKey(after.nodes[index]), index])
    );
    const sourceByPath = new Map(
      beforeNodes.map((index) => [nodeKey(before.nodes[index]), index])
    );
    const bestDirectTargetScore = (source: ComparisonIndexNode) => {
      if (directWindowDisambiguations >= MAX_DIRECT_WINDOW_DISAMBIGUATIONS) {
        return 0;
      }
      const candidates = new Set<number>();
      const samePath = targetByPath.get(nodeKey(source));
      const sourceTokens = semanticTokens(source.text);

      if (samePath !== undefined) candidates.add(samePath);
      for (const token of sourceTokens) {
        for (const index of targetTokenNodes.get(token) ?? []) {
          candidates.add(index);
          if (candidates.size >= DIRECT_CANDIDATES_PER_NODE) break;
        }
        if (candidates.size >= DIRECT_CANDIDATES_PER_NODE) break;
      }
      localAlignmentCells += candidates.size;
      let best = 0;
      for (const index of candidates) {
        if (directWindowDisambiguations >= MAX_DIRECT_WINDOW_DISAMBIGUATIONS) {
          return 0;
        }
        directWindowDisambiguations += 1;
        const target = after.nodes[index];
        const targetTokens = semanticTokens(target.text);

        if (
          !matchedAfter.has(index) &&
          candidateScore(source, target, sourceTokens, targetTokens) >= 0.58
        ) {
          best = Math.max(
            best,
            textSimilarityFromTokens(
              source.text,
              target.text,
              sourceTokens,
              targetTokens
            )
          );
        }
      }

      return best;
    };
    const bestDirectSourceScore = (target: ComparisonIndexNode) => {
      if (directWindowDisambiguations >= MAX_DIRECT_WINDOW_DISAMBIGUATIONS) {
        return 0;
      }
      const candidates = new Set<number>();
      const samePath = sourceByPath.get(nodeKey(target));
      const targetTokens = semanticTokens(target.text);

      if (samePath !== undefined) candidates.add(samePath);
      for (const token of targetTokens) {
        for (const index of sourceTokenNodes.get(token) ?? []) {
          candidates.add(index);
          if (candidates.size >= DIRECT_CANDIDATES_PER_NODE) break;
        }
        if (candidates.size >= DIRECT_CANDIDATES_PER_NODE) break;
      }
      localAlignmentCells += candidates.size;
      let best = 0;
      for (const index of candidates) {
        if (directWindowDisambiguations >= MAX_DIRECT_WINDOW_DISAMBIGUATIONS) {
          return 0;
        }
        directWindowDisambiguations += 1;
        const source = before.nodes[index];
        const sourceTokens = semanticTokens(source.text);

        if (
          !matchedBefore.has(index) &&
          candidateScore(source, target, sourceTokens, targetTokens) >= 0.58
        ) {
          best = Math.max(
            best,
            textSimilarityFromTokens(
              source.text,
              target.text,
              sourceTokens,
              targetTokens
            )
          );
        }
      }

      return best;
    };

    for (let start = 0; start < afterNodes.length; start += 1) {
      for (let size = 2; size <= MAX_WINDOW; size += 1) {
        const window = afterNodes.slice(start, start + size);

        if (window.length !== size) continue;
        const text = window.map((index) => after.nodes[index].text).join('');
        const values = targetWindows.get(text) ?? [];

        if (values.length < CANDIDATES_PER_NODE) values.push(window);
        targetWindows.set(text, values);
        targetWindowCounts.set(text, (targetWindowCounts.get(text) ?? 0) + 1);
      }
    }
    for (let start = 0; start < beforeNodes.length; start += 1) {
      for (let size = 2; size <= MAX_WINDOW; size += 1) {
        const window = beforeNodes.slice(start, start + size);

        if (window.length !== size) continue;
        const text = window.map((index) => before.nodes[index].text).join('');
        const values = sourceWindows.get(text) ?? [];

        if (values.length < CANDIDATES_PER_NODE) values.push(window);
        sourceWindows.set(text, values);
      }
    }

    for (let start = 0; start < beforeNodes.length; start += 1) {
      for (let size = 2; size <= MAX_WINDOW; size += 1) {
        const window = beforeNodes.slice(start, start + size);

        if (
          window.length !== size ||
          window.some(
            (index) =>
              matchedBefore.has(index) || before.nodes[index].text.length === 0
          )
        ) {
          continue;
        }
        const text = window.map((index) => before.nodes[index].text).join('');
        const target = targetWindows
          .get(text)
          ?.find((candidate) =>
            candidate.every(
              (index) =>
                !matchedAfter.has(index) && after.nodes[index].text.length > 0
            )
          );

        localAlignmentCells += 1;
        if (!target || text.length === 0) continue;
        structuralRelations.push(
          Object.freeze({
            after: Object.freeze([...target]),
            ambiguous: (targetWindowCounts.get(text) ?? 0) > 1,
            before: Object.freeze([...window]),
            evidence: Object.freeze({ basis: 'structure', kind: 'inferred' }),
            kind: 'many',
          })
        );
        window.forEach((index) => matchedBefore.add(index));
        target.forEach((index) => matchedAfter.add(index));
        break;
      }
    }

    for (const sourceIndex of beforeNodes) {
      if (matchedBefore.has(sourceIndex)) continue;
      const source = before.nodes[sourceIndex];
      const exactTarget = targetWindows
        .get(source.text)
        ?.find((window) =>
          window.every(
            (index) =>
              !matchedAfter.has(index) && after.nodes[index].text.length > 0
          )
        );
      const approximate = exactTarget
        ? undefined
        : boundedMatchingWindow(
            source.text,
            afterNodes,
            targetPositionByIndex,
            targetTokenNodes,
            after,
            matchedAfter
          );
      const target =
        exactTarget ??
        (approximate?.window &&
        approximate.score > bestDirectTargetScore(source)
          ? approximate.window
          : undefined);

      localAlignmentCells +=
        (targetWindows.get(source.text)?.length ?? 0) +
        (approximate?.work ?? 0);
      if (!target) continue;
      structuralRelations.push(
        Object.freeze({
          after: Object.freeze(target),
          ambiguous: (targetWindowCounts.get(source.text) ?? 0) > 1,
          before: Object.freeze([sourceIndex]),
          evidence: Object.freeze({ basis: 'structure', kind: 'inferred' }),
          kind: 'split',
        })
      );
      matchedBefore.add(sourceIndex);
      target.forEach((index) => matchedAfter.add(index));
    }

    for (const targetIndex of afterNodes) {
      if (matchedAfter.has(targetIndex)) continue;
      const target = after.nodes[targetIndex];
      const exactSource = sourceWindows
        .get(target.text)
        ?.find((window) =>
          window.every(
            (index) =>
              !matchedBefore.has(index) && before.nodes[index].text.length > 0
          )
        );
      const approximate = exactSource
        ? undefined
        : boundedMatchingWindow(
            target.text,
            beforeNodes,
            sourcePositionByIndex,
            sourceTokenNodes,
            before,
            matchedBefore
          );
      const source =
        exactSource ??
        (approximate?.window &&
        approximate.score > bestDirectSourceScore(target)
          ? approximate.window
          : undefined);

      localAlignmentCells +=
        (sourceWindows.get(target.text)?.length ?? 0) +
        (approximate?.work ?? 0);
      if (!source) continue;
      structuralRelations.push(
        Object.freeze({
          after: Object.freeze([targetIndex]),
          ambiguous: (sourceWindows.get(target.text)?.length ?? 0) > 1,
          before: Object.freeze(source),
          evidence: Object.freeze({ basis: 'structure', kind: 'inferred' }),
          kind: 'join',
        })
      );
      matchedAfter.add(targetIndex);
      source.forEach((index) => matchedBefore.add(index));
    }
  }

  await yieldComparisonWork(signal);

  const unmatchedBefore = beforeElements.filter(
    ({ index }) => !matchedBefore.has(index)
  );
  const unmatchedAfter = afterElements.filter(
    ({ index }) => !matchedAfter.has(index)
  );
  const unmatchedAfterByPath = new Map(
    unmatchedAfter.map((node) => [nodeKey(node), node])
  );
  const afterTokens = new Map<number, ReadonlySet<string>>();
  const tokenTargets = new Map<string, number[]>();

  for (const node of unmatchedAfter) {
    const tokens = semanticTokens(node.text);

    afterTokens.set(node.index, tokens);
    for (const token of tokens) {
      const values = tokenTargets.get(token) ?? [];

      if (values.length < CANDIDATES_PER_NODE) values.push(node.index);
      tokenTargets.set(token, values);
    }
  }

  const candidates: Candidate[] = [];
  let exhausted = false;

  for (const source of unmatchedBefore) {
    const sourceTokens = semanticTokens(source.text);
    const targetIndexes = new Set<number>();
    const samePath = unmatchedAfterByPath.get(nodeKey(source));

    if (samePath) targetIndexes.add(samePath.index);

    for (const token of sourceTokens) {
      for (const target of tokenTargets.get(token) ?? []) {
        targetIndexes.add(target);
        if (targetIndexes.size >= CANDIDATES_PER_NODE) break;
      }
      if (targetIndexes.size >= CANDIDATES_PER_NODE) break;
    }
    if (targetIndexes.size === 0 && source.text.length === 0) {
      for (const target of unmatchedAfter) {
        if (target.type === source.type) targetIndexes.add(target.index);
        if (targetIndexes.size >= CANDIDATES_PER_NODE) break;
      }
    }

    for (const targetIndex of targetIndexes) {
      if (candidateEdges === MAX_CANDIDATE_EDGES) {
        exhausted = true;
        break;
      }
      candidateEdges += 1;
      work += 1;
      const target = after.nodes[targetIndex];
      const score = candidateScore(
        source,
        target,
        sourceTokens,
        afterTokens.get(targetIndex) ?? new Set()
      );

      if (score >= 0.58) {
        candidates.push({ after: targetIndex, before: source.index, score });
      }
      if (work % YIELD_INTERVAL === 0) await yieldComparisonWork(signal);
    }
    if (exhausted) break;
  }

  candidates
    .toSorted(
      (left, right) =>
        right.score - left.score ||
        compareNodeOrder(
          before.nodes[left.before],
          before.nodes[right.before]
        ) ||
        compareNodeOrder(after.nodes[left.after], after.nodes[right.after])
    )
    .forEach((candidate) => {
      if (
        matchedBefore.has(candidate.before) ||
        matchedAfter.has(candidate.after)
      ) {
        return;
      }
      const pair: NodePair = Object.freeze({
        after: candidate.after,
        ambiguous: false,
        before: candidate.before,
        evidence: Object.freeze({ basis: 'unique-content', kind: 'inferred' }),
      });

      pairs.push(pair);
      matchedBefore.add(pair.before);
      matchedAfter.add(pair.after);
    });

  const relations: PrimaryRelation[] = [
    ...pairs.map((pair) =>
      Object.freeze({
        after: Object.freeze([pair.after]),
        ambiguous: pair.ambiguous,
        before: Object.freeze([pair.before]),
        evidence: pair.evidence,
        kind: 'match' as const,
      })
    ),
    ...structuralRelations,
  ];
  const relatedBefore = new Set(matchedBefore);
  const relatedAfter = new Set(matchedAfter);
  const siblings = (
    index: ComparisonDocumentIndex,
    node: ComparisonIndexNode
  ) =>
    (node.parentIndex === null
      ? (index.roots.get(node.root)?.topLevelIndexes ?? [])
      : index.nodes[node.parentIndex].childIndexes
    ).filter((child) => index.nodes[child].kind === 'element');
  const parentPairByBefore = new Map(
    pairs.map((pair) => [pair.before, pair.after])
  );
  const sameParentContext = (
    source: ComparisonIndexNode,
    target: ComparisonIndexNode
  ) =>
    source.root === target.root &&
    (source.parentIndex === null
      ? target.parentIndex === null
      : parentPairByBefore.get(source.parentIndex) === target.parentIndex);

  for (const source of beforeElements) {
    if (relatedBefore.has(source.index) || source.text.length === 0) continue;
    const targets = afterElements.filter(
      (target) =>
        !relatedAfter.has(target.index) && sameParentContext(source, target)
    );
    const targetSiblings =
      targets.length > 0 ? siblings(after, targets[0]) : [];

    for (let start = 0; start < targetSiblings.length; start += 1) {
      for (let size = 2; size <= MAX_WINDOW; size += 1) {
        const window = targetSiblings.slice(start, start + size);

        localAlignmentCells += 1;
        if (
          window.length !== size ||
          window.some((index) => relatedAfter.has(index))
        ) {
          continue;
        }
        if (
          window.map((index) => after.nodes[index].text).join('') !==
          source.text
        ) {
          continue;
        }
        relations.push(
          Object.freeze({
            after: Object.freeze(window),
            ambiguous: false,
            before: Object.freeze([source.index]),
            evidence: Object.freeze({ basis: 'structure', kind: 'inferred' }),
            kind: 'split',
          })
        );
        relatedBefore.add(source.index);
        window.forEach((index) => relatedAfter.add(index));
        start = targetSiblings.length;
        break;
      }
    }
  }

  for (const target of afterElements) {
    if (relatedAfter.has(target.index) || target.text.length === 0) continue;
    const sources = beforeElements.filter(
      (source) =>
        !relatedBefore.has(source.index) && sameParentContext(source, target)
    );
    const sourceSiblings =
      sources.length > 0 ? siblings(before, sources[0]) : [];

    for (let start = 0; start < sourceSiblings.length; start += 1) {
      for (let size = 2; size <= MAX_WINDOW; size += 1) {
        const window = sourceSiblings.slice(start, start + size);

        localAlignmentCells += 1;
        if (
          window.length !== size ||
          window.some((index) => relatedBefore.has(index))
        ) {
          continue;
        }
        if (
          window.map((index) => before.nodes[index].text).join('') !==
          target.text
        ) {
          continue;
        }
        relations.push(
          Object.freeze({
            after: Object.freeze([target.index]),
            ambiguous: false,
            before: Object.freeze(window),
            evidence: Object.freeze({ basis: 'structure', kind: 'inferred' }),
            kind: 'join',
          })
        );
        relatedAfter.add(target.index);
        window.forEach((index) => relatedBefore.add(index));
        start = sourceSiblings.length;
        break;
      }
    }
  }

  const copies: CopyRelation[] = [];
  const copyTargets = maximalUnmatched(after, relatedAfter);

  if (copyTargets.length > 0) {
    const uniqueSourceByCanonical = new Map<
      string,
      ComparisonIndexNode | null
    >();

    for (const source of beforeElements) {
      uniqueSourceByCanonical.set(
        source.canonical,
        uniqueSourceByCanonical.has(source.canonical) ? null : source
      );
    }
    for (const target of copyTargets) {
      const source = uniqueSourceByCanonical.get(target.canonical);

      if (source) {
        copies.push(
          Object.freeze({ after: target.index, before: source.index })
        );
      }
    }
  }

  if (ambiguous) {
    diagnostics.push(
      Object.freeze({
        code: 'ambiguous',
        message:
          'Repeated indistinguishable content was aligned deterministically without claiming historical identity.',
        severity: 'warning',
      })
    );
  }
  if (exhausted) {
    diagnostics.push(
      Object.freeze({
        code: 'work-limit',
        message:
          'Semantic candidate work reached its deterministic limit; unmatched content remains an exact replacement.',
        severity: 'warning',
      })
    );
  }

  const moved = placementPairs(pairs, before, after);
  const byBefore = new Map(pairs.map((pair) => [pair.before, pair]));
  const changes: ComparedChange[] = [];
  let changeIndex = 0;
  let effectIndex = 0;
  let correspondenceIndex = 0;
  const addChange = (
    beforeSpans: readonly ComparisonSpan[],
    afterSpans: readonly ComparisonSpan[],
    evidence: ComparisonEvidence,
    buildEffects: (add: (effect: EffectInput) => void) => void,
    kind: ComparisonCorrespondence['kind'] = 'primary'
  ) => {
    const effects: ComparisonEffect[] = [];
    const add = (value: EffectInput) => {
      effects.push(
        Object.freeze({
          ...value,
          id: `${comparisonId}:effect:${effectIndex}`,
        })
      );
      effectIndex += 1;
    };

    buildEffects(add);
    if (effects.length === 0) return;
    const correspondence: ComparisonCorrespondence = Object.freeze({
      after: Object.freeze([...afterSpans]),
      before: Object.freeze([...beforeSpans]),
      evidence,
      id: `${comparisonId}:correspondence:${correspondenceIndex}`,
      kind,
    });

    correspondenceIndex += 1;
    changes.push(
      Object.freeze({
        after: correspondence.after,
        before: correspondence.before,
        correspondence: Object.freeze([correspondence]),
        effects: Object.freeze(effects),
        evidence,
        id: `${comparisonId}:change:${changeIndex}`,
        requiredChangeIds: Object.freeze([]),
      })
    );
    changeIndex += 1;
  };

  for (const relation of relations.toSorted((left, right) => {
    const leftNode = before.nodes[left.before[0]] ?? after.nodes[left.after[0]];
    const rightNode =
      before.nodes[right.before[0]] ?? after.nodes[right.after[0]];

    return compareNodeOrder(leftNode, rightNode);
  })) {
    const beforeSpans = relationSpans(relation.before, before);
    const afterSpans = relationSpans(relation.after, after);

    if (relation.kind !== 'match') {
      const sourceNodes = relation.before.map((index) => before.nodes[index]);
      const targetNodes = relation.after.map((index) => after.nodes[index]);
      const sourceText = sourceNodes.map(({ text }) => text).join('');
      const targetText = targetNodes.map(({ text }) => text).join('');
      const sourceTextRuns = sequenceTextRuns(sourceNodes);
      const targetTextRuns = sequenceTextRuns(targetNodes);
      const textPropertiesChanged =
        stableStringify(
          sourceTextRuns.map(({ properties, text }) =>
            sourceText === targetText ? { properties, text } : properties
          )
        ) !==
        stableStringify(
          targetTextRuns.map(({ properties, text }) =>
            sourceText === targetText ? { properties, text } : properties
          )
        );
      const ownPropertiesChanged =
        stableStringify(sequenceOwnProperties(sourceNodes)) !==
        stableStringify(sequenceOwnProperties(targetNodes));
      const differences = sequenceTextDifferences(sourceNodes, targetNodes);

      addChange(beforeSpans, afterSpans, relation.evidence, (add) => {
        if (relation.kind === 'split') {
          add({
            after: afterSpans,
            before: beforeSpans,
            kind: 'split',
            parts: relation.after.length,
          });
        } else if (relation.kind === 'join') {
          add({
            after: afterSpans,
            before: beforeSpans,
            kind: 'join',
            parts: relation.before.length,
          });
        } else {
          add({ after: afterSpans, before: beforeSpans, kind: 'structure' });
        }
        if (ownPropertiesChanged || textPropertiesChanged) {
          add({
            after: afterSpans,
            afterProperties: Object.freeze([
              ...targetNodes.map(({ properties }) => properties),
              ...targetTextRuns.map(({ properties }) => properties),
            ]),
            before: beforeSpans,
            beforeProperties: Object.freeze([
              ...sourceNodes.map(({ properties }) => properties),
              ...sourceTextRuns.map(({ properties }) => properties),
            ]),
            kind: 'property',
          });
        }
        differences.forEach((difference) =>
          add({ ...difference, kind: 'text' })
        );
      });
      continue;
    }
    const pair = byBefore.get(relation.before[0]);

    if (!pair) continue;
    const source = before.nodes[pair.before];
    const target = after.nodes[pair.after];
    const isMoved = moved.has(pairKey(pair.before, pair.after));
    const ownPlacement =
      isMoved && !hasMovedMatchedAncestor(pair, moved, before, byBefore);

    if (source.canonical === target.canonical && !ownPlacement) continue;
    const propertiesChanged = !jsonEqual(source.properties, target.properties);
    const sourceTextRuns = comparisonTextRuns(source);
    const targetTextRuns = comparisonTextRuns(target);
    const textPropertiesChanged =
      stableStringify(
        sourceTextRuns.map(({ properties, text }) =>
          source.text === target.text ? { properties, text } : properties
        )
      ) !==
      stableStringify(
        targetTextRuns.map(({ properties, text }) =>
          source.text === target.text ? { properties, text } : properties
        )
      );
    const typeChanged = source.type !== target.type;
    const structureChanged = childOrderChanged(pair, before, after, byBefore);
    const changedDescendants = changedMatchedElementDescendants(
      pair,
      before,
      after,
      byBefore
    );
    const differences =
      source.blockContainer && changedDescendants.length > 0
        ? []
        : textDifferences(source, target).filter(
            (difference) =>
              !textDifferenceOwnedByDescendant(
                difference,
                changedDescendants,
                before,
                after
              )
          );
    const gridChildrenOwnStructure =
      structureChanged && source.structure?.kind === 'grid';

    if (
      !ownPlacement &&
      !propertiesChanged &&
      !textPropertiesChanged &&
      !typeChanged &&
      !structureChanged &&
      differences.length === 0
    ) {
      continue;
    }

    addChange(beforeSpans, afterSpans, relation.evidence, (add) => {
      if (ownPlacement) {
        add({
          after: afterSpans,
          before: beforeSpans,
          kind: 'placement',
          sourcePath: source.path,
          sourceRoot: source.root,
          targetPath: target.path,
          targetRoot: target.root,
        });
      }
      if (propertiesChanged || textPropertiesChanged) {
        add({
          after: afterSpans,
          afterProperties: Object.freeze([
            target.properties,
            ...targetTextRuns.map(({ properties }) => properties),
          ]),
          before: beforeSpans,
          beforeProperties: Object.freeze([
            source.properties,
            ...sourceTextRuns.map(({ properties }) => properties),
          ]),
          kind: 'property',
        });
      }
      if (typeChanged) {
        add({
          after: afterSpans,
          afterType: target.type,
          before: beforeSpans,
          beforeType: source.type,
          kind: 'node-type',
        });
      }
      if (structureChanged && !gridChildrenOwnStructure) {
        add({ after: afterSpans, before: beforeSpans, kind: 'structure' });
      }
      differences.forEach((difference) => add({ ...difference, kind: 'text' }));
    });
  }

  const unmatchedBeforeNodes = maximalUnmatched(before, relatedBefore);
  const unmatchedAfterNodes = maximalUnmatched(after, relatedAfter);
  const beforeWrapperNodes = ancestorsWithMatchedDescendants(
    before,
    relatedBefore
  );
  const afterWrapperNodes = ancestorsWithMatchedDescendants(
    after,
    relatedAfter
  );
  const copyByAfter = new Map(copies.map((copy) => [copy.after, copy]));

  for (const source of unmatchedBeforeNodes) {
    const beforeSpans = Object.freeze([source.span]);
    const wrapper = beforeWrapperNodes.has(source.index);

    addChange(
      beforeSpans,
      Object.freeze([]),
      Object.freeze({
        basis: wrapper ? 'structure' : 'replacement',
        kind: 'inferred',
      }),
      (add) =>
        add(
          wrapper
            ? {
                action: 'remove',
                after: [],
                before: beforeSpans,
                kind: 'wrapper',
                type: source.type,
              }
            : { after: [], before: beforeSpans, kind: 'delete' }
        )
    );
  }
  for (const target of unmatchedAfterNodes) {
    const afterSpans = Object.freeze([target.span]);
    const copy = copyByAfter.get(target.index);
    const wrapper = afterWrapperNodes.has(target.index);
    const evidence: ComparisonEvidence = Object.freeze({
      basis: copy ? 'unique-content' : wrapper ? 'structure' : 'replacement',
      kind: 'inferred',
    });

    addChange(
      copy
        ? Object.freeze([before.nodes[copy.before].span])
        : Object.freeze([]),
      afterSpans,
      evidence,
      (add) =>
        add(
          wrapper
            ? {
                action: 'add',
                after: afterSpans,
                before: [],
                kind: 'wrapper',
                type: target.type,
              }
            : { after: afterSpans, before: [], kind: 'insert' }
        ),
      copy ? 'copy' : 'primary'
    );
  }

  for (const root of [...deletedRoots].sort()) {
    const rootIndex = before.roots.get(root);
    const beforeSpans = Object.freeze([
      Object.freeze({ from: 0, root, to: rootIndex?.length ?? 0 }),
    ]);

    addChange(
      beforeSpans,
      Object.freeze([]),
      Object.freeze({ basis: 'structure', kind: 'inferred' }),
      (add) =>
        add({ after: [], before: beforeSpans, kind: 'root-delete', root })
    );
  }
  for (const root of [...createdRoots].sort()) {
    const rootIndex = after.roots.get(root);
    const afterSpans = Object.freeze([
      Object.freeze({ from: 0, root, to: rootIndex?.length ?? 0 }),
    ]);

    addChange(
      Object.freeze([]),
      afterSpans,
      Object.freeze({ basis: 'structure', kind: 'inferred' }),
      (add) => add({ after: afterSpans, before: [], kind: 'root-create', root })
    );
  }

  const beforeNodeBySpan = new Map(
    beforeElements.map((node) => [spanKey(node.span), node])
  );
  const afterNodeBySpan = new Map(
    afterElements.map((node) => [spanKey(node.span), node])
  );
  const unsupportedSpans = uniqueSpans(
    changes.flatMap(({ effects }) =>
      effects.flatMap((effect) => {
        if (
          effect.kind !== 'structure' &&
          effect.kind !== 'wrapper' &&
          effect.kind !== 'node-type'
        ) {
          return [];
        }

        return [
          ...effect.before.filter((value) => {
            const node = beforeNodeBySpan.get(spanKey(value));

            return node?.blockContainer === true && node.structure === null;
          }),
          ...effect.after.filter((value) => {
            const node = afterNodeBySpan.get(spanKey(value));

            return node?.blockContainer === true && node.structure === null;
          }),
        ];
      })
    )
  );

  if (unsupportedSpans.length > 0) {
    diagnostics.push(
      Object.freeze({
        code: 'unsupported-structure',
        message:
          'The schema has no logical structure facet for a changed container; exact tree effects are preserved without higher-level grouping.',
        severity: 'info',
        spans: unsupportedSpans,
      })
    );
  }

  assertComparisonActive(signal);

  const visibleEquivalent =
    createdRoots.size === 0 &&
    deletedRoots.size === 0 &&
    beforeElements.length === afterElements.length &&
    pairs.length === beforeElements.length &&
    moved.size === 0 &&
    pairs.every((pair) => {
      const source = before.nodes[pair.before];
      const target = after.nodes[pair.after];

      return (
        source.type === target.type &&
        jsonEqual(source.properties, target.properties) &&
        source.text === target.text &&
        stableStringify(
          comparisonTextRuns(source).map(({ properties, text }) => ({
            properties,
            text,
          }))
        ) ===
          stableStringify(
            comparisonTextRuns(target).map(({ properties, text }) => ({
              properties,
              text,
            }))
          )
      );
    });

  return Object.freeze({
    candidateEdges,
    changes: composeWrapperGroups(
      composeLogicalGroups(changes, pairs, before, after)
    ),
    diagnostics: Object.freeze(diagnostics),
    localAlignmentCells,
    visibleEquivalent,
  });
};
