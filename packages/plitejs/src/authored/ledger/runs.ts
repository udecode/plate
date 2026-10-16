import { getInternalDocumentRootChange } from '../../core/change/document-change';
import { deepFreeze, jsonEqual } from '../../core/change/json';
import {
  type DocumentSetPropertyResolver,
  RootChange,
} from '../../core/change/root-change';
import {
  type JsonEditorValue,
  type JsonNode,
  PreparedTokenSlice,
} from '../../core/change/tokens';
import type { RecordSetVersion } from '../../core/record-store';
import type { RootPart } from '../../core/representation';
import { survivalUnder } from '../../core/survival';
import { getDefined } from '../../internal/get-defined';
import type { ReviewFacts } from '../facts/facts';
import { incarnationOf } from '../facts/records';
import type { AuthoredFormatProjection } from '../format';
import {
  acceptedChange,
  decidedContentChange,
  tokenLength,
} from '../tree/alignment';
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
  isTextBlock,
  resolveAuthoredChildren,
} from '../tree/resolve';
import { countLedgerWork } from './work';

export type BlockFacts = Readonly<{
  unmarked: boolean;
  /**
   * The pending joins blocks inside follow, and the joins blocks inside hold,
   * by incarnation: a follower lands after its join's line wherever the join
   * sits, so both resolve together.
   */
  follows: readonly string[];
  joins: readonly string[];
  /** A join or split can land on its first line, so it decides with the blocks before it. */
  opensWithStructure: boolean;
  /**
   * Whether the mode keeps one of its lines. A join reaches back over lines
   * the mode drops, so it passes over a block that keeps none.
   */
  keepsLine: Readonly<Record<AuthoredFormatProjection, boolean>>;
  /** It carries an insertion claim of its own, so it holds no prefix slot at the start. */
  inserted: boolean;
  removedProposed: boolean;
}>;

const FACTS = new WeakMap<JsonNode, BlockFacts>();

