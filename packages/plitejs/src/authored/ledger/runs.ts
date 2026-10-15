import {
  DocumentChange,
  getInternalDocumentRootChange,
} from '../../core/change/document-change';
import { deepFreeze } from '../../core/change/json';
import {
  type DocumentSetPropertyResolver,
  RootChange,
} from '../../core/change/root-change';
import {
  type JsonEditorValue,
  type JsonNode,
  PreparedTokenSlice,
} from '../../core/change/tokens';
import { getDefined } from '../../internal/get-defined';
import { marksOf, type ReviewFacts } from '../facts/facts';
import {
  acceptedChange,
  characterAlignedChange,
  tokenLength,
} from '../tree/alignment';
import { incarnationOf } from '../facts/records';
import {
  type AuthoredMark,
  readAuthoredMarks,
  readMembers,
} from '../tree/marks';
import { proposedSurvival } from '../tree/proposed';
import {
  type AuthoredResolveSchema,
  followsOf,
  hasBoundaryMark,
  resolveAuthoredChildren,
} from '../tree/resolve';
import { countLedgerWork } from './work';

/** Proposed accepts every pending change; accepted rejects every one. */
export type ReviewMode = 'accepted' | 'proposed';

/**
 * What a mode makes of top-level blocks: those it leaves alone, those it
 * removes whole, and the rest, which the kernel resolves in runs.
 */
export type BlockFacts = Readonly<{
  /** No review member anywhere inside. */
  bare: boolean;
  /**
   * The pending joins blocks inside follow, and the joins blocks inside hold,
   * by incarnation: a follower lands after its join's line wherever the join
   * sits, so both resolve together.
   */
  follows: readonly string[];
  joins: readonly string[];
  /** Its first line carries a join or split, so it decides with the blocks before it. */
  opensWithStructure: boolean;
  /** Accepting every change removes it whole and it carries no boundary. */
  removedProposed: boolean;
}>;

const FACTS = new WeakMap<JsonNode, BlockFacts>();

const bare = (node: JsonNode): boolean => {
  countLedgerWork('visitedNodes');

  return (
    readMembers(node).length === 0 &&
    (typeof node.text === 'string' || (node.children ?? []).every(bare))
  );
};

const keysIn = (
  node: JsonNode,
  keyOf: (mark: AuthoredMark) => string | undefined
): string[] => {
  if (typeof node.text === 'string') return [];

  const own = readAuthoredMarks(node).flatMap((mark) => {
    const key = keyOf(mark);

    return key === undefined ? [] : [key];
  });

  return [
    ...own,
    ...(node.children ?? []).flatMap((child) => keysIn(child, keyOf)),
  ];
};

const opensWithStructure = (node: JsonNode): boolean => {
  for (let current: JsonNode | undefined = node; current;) {
    countLedgerWork('visitedNodes');
    if (hasBoundaryMark(current)) return true;
    if (typeof current.text === 'string') return false;
    current = current.children?.[0];
  }

  return false;
};

/** @internal */
export const blockFactsOf = (node: JsonNode): BlockFacts => {
  let facts = FACTS.get(node);

  if (!facts) {
    countLedgerWork('blockFacts');

    const isBare = bare(node);

    facts = isBare
      ? BARE
      : {
          bare: false,
          follows: [...new Set(keysIn(node, followsOf))],
          joins: [
            ...new Set(
              keysIn(node, (mark) =>
                mark.kind === 'join' ? incarnationOf(mark) : undefined
              )
            ),
          ],
          opensWithStructure: opensWithStructure(node),
          removedProposed:
            !proposedSurvival.survives(node) && !hasBoundaryMark(node),
        };
    FACTS.set(node, facts);
  }

  return facts;
};

const BARE: BlockFacts = Object.freeze({
  bare: true,
  follows: [],
  joins: [],
  opensWithStructure: false,
  removedProposed: false,
});

/** Whether `mode` removes the block whole without the kernel. */
export const removesBlock = (mode: ReviewMode, facts: BlockFacts) =>
  mode === 'proposed' && facts.removedProposed;

