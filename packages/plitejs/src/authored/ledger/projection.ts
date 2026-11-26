import { DocumentIndex } from '../../core/change/document-index';
import { jsonEqual } from '../../core/change/json';
import { RootChange } from '../../core/change/root-change';
import type { JsonNode } from '../../core/change/tokens';
import { canonicalJsonKey } from '../../core/change/transform';
import type { ChangedRange } from '../../core/measured-sequence';
import { getDefined } from '../../internal/get-defined';
import type { AuthoredFormatProjection } from '../format';
import { unrepresentableFor } from '../refusal';
import type { AuthoredResolveSchema } from '../tree/resolve';
import {
  compose,
  isLevelRun,
  keepsOwn,
  Level,
  type ResolvedWindow,
  settles,
  type WrittenList,
} from './level';
import { isBuilt, type RunContext, readsRootSpares } from './runs';
import { countLedgerWork, nodesIn } from './work';

// Each block's own fields, and its text when it holds no block, so the same
// blocks in another order read alike.
const blocksOf = (nodes: readonly JsonNode[]): string[] =>
  nodes.flatMap((node) => {
    if (typeof node.text === 'string') return [];

    const children = node.children ?? [];
    const { children: _children, ...own } = node;

    return children.some((child) => typeof child.text !== 'string')
      ? [canonicalJsonKey(own), ...blocksOf(children)]
      : [canonicalJsonKey(node)];
  });

/**
 * Refuses a framed write where a window the gate resolved shows other than
 * what the commands wrote there: a follower lands where its claim says, not
 * where it was typed. Only blocks between the first and the last place in a
 * window where the two roots differ by reference are compared, so a block
 * moved past a block both roots share still reads as moved. A window of one
 * container its level showed is checked by the windows inside it, where both
 * roots hold that container with the same fields.
 */
const assertShowsWritten = (
  whole: DocumentIndex,
  shown: DocumentIndex,
  windows: readonly ResolvedWindow[]
) => {
  let kept = whole.size;

  while (kept > shown.size && isBuilt(getDefined(whole.child(kept - 1)))) {
    kept -= 1;
  }

  const written =
    kept === whole.size
      ? whole
      : DocumentIndex.fromIndexedNodes(whole.nodes.slice(0, kept));
  const compare = ([fromA, toA, fromB, toB]: ChangedRange) => {
    const wroteNodes = written.nodes.slice(fromA, toA);
    const shownNodes = shown.nodes.slice(fromB, toB);
    const read = nodesIn(wroteNodes) + nodesIn(shownNodes);

    countLedgerWork('comparedBlocks', toA - fromA + toB - fromB);
    countLedgerWork('comparedNodes', read);

    if (jsonEqual(wroteNodes, shownNodes)) return;

    countLedgerWork('classifiedNodes', read);

    const left = blocksOf(wroteNodes).toSorted();
    const right = blocksOf(shownNodes).toSorted();

    throw unrepresentableFor(jsonEqual(left, right) ? 'reordered' : 'diverged');
  };
  const met: Array<{ range: ChangedRange; window: ResolvedWindow }> = [];

  for (const range of written.changedChildren(shown)) {
    const [, toA, fromB, toB] = range;
    const window = windows.find(({ end, first }) =>
      fromB === toB
        ? first <= fromB && fromB <= end
        : fromB < end && first < toB
    );
    if (!window) continue;

    const open = met.at(-1);

    if (open?.window === window) {
      open.range = [open.range[0], toA, open.range[2], toB];
    } else {
      met.push({ range, window });
    }
  }
  for (const { range, window } of met) {
    const [fromA, toA, fromB, toB] = range;
    const wrote = written.child(fromA);
    const shows = shown.child(fromB);
    const inside =
      window.inner &&
      toA - fromA === 1 &&
      toB - fromB === 1 &&
      wrote &&
      shows &&
      keepsOwn(wrote, shows)
        ? ([written.childrenAt(fromA), shown.childrenAt(fromB)] as const)
        : null;

    if (inside?.[0] && inside[1] && window.inner) {
      assertShowsWritten(inside[0], inside[1], window.inner);
    } else {
      compare(range);
    }
  }
};

type ChangedSpan = Readonly<{
  fromA: number;
  fromB: number;
  toA: number;
  toB: number;
}>;