const unmarked = (node: JsonNode): boolean => {
  countLedgerWork('visitedNodes');

  return (
    readMembers(node).length === 0 &&
    (typeof node.text === 'string' || (node.children ?? []).every(unmarked))
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

// A line with review marks can vanish in one mode, and an unwrap lifts the
// lines after it, so a join behind marked lines can still open the block.
const opensWithStructure = (node: JsonNode): boolean => {
  countLedgerWork('visitedNodes');
  if (hasBoundaryMark(node)) return true;
  if (typeof node.text === 'string') return false;
  for (const child of node.children ?? []) {
    if (opensWithStructure(child)) return true;
    if (unmarked(child)) return false;
  }

  return false;
};

const SURVIVAL = {
  accepted: survivalUnder<JsonNode>((node) =>
    readAuthoredMarks(node).some((mark) => mark.kind === 'insert')
  ),
  proposed: proposedSurvival,
};

const keepsLine = (node: JsonNode, mode: AuthoredFormatProjection): boolean =>
  isTextBlock(node)
    ? SURVIVAL[mode].survives(node)
    : (node.children ?? []).some(
        (child) => typeof child.text !== 'string' && keepsLine(child, mode)
      );

/** @internal */
export const blockFactsOf = (node: JsonNode): BlockFacts => {
  let facts = FACTS.get(node);

  if (!facts) {
    countLedgerWork('blockFacts');

    const isUnmarked = unmarked(node);

    facts = isUnmarked
      ? UNMARKED
      : {
          unmarked: false,
          follows: [...new Set(keysIn(node, followsOf))],
          joins: [
            ...new Set(
              keysIn(node, (mark) =>
                mark.kind === 'join' ? incarnationOf(mark) : undefined
              )
            ),
          ],
          inserted: readAuthoredMarks(node).some(
            (mark) => mark.kind === 'insert'
          ),
          keepsLine: {
            accepted: keepsLine(node, 'accepted'),
            proposed: keepsLine(node, 'proposed'),
          },
          opensWithStructure: opensWithStructure(node),
          removedProposed:
            !proposedSurvival.survives(node) && !hasBoundaryMark(node),
        };
    FACTS.set(node, facts);
  }

  return facts;
};

const UNMARKED: BlockFacts = Object.freeze({
  unmarked: true,
  follows: [],
  inserted: false,
  joins: [],
  keepsLine: { accepted: true, proposed: true },
  opensWithStructure: false,
  removedProposed: false,
});

export const removesBlock = (
  mode: AuthoredFormatProjection,
  facts: BlockFacts
) => mode === 'proposed' && facts.removedProposed;

export type Run = Readonly<{
  /** On a run the commands wrote, built on its first read. */
  change: RootChange | null;
  /** Whether the run's output differs from its stored nodes, known without building `change`. */
  changed: boolean;
  nodes: readonly JsonNode[];
  output: readonly JsonNode[];
  outputLength: number;
  part: RootPart;
  storedLength: number;
  verdicts: RecordSetVersion;
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

const samePart = (left: RootPart, right: RootPart) =>
  left.head === right.head && left.min === right.min;

const deepCount = (node: JsonNode): number =>
  1 + (node.children ?? []).reduce((sum, child) => sum + deepCount(child), 0);

const lengthOf = (nodes: readonly JsonNode[]) =>
  nodes.reduce((sum, node) => sum + tokenLength(node), 0);

export type RunContext = Readonly<{
  facts: ReviewFacts;
  isSetValued: DocumentSetPropertyResolver;
  mode: AuthoredFormatProjection;
  root: string;
  schema: AuthoredResolveSchema | null;
  /** The verdict set's version `facts` reads. */
  verdicts: RecordSetVersion;
}>;

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
      : decidedContentChange(stored, decided, {
          facts: context.facts,
          outcomes: 'reject',
        });

  return change.empty
    ? null
    : (getInternalDocumentRootChange(change, 'main') ?? null);
};

/** A tail run of one block the mode removes whole, which needs no kernel. */
export const removedRun = (node: JsonNode, context: RunContext): Run => {
  const storedLength = tokenLength(node);

  return {
    change: deleting(storedLength, [[0, storedLength]]),
    changed: true,
    nodes: [node],
    output: [],
    outputLength: 0,
    part: { head: false, min: 0 },
    storedLength,
    verdicts: context.verdicts,
  };
};

/**
 * Resolve one run through the kernel as `part` of its root. In a tail that
 * fills none of the minimum, blocks the mode removes whole become a
 * deletion, and the kept blocks resolve together. A head keeps every block,
 * since a removed one still decides whether a prefix slot is vacated, and so
 * does a run that fills the minimum, which completes even when no block
 * survives.
 */
export const resolveRun = (
  nodes: readonly JsonNode[],
  context: RunContext,
  cache: WeakMap<JsonNode, Run>,
  part: RootPart
): Run => {
  const cached = cache.get(getDefined(nodes[0]));

  if (
    cached &&
    cached.verdicts === context.verdicts &&
    samePart(cached.part, part) &&
    cached.nodes.length === nodes.length &&
    cached.nodes.every((node, index) => node === nodes[index])
  ) {
    return cached;
  }

  countLedgerWork('resolvedRuns');
  if (part.head) countLedgerWork('headRuns');
  if (part.min > 0) countLedgerWork('filledRuns');
  countLedgerWork(
    'resolvedNodes',
    nodes.reduce((sum, node) => sum + deepCount(node), 0)
  );

  const input = inputOf(nodes, context, part);
  const { kept, tail } = input;
  const output =
    kept.length === 0 ||
    (tail &&
      context.mode === 'proposed' &&
      !kept.some(proposedSurvival.survives))
      ? []
      : deepFreeze(
          resolveAuthoredChildren(
            kept,
            () => (context.mode === 'proposed' ? 'accept' : 'reject'),
            context.schema,
            context.root,
            { facts: context.facts, part }
          )
        ).children;
  const change = changeOf(input, output, context);
  const run: Run = {
    change,
    changed: !!change,
    nodes,
    output,
    outputLength: lengthOf(output),
    part,
    storedLength: input.storedLength,
    verdicts: context.verdicts,
  };

  cache.set(getDefined(nodes[0]), run);

  return run;
};

/**
 * A run whose output the frame's commands wrote, which its stored nodes
 * project to, so the kernel need not resolve it.
 */
export const writtenRun = (
  nodes: readonly JsonNode[],
  output: readonly JsonNode[],
  context: RunContext,
  cache: WeakMap<JsonNode, Run>,
  part: RootPart
): Run => {
  countLedgerWork('writtenRuns');
  countLedgerWork(
    'writtenNodes',
    nodes.reduce((sum, node) => sum + deepCount(node), 0)
  );

  const input = inputOf(nodes, context, part);
  const changed =
    input.ranges.length > 0 ||
    output.length !== input.kept.length ||
    output.some((node, index) => !jsonEqual(node, input.kept[index]));
  let change: RootChange | null = null;
  const run: Run = {
    get change() {
      if (changed) {
        change ??=
          changeOf(input, output, context) ??
          RootChange.empty(input.storedLength);
      }

      return change;
    },
    changed,
    nodes,
    output,
    outputLength: lengthOf(output),
    part,
    storedLength: input.storedLength,
    verdicts: context.verdicts,
  };

  cache.set(getDefined(nodes[0]), run);

  return run;
};

const inputOf = (
  nodes: readonly JsonNode[],
  context: RunContext,
  part: RootPart
) => {
  const tail = !part.head && part.min === 0;
  const removed = (node: JsonNode) =>
    tail && removesBlock(context.mode, blockFactsOf(node));
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

  return { kept, ranges, storedLength, tail };
};

const changeOf = (
  { kept, ranges, storedLength }: ReturnType<typeof inputOf>,
  output: readonly JsonNode[],
  context: RunContext
) => {
  const change = kept.length > 0 ? localChange(kept, output, context) : null;

  if (ranges.length === 0) return change;

  const removal = deleting(storedLength, ranges);

  return change ? removal.compose(change) : removal;
};