/** Blocks that resolve together, and what the mode makes of them. */
export type Run = Readonly<{
  /** The blocks the mode keeps in their place. */
  change: RootChange | null;
  nodes: readonly JsonNode[];
  output: readonly JsonNode[];
  /** Token lengths of the stored blocks and of the output. */
  outputLength: number;
  storedLength: number;
}>;

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

const deepCount = (node: JsonNode): number =>
  1 + (node.children ?? []).reduce((sum, child) => sum + deepCount(child), 0);

const lengthOf = (nodes: readonly JsonNode[]) =>
  nodes.reduce((sum, node) => sum + tokenLength(node), 0);

export type RunContext = Readonly<{
  facts: ReviewFacts;
  isSetValued: DocumentSetPropertyResolver;
  mode: ReviewMode;
  root: string;
  schema: AuthoredResolveSchema | null;
}>;

// The run-local change from the kept blocks to what the mode makes of them,
// aligned as a decision aligns: by structure, then by characters.
const localChange = (
  kept: readonly JsonNode[],
  output: readonly JsonNode[],
  context: RunContext
): RootChange | null => {
  const stored = { children: kept } as JsonEditorValue;
  const decided = { children: output } as JsonEditorValue;
  const change =
    context.mode === 'proposed'
      ? acceptedChange(stored, decided, { isSetValued: context.isSetValued })
      : (characterAlignedChange(stored, decided, {
          joins: (node) =>
            marksOf(node, context.facts).some((mark) => mark.kind === 'split'),
          removes: (node) =>
            marksOf(node, context.facts).some(
              (mark) => mark.kind === 'insert'
            ),
        }) ??
        DocumentChange.between(stored, decided, {
          isSetValued: context.isSetValued,
        }));

  return change.empty
    ? null
    : (getInternalDocumentRootChange(change, 'main') ?? null);
};

/**
 * Resolve one run through the kernel: blocks the mode removes whole become a
 * deletion, and the kept blocks resolve together.
 */
export const resolveRun = (
  nodes: readonly JsonNode[],
  context: RunContext,
  cache: WeakMap<JsonNode, Run>,
  whole = false
): Run => {
  const cached = whole ? undefined : cache.get(getDefined(nodes[0]));

  if (
    cached?.nodes.length === nodes.length &&
    cached.nodes.every((node, index) => node === nodes[index])
  ) {
    return cached;
  }

  countLedgerWork('resolvedRuns');
  countLedgerWork(
    'resolvedNodes',
    nodes.reduce((sum, node) => sum + deepCount(node), 0)
  );

  const removed = (node: JsonNode) =>
    !whole && removesBlock(context.mode, blockFactsOf(node));
  const kept = nodes.filter((node) => !removed(node));
  const ranges: Array<[number, number]> = [];
  let storedLength = 0;

  for (const node of nodes) {
    const length = tokenLength(node);

    if (removed(node)) {
      const last = ranges.at(-1);

      if (last && last[1] === storedLength) last[1] += length;
      else ranges.push([storedLength, storedLength + length]);
    }
    storedLength += length;
  }

  const output =
    kept.length === 0 ||
    (!whole &&
      context.mode === 'proposed' &&
      !kept.some(proposedSurvival.survives))
      ? []
      : deepFreeze(
          resolveAuthoredChildren(
            kept,
            () => (context.mode === 'proposed' ? 'accept' : 'reject'),
            context.schema,
            context.root,
            { facts: context.facts }
          )
        ).children;
  let change = kept.length > 0 ? localChange(kept, output, context) : null;

  if (ranges.length > 0) {
    const removal = deleting(storedLength, ranges);

    change = change ? removal.compose(change) : removal;
  }

  const run: Run = {
    change,
    nodes,
    output,
    outputLength: lengthOf(output),
    storedLength,
  };

  if (!whole) cache.set(getDefined(nodes[0]), run);

  return run;
};