const keepUnchanged = (
  from: DocumentIndex,
  after: DocumentIndex,
  change: RootChange,
  passthroughs: ReadonlySet<JsonNode>
): DocumentIndex => {
  if (change.empty && passthroughs.size === 0) return from;

  const ranges: ChangedSpan[] = [];

  change.iterChangedRanges((fromA, toA, fromB, toB) => {
    ranges.push({ fromA, fromB, toA, toB });
  });

  if (ranges.length === 0 && passthroughs.size === 0) return from;

  const firstRangeAt = (nodeFrom: number) => {
    let low = 0;
    let high = ranges.length;

    while (low < high) {
      const mid = (low + high) >> 1;
      const range = getDefined(ranges[mid]);

      if (range.toB <= nodeFrom) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    return low;
  };

  const reconcile = (
    node: JsonNode,
    path: readonly number[],
    nodeFrom: number,
    nodeTo: number
  ): JsonNode => {
    if (passthroughs.has(node)) return node;

    const start = firstRangeAt(nodeFrom);
    let touched = false;

    for (let index = start; index < ranges.length; index += 1) {
      const range = getDefined(ranges[index]);

      if (range.fromB > nodeTo) break;
      if (range.fromB === range.toB) {
        if (range.fromB <= nodeFrom || range.fromB >= nodeTo) continue;
        touched = true;
        break;
      }
      if (range.fromB >= nodeTo) break;
      if (range.fromB <= nodeFrom && nodeTo <= range.toB) return node;
      touched = true;
    }

    if (!touched) {
      const previous = start > 0 ? getDefined(ranges[start - 1]) : null;
      const shift = previous ? previous.toA - previous.toB : 0;
      const beforeFrom = nodeFrom + shift;
      const entry = from.nodeStartingAt(beforeFrom);

      if (entry && entry.from === beforeFrom && entry.to === nodeTo + shift) {
        return from.node(entry.path);
      }

      return node;
    }

    if (typeof node.text === 'string' || !node.children?.length) return node;

    let changedChild = false;
    const children = node.children.map((child, childIndex) => {
      const childPath = [...path, childIndex];
      const range = after.nodeRange(childPath);
      const kept = reconcile(child, childPath, range.from, range.to);

      if (kept !== child) changedChild = true;

      return kept;
    });

    return changedChild
      ? Object.freeze({
          ...node,
          children: Object.freeze(children),
        })
      : node;
  };

  let changedRoot = false;
  const nodes: JsonNode[] = [];

  for (let index = 0; index < after.size; index += 1) {
    const node = getDefined(after.child(index));
    const range = after.nodeRange([index]);
    const kept = reconcile(node, [index], range.from, range.to);

    if (kept !== node) changedRoot = true;
    nodes.push(kept);
  }

  return changedRoot ? DocumentIndex.fromIndexedNodes(nodes) : after;
};

const sharesNothing = (
  ranges: readonly ChangedRange[],
  before: DocumentIndex,
  after: DocumentIndex
) => {
  const [whole] = ranges;

  return (
    ranges.length === 1 &&
    whole?.[0] === 0 &&
    whole[1] === before.size &&
    before.size > 1 &&
    after.size > 1
  );
};

/** @internal */
export class RootProjection extends Level {
  private schema: AuthoredResolveSchema;

  constructor(
    mode: AuthoredFormatProjection,
    stored: DocumentIndex,
    context: RunContext
  ) {
    super(mode, stored, context);
    this.schema = context.schema;
    this.publish(null, null);
  }

  get previewRoot() {
    return this.projected;
  }

  /** Take `index`, a root with this projection's content, as its index. */
  adopt(index: DocumentIndex) {
    this.projected = index;
  }

  unpendedSpareReaders(stored: DocumentIndex, context: RunContext): number[] {
    const { size } = this.slots;

    if (size === 0) return [];

    const ranges = this.stored.changedChildren(stored);
    const readers: number[] = [];

    for (const first of new Set([0, this.headRank(size - 1)])) {
      const { run } = this.slots.at(first);

      if (!run || isLevelRun(run) || !readsRootSpares(run.part, context)) {
        continue;
      }

      let shift = 0;
      let reached = false;

      for (const range of ranges) {
        const [fromA, toA, fromB, toB] = range;

        reached = this.pendReaches(range, first);
        if (reached || fromA > first) break;
        shift += toB - fromB - (toA - fromA);
      }
      if (!reached) readers.push(first + shift);
    }

    return readers;
  }

  sync(
    stored: DocumentIndex,
    context: RunContext,
    touched: readonly number[] = [],
    written: WrittenList | null = null
  ): RootChange | null {
    const from = this.projected;
    let change: RootChange | null;

    if (context.schema === this.schema) {
      const ranges = this.stored.changedChildren(stored);

      if (ranges.length === 0 && touched.length === 0) {
        this.stored = stored;
        return null;
      }
      change = this.apply(ranges, stored, context, touched, written);
    } else {
      this.schema = context.schema;
      this.cache = new WeakMap();
      this.build(stored, context);
      change = this.diffFrom(from, context);
    }
    return this.publish(from, change);
  }

  private diffFrom(from: DocumentIndex, context: RunContext): RootChange {
    const change = RootChange.betweenChangedBlocks(from, this.projected, {
      isSetValued: context.isSetValued,
    });

    if (this.changed) {
      const passthroughs = new Set<JsonNode>();

      this.collectPassthroughNodes(passthroughs);
      this.projected = keepUnchanged(
        from,
        this.projected,
        change,
        passthroughs
      );
      this.bindLevels();
    }

    return change;
  }

  private publish(from: DocumentIndex | null, change: RootChange | null) {
    if (!this.changed) {
      this.projected = this.stored;

      return change && !change.empty ? change : null;
    }
    if (from && (!change || change.empty)) {
      this.projected = from;
      return null;
    }

    return change;
  }

  private apply(
    ranges: readonly ChangedRange[],
    stored: DocumentIndex,
    context: RunContext,
    touched: readonly number[],
    written: WrittenList | null
  ): RootChange | null {
    const from = this.projected;

    if (sharesNothing(ranges, this.stored, stored)) {
      const builtBefore = this.builds;

      this.build(stored, context);

      // The rebuild resolves the root as one window.
      if (written) {
        let settled = !builtBefore;

        this.slots.forEach(0, this.slots.size, (slot) => {
          settled &&= settles(slot.facts, context);
        });
        if (!settled) {
          assertShowsWritten(written.index, this.projected, [
            { end: this.projected.size, first: 0, inner: null },
          ]);
        }
      }

      return this.diffFrom(from, context);
    }

    const pended = this.pend(ranges, stored, context);

    this.stored = stored;
    for (const rank of touched) this.pendRun(rank, context);

    const line = this.lineOf(stored, context);

    const resolved = this.resolvePending(
      line,
      context,
      written,
      !pended,
      !!written
    );
    const change = compose(
      compose(pended, resolved.change),
      this.settle(line, context)
    );

    // `settle` may still fill the root's minimum, as the commands' root did.
    if (written && resolved.windows.length > 0) {
      assertShowsWritten(written.index, this.projected, resolved.windows);
    }

    return change;
  }
}
