import type {
  DraftStep,
  DraftStepOrigin,
  DraftStepSource,
} from '../../core/change/builder';
import {
  createInternalDocumentChange,
  type DocumentChange,
  getInternalDocumentChangeEntries,
  valueRootIndex,
} from '../../core/change/document-change';
import {
  DocumentIndex,
  type IndexedNodeRange,
} from '../../core/change/document-index';
import { type JsonRecord, jsonEqual } from '../../core/change/json';
import {
  applyPropertyModifications,
  mapRootChangePositionBackward,
  RootChange,
  type RootChangeSection,
  type SectionData,
  semanticPropertyModifications,
} from '../../core/change/root-change';
import {
  closeToken,
  encodeNodes,
  type JsonEditorValue,
  type JsonNode,
  type JsonToken,
  openToken,
  PreparedTokenSlice,
  textToken,
} from '../../core/change/tokens';
import {
  normalizeSetValues,
  type PropertyModification,
} from '../../core/change/transform';
import type {
  CommandProjection,
  ProjectionBreak,
} from '../../core/command-document';
import type { ResolvedTokenEntry } from '../../core/resolved-token-cursor';
import type { EditorJsonValue } from '../../interfaces/json';
import { getDefined } from '../../internal/get-defined';
import type { Dependencies } from '../facts/dependencies';
import { isEditingChange } from '../facts/editing';
import { incarnationOf } from '../facts/records';
import { unrepresentable } from '../refusal';
import { isCut } from './cuts';
import { type FormatTag, type LayerValue, writeLayer } from './layers';
import {
  AUTHORED_MARKS_KEY,
  type AuthoredMark,
  type AuthoredMember,
  readMembers,
  withMembers,
} from './marks';
import { followsOf, isTextBlock } from './resolve';

export type AuthoredRecordInput = Readonly<{
  before: JsonEditorValue;
  /** Id of the change a Suggesting transaction creates. */
  changeId: string;
  dependencies: Dependencies;
  createRoots: ReadonlySet<string>;
  /**
   * A fresh id for each format tag and inline split cut, unique across
   * collaborators.
   */
  createTagId: () => string;
  /**
   * The children an element keeps when a suggestion withdraws every child,
   * as completion builds them at `site`: the element and its ancestors,
   * nearest first.
   */
  fill: (
    site: ReadonlyArray<Readonly<JsonRecord>>,
    root: string
  ) => readonly JsonNode[];
  deleteRoots: ReadonlySet<string>;
  /**
   * Whether an empty text keeps property `key` at `value` under `parents`,
   * nearest first, as the canonical form decides.
   */
  emptyTextKeeps: (
    key: string,
    value: unknown,
    parents: ReadonlyArray<Readonly<JsonRecord>>,
    root: string
  ) => boolean;
  /** A forced change: "own" then means this change, not the writer. */
  forcedChangeId?: string | null;
  /** The forced change's incarnation, when it is not `<change>@<now>`. */
  inc?: string | null;
  /**
   * The projection of `before` a command frame's commands wrote the steps on,
   * which hides content they never saw.
   */
  projection?: CommandProjection;
  /** Whether an element with `props` is inline, so a split of it records a cut. */
  isInline: (props: Readonly<JsonRecord>) => boolean;
  /**
   * Whether the element a split of `source` continues into, written as
   * `continuation`, keeps property `key` with `value`; an `undefined` value
   * asks about the key alone.
   */
  keepsOnSplit: (
    split: SplitContinuation,
    root: string
  ) => (key: string, value: unknown) => boolean;
  now: number;
  /** Element types that hold exactly one text, which marks must not split. */
  oneText?: (type: string) => boolean;
  /** The collapsed caret's position in the before document, and its root. */
  selectionBefore?: Readonly<{ position: number; root: string }> | null;
  steps: readonly DraftStep[];
  writer: string;
}>;

export type AuthoredRecordResult = Readonly<{
  anchorChange: (plainAfter: (root: string) => DocumentIndex) => DocumentChange;
  change: DocumentChange;
  indexedAfter: ReadonlyMap<string, DocumentIndex>;
  /**
   * Map a position in the plain draft after the last step into the recorded
   * document. A selection position is a `caret`, the default: at a removal
   * kept in place, it goes to the side the deletion moved away from.
   */
  mapPosition: (
    root: string,
    position: number,
    assoc: -1 | 1,
    caret?: boolean
  ) => number;
  writtenPlain: boolean;
}>;

type Props = Readonly<JsonRecord>;

/**
 * Maps a position between drafts. A removal the review draft keeps in place
 * maps to the side `assoc` names; a `caret` instead goes to the side the
 * deletion moved away from, as the selection after Backspace or Delete does.
 */
type PosMap = (position: number, assoc: -1 | 1, caret?: boolean) => number;

type SplitContinuation = Readonly<{
  continuation: Props;
  path: readonly number[];
  reviewDraft: readonly JsonNode[];
  source: Props;
}>;

type Context = Readonly<{
  contentFrom: number;
  contentTo: number;
  kind: 'element' | 'text';
  path: readonly number[];
  props: Props;
}>;

type Op =
  | Readonly<{ at: number; kind: 'insert'; tokens: readonly JsonToken[] }>
  | Readonly<{ at: number; kind: 'props'; props: Props }>
  | Readonly<{ from: number; kind: 'remove'; to: number }>;

// One section run of a plain step, in review coordinates: `before` and
// `removed` address the review draft, `after` the step's output with its
// inserted tokens as the plain step wrote them, and `plainFrom` and `plainAt`
// the plain draft before the step.
type Group =
  | Readonly<{
      after: number;
      before: number;
      data: null;
      kind: 'kept';
      length: number;
    }>
  | Readonly<{
      after: number;
      before: number;
      data: readonly PropertyModification[];
      kind: 'kept';
      length: 1;
      plainAt: number;
    }>
  | Readonly<{
      after: number;
      before: number;
      kind: 'replace';
      plainFrom: number;
      plainRemoved: number;
      removed: number;
      slice: PreparedTokenSlice;
    }>;

// How a step-output position maps into the recorded document: through a kept
// review position, through a plain position the step kept (via the fold's
// map), into tokens the recording inserted at one review position, or to one
// side of a removal the recording kept in place.
type Piece =
  | Readonly<{
      afterFrom: number;
      afterTo: number;
      beforeFrom: number;
      kind: 'kept';
    }>
  | Readonly<{
      afterFrom: number;
      afterTo: number;
      kind: 'shifted';
      plainFrom: number;
    }>
  | Readonly<{
      afterFrom: number;
      afterTo: number;
      at: number;
      kind: 'inserted';
      offsets: readonly number[];
    }>
  | Readonly<{
      after: number;
      beforeFrom: number;
      beforeTo: number;
      kind: 'removed';
      leftward: boolean;
    }>;

const propsOf = (node: unknown): Props => {
  if (typeof node !== 'object' || node === null) return {};
  const { children: _children, text: _text, ...props } = node as JsonRecord;

  return props;
};

const withoutHeld = (props: Props) => {
  const members = readMembers(props);

  return members.some((member) => member.kind === 'held')
    ? withMembers(
        props,
        members.filter((member) => member.kind !== 'held')
      )
    : props;
};

// Structure that a write inside the element leaves in place under every
// outcome.
const BOUNDARY_KINDS: ReadonlySet<AuthoredMember['kind']> = new Set([
  'join',
  'split',
  'unwrap',
  'wrap',
]);

const reviewed = (token: JsonToken) =>
  token.kind === 'open' && readMembers(token.props).length > 0;

/**
 * The insertion the content belongs to: the last one, since `marks` lists a
 * node's insertions outer to inner. A block's `follows` insertion is listed
 * outside that order.
 */
const innermostInsert = (marks: readonly AuthoredMark[]) =>
  marks.findLast((mark) => mark.kind === 'insert');

const struckWhole = (node: JsonNode): boolean => {
  const members = readMembers(node);

  return (
    members.length > 0 &&
    members.every(
      (member) => member.kind === 'delete' && !isEditingChange(member.change)
    ) &&
    (node.children ?? []).every(struckWhole)
  );
};

const bareContextAt = (index: DocumentIndex, position: number) =>
  index
    .openContextAt(position)
    .filter(
      (entry) => entry.contentFrom <= position && position <= entry.contentTo
    )
    .map((entry) => withMembers(propsOf(index.node(entry.path)), []));

const identity: PosMap = (position) => position;

/**
 * The accepted position at the far side of an empty accepted leaf whose
 * stored letters the projection hid, with the stored edge of that leaf on the
 * side of `caret`, which sits at one end of those letters.
 */
const farEdge = (
  toProjected: (position: number) => number,
  toStored: (position: number, assoc: -1 | 1) => number,
  index: DocumentIndex,
  caret: number
) => {
  const at = toProjected(caret);
  const from = toStored(at, -1);
  const to = toStored(at, 1);

  if (from === to || (caret !== from && caret !== to)) return null;

  const [open] = index.slice(from - 1, from).tokens;
  const [close] = index.slice(to, to + 1).tokens;

  if (
    open?.kind !== 'open' ||
    open.nodeKind !== 'text' ||
    close?.kind !== 'close' ||
    toStored(at - 1, 1) !== from - 1 ||
    toStored(at + 1, -1) !== to + 1
  ) {
    return null;
  }

  return caret === from
    ? { position: at + 1, stored: from - 1 }
    : { position: at - 1, stored: to + 1 };
};

const bothUnclaimed = (
  before: Readonly<JsonRecord>,
  after: Readonly<JsonRecord>
) =>
  !Object.hasOwn(before, AUTHORED_MARKS_KEY) &&
  !Object.hasOwn(after, AUTHORED_MARKS_KEY);

/**
 * Rebase a plain step into review coordinates through `map`, from the plain
 * draft before the step to the review draft, and map the step's output
 * positions into review coordinates with the step's inserted tokens kept.
 */
const rebase = (step: RootChange, map: PosMap, reviewLength: number) => {
  const groups: Group[] = [];
  let plainBefore = 0;
  let plainAfter = 0;
  let reviewBefore = 0;
  let reviewAfter = 0;
  const outputs: Array<
    Readonly<{
      inserted: boolean;
      plainAfter: number;
      plainAfterTo: number;
      plainBefore: number;
      reviewAfter: number;
      reviewBefore: number;
      reviewTo: number;
    }>
  > = [];

  for (let pair = 0; pair < step.sections.length / 2; pair += 1) {
    const length = step.sections[pair * 2];
    const inserted = step.sections[pair * 2 + 1];
    // A replacement covers only what the plain step replaced: struck content
    // the review draft keeps at either edge stays out of it, so new text
    // follows a deletion and a removal leaves earlier struck content alone.
    const replacesNext = inserted < 0 && pair + 1 < step.sections.length / 2;
    // A removal ends before hidden content after it, and a section that
    // removes or changes content starts at its first token, wherever the
    // caret sits: a caret picks a stored edge only where new content goes in.
    const mappedEnd =
      inserted === 0 && length > 0
        ? map(plainBefore + length, -1, false)
        : map(
            plainBefore + length,
            replacesNext ? 1 : -1,
            replacesNext && step.sections[pair * 2 + 2] > 0 ? false : undefined
          );

    if (inserted === 0 && length > 0 && mappedEnd < reviewBefore) {
      throw unrepresentable('A removal runs backward in the stored document.');
    }

    const reviewEnd = Math.max(reviewBefore, mappedEnd);
    const removed = reviewEnd - reviewBefore;

    if (inserted < 0) {
      outputs.push({
        inserted: false,
        plainAfter,
        plainAfterTo: plainAfter + length,
        plainBefore,
        reviewAfter,
        reviewBefore,
        reviewTo: reviewEnd,
      });
      if (inserted === -2) {
        // Each edited token maps on its own, so struck content the review
        // draft keeps between two of them takes none of the edit.
        const data = step.data[pair] as readonly PropertyModification[];
        let at = reviewBefore;

        for (let offset = 0; offset < length; offset += 1) {
          const token = map(plainBefore + offset, 1);

          if (token > at) {
            groups.push({
              after: reviewAfter + at - reviewBefore,
              before: at,
              data: null,
              kind: 'kept',
              length: token - at,
            });
          }
          groups.push({
            after: reviewAfter + token - reviewBefore,
            before: token,
            data,
            kind: 'kept',
            length: 1,
            plainAt: plainBefore + offset,
          });
          at = token + 1;
        }
        if (reviewEnd > at) {
          groups.push({
            after: reviewAfter + at - reviewBefore,
            before: at,
            data: null,
            kind: 'kept',
            length: reviewEnd - at,
          });
        }
      } else if (removed > 0) {
        groups.push({
          after: reviewAfter,
          before: reviewBefore,
          data: null,
          kind: 'kept',
          length: removed,
        });
      }
      plainAfter += length;
      reviewAfter += removed;
    } else {
      const slice =
        (step.data[pair] as PreparedTokenSlice | null) ??
        PreparedTokenSlice.empty;

      outputs.push({
        inserted: true,
        plainAfter,
        plainAfterTo: plainAfter + slice.length,
        plainBefore,
        reviewAfter,
        reviewBefore,
        reviewTo: reviewEnd,
      });
      groups.push({
        after: reviewAfter,
        before: reviewBefore,
        kind: 'replace',
        plainFrom: plainBefore,
        plainRemoved: length,
        removed,
        slice,
      });
      plainAfter += slice.length;
      reviewAfter += slice.length;
    }
    plainBefore += length;
    reviewBefore = reviewEnd;
  }
  if (reviewBefore < reviewLength) {
    outputs.push({
      inserted: false,
      plainAfter,
      plainAfterTo: plainAfter,
      plainBefore,
      reviewAfter,
      reviewBefore,
      reviewTo: reviewLength,
    });
    groups.push({
      after: reviewAfter,
      before: reviewBefore,
      data: null,
      kind: 'kept',
      length: reviewLength - reviewBefore,
    });
    reviewAfter += reviewLength - reviewBefore;
  }

  type Output = (typeof outputs)[number];
  const covers = (output: Output | undefined, position: number) =>
    output !== undefined &&
    output.plainAfter <= position &&
    position <= output.plainAfterTo;
  const removes = (output: Output | undefined) =>
    output?.inserted === true && output.plainAfter === output.plainAfterTo;
  const afterMap: PosMap = (position, assoc, caret) => {
    let at = outputs.findIndex((output) => covers(output, position));
    const removal = removes(outputs[at]) ? at : at + 1;

    if (
      assoc > 0 &&
      removes(outputs[removal]) &&
      covers(outputs[removal + 1], position)
    ) {
      at = removal + 1;
    }

    const output = outputs[at];

    if (!output) return reviewAfter;
    if (output.inserted) {
      return output.reviewAfter + position - output.plainAfter;
    }

    const review = map(
      output.plainBefore + position - output.plainAfter,
      assoc,
      caret
    );
    // An earlier step can move a caret across a removal, into the review
    // stretch of another output, or into one this step replaces, where it
    // sits at the replacement.
    const holds = (other: Output) =>
      other.reviewBefore <= review && review <= other.reviewTo;
    const owner =
      (review < output.reviewBefore || review > output.reviewTo
        ? (outputs.find((other) => !other.inserted && holds(other)) ??
          outputs.find(holds))
        : undefined) ?? output;

    return owner.inserted
      ? owner.reviewAfter
      : owner.reviewAfter + review - owner.reviewBefore;
  };

  return { afterMap, groups };
};

/**
 * Each plain token goes to the review token the fold maps it to; review
 * content with no plain counterpart reads as inserted, and a plain token with
 * no single counterpart as replaced.
 */
const correspondence = (
  plain: DocumentIndex,
  review: DocumentIndex,
  map: PosMap
) => {
  const sections: number[] = [];
  const data: SectionData[] = [];
  let reviewAt = 0;
  let kept = 0;
  const replace = (removed: number, to: number) => {
    if (kept > 0) {
      sections.push(kept, -1);
      data.push(null);
      kept = 0;
    }

    const slice = review.slice(reviewAt, to);

    sections.push(removed, slice.length);
    data.push(slice);
    reviewAt = to;
  };

  for (let position = 0; position < plain.length; position += 1) {
    const from = map(position, 1);
    const to = map(position + 1, -1);

    if (to - from === 1 && from >= reviewAt) {
      if (from > reviewAt) replace(0, from);
      kept += 1;
      reviewAt = from + 1;
    } else {
      replace(1, Math.max(reviewAt, to));
    }
  }
  if (reviewAt < review.length) replace(0, review.length);
  if (kept > 0) {
    sections.push(kept, -1);
    data.push(null);
  }

  return RootChange.fromSections(sections, data);
};

const groupsChange = (groups: readonly Group[]) => {
  const sections: number[] = [];
  const data: SectionData[] = [];

  for (const group of groups) {
    if (group.kind === 'kept') {
      sections.push(group.length, group.data ? -2 : -1);
      data.push(group.data);
    } else {
      sections.push(group.removed, group.slice.length);
      data.push(group.slice);
    }
  }

  return RootChange.fromSections(sections, data);
};

const insertsEmptyLeaves = (change: RootChange) => {
  let inserted = false;

  for (let pair = 0; pair < change.data.length; pair += 1) {
    const length = change.sections[pair * 2];
    const added = change.sections[pair * 2 + 1];

    if (added === -1) continue;
    const data = change.data[pair];

    if (length !== 0 || !(data instanceof PreparedTokenSlice)) return false;
    if (data.tokens.length % 2 !== 0) return false;
    for (let at = 0; at < data.tokens.length; at += 2) {
      const open = data.tokens[at];
      const close = data.tokens[at + 1];

      if (
        open.kind !== 'open' ||
        open.nodeKind !== 'text' ||
        close.kind !== 'close' ||
        close.nodeKind !== 'text'
      ) {
        return false;
      }
    }
    inserted ||= data.length > 0;
  }

  return inserted;
};

/**
 * For a canonical step that only inserts empty text leaves, each inserted
 * leaf on a line the stored document holds childless, with its frame span
 * and the stored position it lands at. Enter at a line's end moves the
 * frame's empty leaf to the new line and the step refills the old one, while
 * the stored split keeps the stored leaf on the old line, so the first leaf
 * after each refilled line is checked too.
 */
const emptyLeavesOf = (
  change: RootChange,
  frame: DocumentIndex,
  stored: DocumentIndex,
  toStored: PosMap
) => {
  if (!insertsEmptyLeaves(change)) return [];

  const leaves: Array<
    Readonly<{
      from: number;
      slice: PreparedTokenSlice;
      stored: number;
      to: number;
    }>
  > = [];
  const lineOf = (position: number) =>
    getDefined(
      frame
        .openContextAt(position)
        .findLast((entry) => entry.kind === 'element')
    );
  const record = (position: number) => {
    const leaf = frame.textAt(position);

    if (!leaf || leaf.contentFrom !== leaf.contentTo) return;
    const target = stored.nodeStartingAt(
      toStored(lineOf(leaf.from).from, 1, false)
    );

    if (
      target?.kind === 'element' &&
      target.contentFrom === target.contentTo &&
      !leaves.some((entry) => entry.stored === target.contentFrom)
    ) {
      leaves.push({
        from: leaf.from,
        slice: frame.nodeSlice(leaf.path),
        stored: target.contentFrom,
        to: leaf.to,
      });
    }
  };

  change.iterChangedRanges((_fromA, _toA, from, to) => {
    for (let at = from; at < to; at += 2) {
      record(at + 1);

      const next = frame.pointAt(lineOf(at).to, 1);

      if (next) record(frame.positionAt(next));
    }
  });

  return leaves;
};

const advanceBreaks = (
  breaks: readonly ProjectionBreak[],
  frame: RootChange,
  stored: RootChange
) =>
  breaks
    .map(({ after, at, before }) => ({
      after: getDefined(stored.mapPos(after, 1)),
      at: getDefined(frame.mapPos(at, 1)),
      before: getDefined(stored.mapPos(before, -1)),
    }))
    .filter(({ after, before }) => after !== before);

/**
 * The stretch of a root's frame, in its coordinates before the steps, that the
 * steps change. A step crosses only a break inside it.
 */
const changedStretch = (changes: readonly RootChange[]) => {
  let from = Infinity;
  let to = -Infinity;
  let earlier: RootChange | null = null;

  for (const change of changes) {
    const back = (position: number, assoc: -1 | 1) =>
      earlier
        ? getDefined(mapRootChangePositionBackward(earlier, position, assoc))
        : position;
    let position = 0;

    for (let pair = 0; pair < change.sections.length; pair += 2) {
      const length = change.sections[pair];

      if (change.sections[pair + 1] !== -1) {
        from = Math.min(from, back(position, -1));
        to = Math.max(to, back(position + length, 1));
      }
      position += length;
    }
    earlier = earlier ? earlier.compose(change) : change;
  }

  return from <= to ? { from, to } : null;
};

const isLine = (
  index: DocumentIndex,
  entry: ResolvedTokenEntry,
  isInline: RecorderOptions['isInline']
) => {
  if (entry.kind !== 'element') return false;
  const node = index.node(entry.path);

  return isTextBlock(node) && !isInline(node);
};

const lineAround = (
  index: DocumentIndex,
  at: number,
  assoc: -1 | 1,
  isInline: RecorderOptions['isInline']
) => {
  const point = index.pointAt(at, assoc);

  return (
    point &&
    index
      .openContextAt(index.positionAt(point))
      .findLast((entry) => isLine(index, entry, isInline))
  );
};

// The context also lists a node that only starts or ends at the position.
const enclosingAt = (index: DocumentIndex, position: number) =>
  index
    .openContextAt(position)
    .filter((entry) => entry.from < position && position < entry.to);

const lineHolding = (
  index: DocumentIndex,
  position: number,
  isInline: RecorderOptions['isInline']
) =>
  enclosingAt(index, position).findLast((entry) =>
    isLine(index, entry, isInline)
  );

const lineClosedAt = (
  index: DocumentIndex,
  position: number,
  slice: PreparedTokenSlice,
  isInline: RecorderOptions['isInline']
) => {
  const open = enclosingAt(index, position);
  let depth = 0;

  for (const token of slice.tokens) {
    if (token.kind === 'open') depth += 1;
    if (token.kind !== 'close') continue;
    if (depth > 0) {
      depth -= 1;
      continue;
    }

    const closed = open.pop();

    if (closed && isLine(index, closed, isInline)) return closed;
  }

  return undefined;
};

type SubStep = Readonly<{
  change: RootChange;
  role: 'landing' | 'source' | null;
}>;

/**
 * Splits a frame step that crosses a break into sub-steps that each map in
 * stored order, or returns null when it crosses none. It keeps a text
 * insertion at a break whole, cuts a text removal or property change inside
 * one line at each break, and lowers a merge of two lines to removals around
 * a move of the right line's children to the left line's end. It throws on
 * any other crossing, on a merge whose right line holds a break after the
 * merge point, and on a step that breaks a line after a break inside that
 * line even when the step crosses no break.
 */
const lowerAcrossBreaks = (
  step: RootChange,
  breaks: readonly ProjectionBreak[],
  frame: DocumentIndex,
  isInline: RecorderOptions['isInline']
): SubStep[] | null => {
  if (breaks.length === 0) return null;

  const crossing = (from: number, to: number) => (edge: ProjectionBreak) =>
    from === to ? edge.at === from : from < edge.at && edge.at < to;
  const sections: Array<{
    from: number;
    to: number;
    added: number;
    data: SectionData;
  }> = [];
  let position = 0;
  let crosses = false;

  for (let pair = 0; pair < step.data.length; pair += 1) {
    const length = step.sections[pair * 2];
    const added = step.sections[pair * 2 + 1];
    const data = step.data[pair];

    if (added !== -1) {
      sections.push({ from: position, to: position + length, added, data });
      crosses ||= breaks.some(crossing(position, position + length));

      const line =
        data instanceof PreparedTokenSlice &&
        lineClosedAt(frame, position, data, isInline);

      // The new line would land after the lines a pending join puts between
      // its line's stored halves, not where the frame shows it.
      if (
        line &&
        breaks.some(({ at }) => line.contentFrom <= at && at < position)
      ) {
        throw unrepresentable(
          'A frame step breaks a line after a stored-order break inside it.'
        );
      }
    }
    position += length;
  }
  if (!crosses) return null;

  const result: SubStep[] = [];
  let index = frame;
  let edges = breaks;
  const emit = (
    from: number,
    to: number,
    added: number,
    data: SectionData,
    role: SubStep['role'] = null
  ) => {
    const change = RootChange.fromSections(
      [from, -1, to - from, added, index.length - to, -1],
      [null, data, null]
    );

    result.push({ change, role });
    index = change.apply(index);
    edges = edges.map((edge) => ({
      ...edge,
      at: getDefined(change.mapPos(edge.at, 1)),
    }));
    return change;
  };
  const remove = (from: number, to: number, role: SubStep['role'] = null) => {
    const cuts = [
      from,
      ...edges.filter(({ at }) => from < at && at < to).map(({ at }) => at),
      to,
    ];

    for (let at = cuts.length - 2; at >= 0; at -= 1) {
      if (cuts[at] < cuts[at + 1]) {
        emit(cuts[at], cuts[at + 1], 0, PreparedTokenSlice.empty, role);
      }
    }
  };

  const lineAt = (at: number, assoc: -1 | 1) =>
    lineAround(index, at, assoc, isInline);

  for (const { from, to, added, data } of sections.reverse()) {
    const hits = edges.filter(crossing(from, to));
    const inserted =
      data instanceof PreparedTokenSlice ? data : PreparedTokenSlice.empty;

    if (
      hits.length === 0 ||
      (from === to && inserted.tokens.every((token) => token.kind === 'text'))
    ) {
      emit(from, to, added, data);
      continue;
    }
    const removed = index.slice(from, to).tokens;
    const line = lineAt(from, 1);
    const onlyText = removed.every(
      (token) => token.kind === 'text' || token.nodeKind === 'text'
    );

    if (
      from < to &&
      (added === 0 || added === -2) &&
      onlyText &&
      line &&
      line.from === lineAt(to, -1)?.from
    ) {
      const cuts = [from, ...hits.map(({ at }) => at), to];

      for (let at = cuts.length - 2; at >= 0; at -= 1) {
        emit(cuts[at], cuts[at + 1], added, data);
      }
      continue;
    }
    const left = lineAt(from, -1);
    const right = lineAt(to, 1);

    if (
      added !== 0 ||
      !left ||
      !right ||
      left.from >= right.from ||
      from < left.contentFrom ||
      from > left.contentTo ||
      to < right.contentFrom ||
      to > right.contentTo
    ) {
      throw unrepresentable(
        'A frame step crosses an unsupported stored-order break.'
      );
    }
    if (edges.some(({ at }) => to < at && at <= right.contentTo)) {
      throw unrepresentable(
        'A block merge moves a line that holds a stored-order break.'
      );
    }

    remove(right.contentFrom, to);
    remove(left.to, right.from);
    const rightAt = lineAt(left.to, 1);

    if (!rightAt) throw unrepresentable('A block merge has no right line.');
    const children = index.slice(rightAt.contentFrom, rightAt.contentTo);
    const landing = emit(
      left.contentTo,
      left.contentTo,
      children.length,
      children,
      'landing'
    );
    const sourceFrom = getDefined(landing.mapPos(rightAt.from, 1));
    const sourceTo = getDefined(landing.mapPos(rightAt.to, 1));

    remove(sourceFrom, sourceTo, 'source');
    remove(from, left.contentTo);
  }

  return result;
};

type RootFold = {
  breaks: readonly ProjectionBreak[];
  composed: RootChange | null;
  frameIndex: DocumentIndex | null;
  index: DocumentIndex;
  leftward: boolean;
  map: PosMap;
  created: boolean;
  touched: boolean;
};

/**
 * Record a transaction's steps as the review tree's change. Each step folds
 * through a review draft: it is rebased from the plain draft into the review
 * draft, recorded there and applied, so each step reads the review state the
 * earlier ones left. Recording keys only on token kind, existing marks, the
 * step's origin and move link, intent and writer, so it imports no plugin or
 * command module.
 */
export const recordAuthoredSteps = (
  input: AuthoredRecordInput
): AuthoredRecordResult => {
  const changeId = input.forcedChangeId ?? input.changeId;
  const inc = input.inc ?? undefined;
  const own = incarnationOf({ at: input.now, change: changeId, inc });
  const isOwn = (mark: AuthoredMark) =>
    input.forcedChangeId
      ? incarnationOf(mark) === own
      : mark.author === input.writer;
  const base = {
    at: input.now,
    author: input.writer,
    change: changeId,
    ...(inc === undefined ? {} : { inc }),
  };
  const markOf = (
    kind: Exclude<AuthoredMark['kind'], 'format'>
  ): AuthoredMark => (kind === 'split' ? { ...base, kind } : { ...base, kind });
  const folds = new Map<string, RootFold>();
  let writtenPlain = true;
  const foldOf = (root: string) => {
    let fold = folds.get(root);

    if (!fold) {
      const created = input.createRoots.has(root);

      fold = {
        breaks: [],
        composed: null,
        frameIndex: null,
        index: created
          ? DocumentIndex.fromValue([])
          : valueRootIndex(input.before, root),
        leftward: true,
        map: identity,
        created,
        touched: false,
      };
      folds.set(root, fold);
    }

    return fold;
  };

  const stepChanges = input.steps.map((step) => ({
    changes: [...getInternalDocumentChangeEntries(step.change)].map(
      ([root, written]) => {
        const plain = step.indexedBefore?.get(root);

        // A fitted slice rewrites the open tokens of the blocks it lands in.
        return [
          root,
          plain && step.origin === 'slice'
            ? written.alignOpens(plain, bothUnclaimed)
            : written,
        ] as const;
      }
    ),
    step,
  }));

  if (input.projection) {
    const { indexes, map } = input.projection;

    for (const root of map.roots) {
      const fold = foldOf(root);
      const toStored = (position: number, assoc: -1 | 1) =>
        map.toStored(root, position, assoc);
      const caretAt =
        input.selectionBefore?.root === root
          ? input.selectionBefore.position
          : null;
      // Where the projection hid every letter of a leaf, the accepted leaf is
      // empty and both its edges sit at the caret, so in Suggesting a write at
      // its far edge, such as Enter's split, takes the stored edge on the
      // caret's side.
      const far =
        caretAt === null
          ? null
          : farEdge(
              (position) => map.toProjected(root, position, 'forward'),
              toStored,
              fold.index,
              caretAt
            );

      const stretch = changedStretch(
        stepChanges.flatMap(({ changes }) =>
          changes.flatMap(([changed, change]) =>
            changed === root ? [change] : []
          )
        )
      );

      const frame = getDefined(indexes.get(root));

      fold.frameIndex = frame;
      // A step that breaks a line is refused after a break earlier in that
      // line, and a merge moves the rest of the line it ends in, so the read
      // covers the lines that hold the stretch's ends.
      fold.breaks = stretch
        ? map.breaks(
            root,
            lineHolding(frame, stretch.from, input.isInline)?.contentFrom ??
              stretch.from,
            lineHolding(frame, stretch.to, input.isInline)?.contentTo ??
              stretch.to
          )
        : [];
      fold.map = (position, assoc, caret) => {
        if (far && caret !== false && position === far.position) {
          return far.stored;
        }

        const before = toStored(position, assoc);

        if (caret === false) return before;

        const other = toStored(position, assoc < 0 ? 1 : -1);

        // A caret inside content the projection put in place of stored content,
        // such as the line completion gives a container whose lines are all
        // struck, takes the opposite stored edge, from which its association
        // reads into the content it replaced, so the next letter lands there
        // again.
        if (map.added(root, position)) return other;

        // The projection hides content, so where it removed some, a position has
        // a stored edge on each side; a caret at one edge picks it, so the next
        // letter lands on the line the caret shows.
        return caretAt !== null && before !== caretAt && other === caretAt
          ? caretAt
          : before;
      };
    }
  }

  for (const { changes, step } of stepChanges) {
    for (const [root, rootChange] of changes) {
      const fold = foldOf(root);

      // The review draft runs its own canonical pass, so canonical
      // construction only moves the plain draft away from it, except for an
      // empty leaf it adds to a line the stored document holds childless,
      // which is recorded so a caret inside that leaf has a stored place.
      if (step.origin === 'canonical') {
        const previous = fold.map;
        const back: PosMap = (position, assoc, caret) =>
          previous(
            getDefined(
              mapRootChangePositionBackward(rootChange, position, assoc)
            ),
            assoc,
            caret
          );
        const frame = fold.frameIndex && rootChange.apply(fold.frameIndex);
        const leaves = frame
          ? emptyLeavesOf(rootChange, frame, fold.index, back)
          : [];
        const recorded = RootChange.create(
          fold.index,
          leaves.map(({ slice, stored }) => ({ from: stored, insert: slice }))
        );

        fold.frameIndex = frame;
        fold.breaks = advanceBreaks(fold.breaks, rootChange, recorded);
        if (recorded.empty) {
          fold.map = back;
          continue;
        }
        fold.index = recorded.apply(fold.index);
        fold.composed = fold.composed
          ? fold.composed.compose(recorded)
          : recorded;
        fold.map = (position, assoc, caret) => {
          const leaf = leaves.find(
            ({ from, to }) => from <= position && position <= to
          );

          return leaf
            ? getDefined(recorded.mapPos(leaf.stored, -1)) +
                position -
                leaf.from
            : getDefined(recorded.mapPos(back(position, assoc, caret), assoc));
        };
        continue;
      }

      const subSteps = (fold.frameIndex &&
        lowerAcrossBreaks(
          rootChange,
          fold.breaks,
          fold.frameIndex,
          input.isInline
        )) ?? [{ change: rootChange, role: step.move?.role ?? null }];

      for (const sub of subSteps) {
        const plainToReview = fold.map;
        const { afterMap, groups } = rebase(
          sub.change,
          plainToReview,
          fold.index.length
        );
        let recorded: RootChange;
        let mapRecorded: PosMap = identity;

        // A migration is not the writer's edit, and a created root is never
        // pending, so both apply as written.
        if (fold.created || step.origin === 'migration') {
          recorded = groupsChange(groups);
        } else {
          const result = new RootRecorder(fold.index, {
            dependencies: input.dependencies,
            plainToReview,
            changeId,
            createTagId: input.createTagId,
            emptyTextKeeps: (key, value, parents) =>
              input.emptyTextKeeps(key, value, parents, root),
            framed: input.projection !== undefined,
            fill: (site) => input.fill(site, root),
            frameIndex: fold.frameIndex,
            isInline: input.isInline,
            isOwn,
            keepsOnSplit: (split) => input.keepsOnSplit(split, root),
            leftward: fold.leftward,
            markOf,
            moveRole: sub.role,
            oneText: input.oneText ?? (() => false),
            origin: step.origin,
            selectionBefore:
              !fold.touched && input.selectionBefore?.root === root
                ? input.selectionBefore.position
                : null,
            source: step.source,
          }).record(groups);

          recorded = result.change;
          mapRecorded = result.mapPosition;
          fold.leftward = result.leftward;
          writtenPlain &&= result.writtenPlain;
        }
        fold.touched = true;
        if (fold.frameIndex) {
          fold.frameIndex = sub.change.apply(fold.frameIndex);
        }
        if (!recorded.empty) {
          fold.index = recorded.apply(fold.index);
          fold.composed = fold.composed
            ? fold.composed.compose(recorded)
            : recorded;
        }
        fold.breaks = advanceBreaks(fold.breaks, sub.change, recorded);
        fold.map = (position, assoc, caret) =>
          mapRecorded(afterMap(position, assoc, caret), assoc, caret);
      }
    }
  }

  const changes = new Map<string, RootChange>();
  const indexedAfter = new Map<string, DocumentIndex>();

  for (const [root, fold] of folds) {
    if (fold.composed && !fold.composed.empty) {
      changes.set(root, fold.composed);
    }
    if (!input.deleteRoots.has(root)) indexedAfter.set(root, fold.index);
  }

  return {
    anchorChange: (plainAfter) =>
      createInternalDocumentChange(
        new Map(
          [...folds]
            .filter(([root]) => !input.deleteRoots.has(root))
            .map(([root, fold]) => [
              root,
              correspondence(plainAfter(root), fold.index, fold.map),
            ])
        )
      ),
    change: createInternalDocumentChange(changes, {
      createRoots: input.createRoots,
      deleteRoots: input.deleteRoots,
    }),
    indexedAfter,
    mapPosition: (root, position, assoc, caret = true) =>
      folds.get(root)?.map(position, assoc, caret) ?? position,
    writtenPlain,
  };
};

type RecorderOptions = Readonly<{
  dependencies: Dependencies;
  plainToReview: PosMap;
  changeId: string;
  createTagId: () => string;
  emptyTextKeeps: (
    key: string,
    value: unknown,
    parents: readonly Props[]
  ) => boolean;
  fill: (site: readonly Props[]) => readonly JsonNode[];
  frameIndex: DocumentIndex | null;
  framed: boolean;
  isInline: (props: Props) => boolean;
  isOwn: (mark: AuthoredMark) => boolean;
  keepsOnSplit: (
    split: SplitContinuation
  ) => (key: string, value: unknown) => boolean;
  leftward: boolean;
  markOf: (kind: Exclude<AuthoredMark['kind'], 'format'>) => AuthoredMark;
  moveRole: 'landing' | 'source' | null;
  oneText: (type: string) => boolean;
  origin: DraftStepOrigin;
  selectionBefore: number | null;
  source: DraftStepSource;
}>;

type StrikeMode = 'delete' | 'move';

class RootRecorder {
  private readonly ops: Op[] = [];
  private readonly pieces: Piece[] = [];
  private readonly index: DocumentIndex;
  private readonly options: RecorderOptions;

  constructor(index: DocumentIndex, options: RecorderOptions) {
    this.index = index;
    this.options = options;
  }

  private marks(props: unknown) {
    return this.options.dependencies.marks(props);
  }

  /**
   * The keys whose pending writes `continuation`, the element a split of
   * `continued` wrote, does not inherit: each key it could not hold at the
   * value `continued` has now, or at the value a write replaced, which
   * rejecting that write gives back.
   */
  private droppedOnSplit(
    continued: Context,
    continuation: Props,
    marks: readonly AuthoredMark[]
  ) {
    const formats = marks.filter((mark) => mark.kind === 'format');

    if (formats.length === 0) return null;
    const keeps = this.options.keepsOnSplit({
      continuation,
      path: continued.path,
      reviewDraft: this.index.value,
      source: continued.props,
    });

    return new Set(
      formats.flatMap((mark) =>
        keeps(mark.key, continued.props[mark.key]) &&
        keeps(mark.key, mark.before)
          ? []
          : [mark.key]
      )
    );
  }

  private withMarks(
    props: Props,
    marks: readonly AuthoredMark[],
    fresh = false
  ): Props {
    return this.options.dependencies.props(props, marks, fresh);
  }

  // A copy that lands somewhere is a new node and carries no cuts, so each cut
  // keeps one fragment per side: a struck source keeps them, and `relinkCuts`
  // moves them off a removed one.
  private withoutCuts(props: Props) {
    return this.marks(props).filter((mark) => !isCut(mark));
  }

  private hasMarkKind(props: Props, kind: AuthoredMark['kind']) {
    return this.marks(props).some((mark) => mark.kind === kind);
  }

  /** Whether two leaves read the same to review, however each stores it. */
  private sameReview(left: Props, right: Props) {
    const read = (props: Props) => ({
      held: readMembers(props).filter((member) => member.kind === 'held'),
      marks: normalizeSetValues(this.marks(props)),
      props: withMembers(props, []),
    });

    return jsonEqual(read(left), read(right));
  }

  record(groups: readonly Group[]) {
    const plain = new Map(
      groups.flatMap((group) => {
        const removals =
          group.kind === 'replace' ? this.plainRemovals(group) : null;

        return removals ? [[group, removals] as const] : [];
      })
    );

    if (this.options.origin !== 'move' || !this.recordNodeMove(groups)) {
      for (const group of groups) {
        if (group.kind === 'replace') {
          const start = this.ops.length;
          const removals = plain.get(group);

          if (removals) this.writePlain(group, removals);
          else this.recordGroup(group);
          this.followJoin(group, start);
          continue;
        }
        if (group.data) {
          this.recordProperties(group.before, group.data, group.plainAt);
        }
        this.pieces.push({
          afterFrom: group.after,
          afterTo: group.after + group.length,
          beforeFrom: group.before,
          kind: 'kept',
        });
      }
    }

    const recorded = RootChange.create(this.index, this.sections());

    return {
      change: recorded,
      leftward:
        this.pieces.findLast((piece) => piece.kind === 'removed')?.leftward ??
        this.options.leftward,
      mapPosition: (position: number, assoc: -1 | 1, caret?: boolean) =>
        this.mapPosition(recorded, position, assoc, caret === true),
      writtenPlain: groups.every((group) =>
        group.kind === 'replace' ? plain.has(group) : !group.data
      ),
    };
  }

  /**
   * The ranges an Editing write removes outright when accepting the claims it
   * would record for this group gives, under every outcome of the pending
   * changes, the plain group or the plain group with the blocks other changes
   * strike whole left in place. Null when it gives neither.
   */
  private plainRemovals(group: Extract<Group, { kind: 'replace' }>) {
    if (this.settlesPlain(group)) {
      return group.removed > 0
        ? [[group.before, group.before + group.removed] as const]
        : [];
    }

    return this.removalKeepingStruck(group);
  }

  /**
   * A removal of whole blocks whose every block either holds nothing pending
   * but insertions, so it goes in every outcome, or is struck whole by other
   * changes, which still decide it. A pending join goes only with the whole
   * root, so no follower outside the removal loses its join.
   */
  private removalKeepingStruck({
    before,
    plainFrom,
    plainRemoved,
    removed,
    slice,
  }: Extract<Group, { kind: 'replace' }>) {
    const { changeId, frameIndex, moveRole, origin } = this.options;
    const to = before + removed;
    const first = this.index.childBoundaryAt(before);
    const last = this.index.childBoundaryAt(to);
    const topLevel = (index: DocumentIndex, position: number) =>
      index.childBoundaryAt(position)?.parentPath.length === 0;

    if (
      !isEditingChange(changeId) ||
      moveRole !== null ||
      origin === 'move' ||
      origin === 'wrap' ||
      origin === 'unwrap' ||
      removed === 0 ||
      first?.parentPath.length !== 0 ||
      last?.parentPath.length !== 0 ||
      (frameIndex &&
        !(
          topLevel(frameIndex, plainFrom) &&
          topLevel(frameIndex, plainFrom + plainRemoved)
        )) ||
      slice.tokens.some(reviewed)
    ) {
      return null;
    }

    const whole = before === 0 && to === this.index.length;
    const goes = (node: JsonNode): boolean =>
      readMembers(node).every(
        (member) =>
          member.kind === 'insert' ||
          member.kind === 'in' ||
          (whole && member.kind === 'join')
      ) && (node.children ?? []).every(goes);
    const removals: Array<readonly [number, number]> = [];

    for (let rank = first.index; rank < last.index; rank += 1) {
      const node = getDefined(this.index.child(rank));
      const { from, to: end } = this.index.nodeRange([rank]);

      if (struckWhole(node)) continue;
      if (!goes(node)) return null;

      const previous = removals.at(-1);

      if (previous?.[1] === from) {
        removals[removals.length - 1] = [previous[0], end];
      } else removals.push([from, end]);
    }

    return removals;
  }

  /**
   * Whether accepting the claims an Editing write would record for this group
   * gives the plain group under every outcome of the pending changes.
   */
  private settlesPlain({
    before,
    plainFrom,
    plainRemoved,
    removed,
    slice,
  }: Extract<Group, { kind: 'replace' }>) {
    const { changeId, frameIndex, moveRole, origin } = this.options;

    if (
      !isEditingChange(changeId) ||
      moveRole !== null ||
      origin === 'move' ||
      origin === 'wrap' ||
      origin === 'unwrap' ||
      removed !== plainRemoved ||
      // Only a claim says that a written block goes with a pending join.
      (removed === 0 && this.followedAt(before, plainFrom) !== null)
    ) {
      return false;
    }

    const to = before + removed;

    // A frame shows lines the review draft lacks, such as the empty line of a
    // quote whose only line is struck, where the plain group has nowhere to
    // land.
    if (
      frameIndex &&
      !(
        jsonEqual(
          bareContextAt(this.index, before),
          bareContextAt(frameIndex, plainFrom)
        ) &&
        jsonEqual(
          bareContextAt(this.index, to),
          bareContextAt(frameIndex, plainFrom + plainRemoved)
        )
      )
    ) {
      return false;
    }

    if (
      slice.tokens.some(reviewed) ||
      this.index.slice(before, to).tokens.some(reviewed)
    ) {
      return false;
    }

    // The slice splits as many elements around it as it closes before it
    // opens one.
    let depth = 0;
    let closes = 0;

    for (const token of slice.tokens) {
      if (token.kind === 'text' || token.nodeKind !== 'element') continue;
      if (token.kind === 'open') depth += 1;
      else if (depth > 0) depth -= 1;
      else closes += 1;
    }

    const atBefore = this.contextAt(before);
    const elements = atBefore.filter((context) => context.kind === 'element');
    const split = new Set(closes > 0 ? elements.slice(-closes) : []);
    const contexts =
      to === before ? atBefore : [...atBefore, ...this.contextAt(to)];

    return contexts.every((context) => {
      const members = readMembers(context.props);

      if (context.kind === 'text') return members.length === 0;
      // An element the group joins or splits decides with everything in it,
      // as a join waits on a line that holds only another author's text.
      if (
        split.has(context) ||
        context.contentFrom > before ||
        context.contentTo < to
      ) {
        return (
          members.length === 0 &&
          !this.index
            .slice(context.contentFrom, context.contentTo)
            .tokens.some(reviewed)
        );
      }

      return members.every((member) => BOUNDARY_KINDS.has(member.kind));
    });
  }

  private writePlain(
    { after, before, removed, slice }: Extract<Group, { kind: 'replace' }>,
    removals: ReadonlyArray<readonly [number, number]>
  ) {
    const to = before + removed;
    const last = removals.at(-1);
    // Written where the removal that ends at `to` starts, the slice and that
    // removal are one replacement.
    const at = last?.[1] === to ? last[0] : to;

    for (const [from, end] of removals) {
      this.ops.push({ from, kind: 'remove', to: end });
    }
    if (slice.length > 0) {
      this.ops.push({ at, kind: 'insert', tokens: slice.tokens });
      this.pieces.push({
        afterFrom: after,
        afterTo: after + slice.length,
        at,
        kind: 'inserted',
        offsets: Array.from(
          { length: slice.length + 1 },
          (_, offset) => offset
        ),
      });
    }
    if (removed > 0) this.pushRemoved(after, before, to);
  }

  private recordGroup(group: Extract<Group, { kind: 'replace' }>) {
    const { after, before, removed, slice } = group;
    const enclosure = this.enclosureOf(group);

    if (enclosure) {
      this.recordEnclosure(group, enclosure);
      return;
    }
    if (
      slice.length === 0 &&
      group.plainRemoved === 2 &&
      this.recordBoundaryRemoval(group)
    ) {
      return;
    }
    if (
      this.options.origin === 'split' &&
      removed === 0 &&
      slice.length === 2 &&
      this.recordContainerSplit(group)
    ) {
      return;
    }

    this.recordReplacement(before, before + removed, slice, after);
  }

  /**
   * A wrap or an unwrap: the wrapped content stays where it is, and only the
   * enclosing boundaries are recorded. A wrap or unwrap origin names it even
   * when the content differs between the drafts.
   */
  private enclosureOf(group: Extract<Group, { kind: 'replace' }>) {
    const { origin } = this.options;
    const { removed, slice } = group;

    if (origin === 'wrap' || origin === 'unwrap') {
      const wraps = origin === 'wrap';
      const depth = wraps
        ? (slice.length - group.plainRemoved) / 2
        : (group.plainRemoved - slice.length) / 2;
      const outer = wraps
        ? slice.tokens
        : this.index.slice(group.before, group.before + removed).tokens;

      return depth >= 1 &&
        Number.isInteger(depth) &&
        hasEnclosingEdges(outer, depth)
        ? { depth, wraps }
        : null;
    }

    if (removed === 0 || slice.length === 0) return null;

    return enclosureOf(
      this.index.slice(group.before, group.before + removed),
      slice
    );
  }

  private recordEnclosure(
    group: Extract<Group, { kind: 'replace' }>,
    { depth, wraps }: Readonly<{ depth: number; wraps: boolean }>
  ) {
    const { after, before, removed, slice } = group;

    if (wraps) {
      const lead = slice.slice(0, depth);
      const trail = slice.slice(slice.length - depth);
      const inner = slice.length - 2 * depth;

      this.recordReplacement(before, before, lead, after);
      this.pieces.push({
        afterFrom: after + depth,
        afterTo: after + depth + inner,
        kind: 'shifted',
        plainFrom: group.plainFrom,
      });
      this.recordReplacement(
        before + removed,
        before + removed,
        trail,
        after + depth + inner,
        { closesWrap: true }
      );
      return;
    }

    this.recordReplacement(
      before,
      before + depth,
      PreparedTokenSlice.empty,
      after
    );
    this.pieces.push({
      afterFrom: after,
      afterTo: after + slice.length,
      kind: 'shifted',
      plainFrom: group.plainFrom + depth,
    });
    this.recordReplacement(
      before + removed - depth,
      before + removed,
      PreparedTokenSlice.empty,
      after + slice.length
    );
  }

  /**
   * A step that removes one boundary: a leaf merge, which keeps the review
   * leaves apart when their properties differ and is dropped when the review
   * draft holds other content between them; or, in Suggesting, a container
   * merge or a merge into a struck line, which records as a move of the right
   * block's children.
   */
  private recordBoundaryRemoval(group: Extract<Group, { kind: 'replace' }>) {
    const { after, before, removed } = group;
    const [first] = this.index.slice(before, before + 1).tokens;
    const [last] = this.index.slice(
      before + removed - 1,
      before + removed
    ).tokens;

    if (first?.kind !== 'close' || last?.kind !== 'open') return false;
    if (first.nodeKind === 'text' && last.nodeKind === 'text') {
      if (removed === 2) {
        const left = this.index
          .openContextAt(before)
          .find((entry) => entry.kind === 'text' && entry.contentTo === before);
        const leftProps = left ? propsOf(this.index.node(left.path)) : {};
        const rightProps = this.propsStartingAt(before + 1);
        const merged =
          this.formattedProps(
            rightProps,
            withMembers(leftProps, readMembers(rightProps))
          ) ?? rightProps;

        if (this.sameReview(merged, leftProps)) {
          this.ops.push({ from: before, kind: 'remove', to: before + 2 });
          return true;
        }
        if (merged !== rightProps) {
          this.ops.push({ at: before + 1, kind: 'props', props: merged });
        }
      } else if (this.options.origin !== 'merge') {
        return false;
      }
      this.pushRemoved(after, before, before + removed);
      return true;
    }
    if (first.nodeKind !== 'element') return false;

    const right = this.index.nodeStartingAt(before + removed - 1);

    if (
      !right ||
      (isTextBlock(this.index.node(right.path)) &&
        !this.mergesIntoStruckLine(group))
    ) {
      return false;
    }

    const children = this.index.slice(right.contentFrom, right.contentTo);

    this.ops.push({
      at: before,
      kind: 'insert',
      tokens: this.movedCopy(children.tokens),
    });
    this.strike(right.from, right.to, this.contextAt(right.from), 'move');
    this.pieces.push({
      afterFrom: after,
      afterTo: after + children.length,
      at: before,
      kind: 'inserted',
      offsets: Array.from({ length: children.length + 1 }, (_, i) => i),
    });
    this.pushRemoved(after, before, right.contentFrom);
    return true;
  }

  /**
   * Whether a block merge starts inside a line a pending deletion strikes,
   * where the write removed text at the line's end that the review draft keeps
   * struck. The merged line then stands where the struck one does, after the
   * line break before it, as Editing's merge leaves it. A join mark cannot say
   * so: a decision lands it on the nearest block it keeps, and accepting the
   * deletion takes the struck line away. A merge that removes only the
   * boundary, such as Backspace at the start of the right block, joins the
   * line before it.
   */
  private mergesIntoStruckLine(group: Extract<Group, { kind: 'replace' }>) {
    const { before, plainFrom } = group;
    const left = this.index
      .openContextAt(before)
      .find((entry) => entry.kind === 'element' && entry.contentTo === before);

    if (
      !left ||
      !this.hasMarkKind(propsOf(this.index.node(left.path)), 'delete')
    ) {
      return false;
    }

    const textEnd = this.options.plainToReview(plainFrom - 1, -1);

    return this.index
      .slice(textEnd, before)
      .tokens.some((token) => token.kind === 'text');
  }

  /**
   * A container split in Suggesting records as a new container holding a
   * moved copy of the children after the split point.
   */
  private recordContainerSplit(group: Extract<Group, { kind: 'replace' }>) {
    const { after, before, slice } = group;
    const [close, open] = slice.tokens;

    if (
      close?.kind !== 'close' ||
      close.nodeKind !== 'element' ||
      open?.kind !== 'open' ||
      open.nodeKind !== 'element'
    ) {
      return false;
    }

    const container = this.contextAt(before).at(-1);

    // A split that opens another type splits a block the schema completes
    // the container with, not the container.
    if (
      container?.kind !== 'element' ||
      open.props.type !== container.props.type
    ) {
      return false;
    }

    const entry = this.index.nodeRange(container.path);

    if (isTextBlock(this.index.node(container.path))) return false;

    const children = this.index.slice(before, container.contentTo);

    this.strike(before, container.contentTo, this.contextAt(before), 'move');
    this.ops.push({
      at: entry.to,
      kind: 'insert',
      tokens: [
        openToken(
          'element',
          this.withMarks(open.props, [
            ...this.marks(open.props),
            this.options.markOf('insert'),
          ])
        ),
        ...this.movedCopy(children.tokens),
        closeToken('element'),
      ],
    });
    this.pieces.push({
      afterFrom: after + 1,
      afterTo: after + 3 + children.length,
      at: entry.to,
      kind: 'inserted',
      offsets: Array.from({ length: children.length + 3 }, (_, i) => i),
    });
    // The split point itself, which the kept piece before it skips for a
    // rightward position.
    this.pieces.push({
      afterFrom: after,
      afterTo: after,
      beforeFrom: before,
      kind: 'kept',
    });
    return true;
  }

  /**
   * A builder move: the source keeps its place under the mover's deletion in
   * Suggesting, and the landing gets the source as the review draft holds it,
   * with its marks, under the mover's insertion.
   */
  private recordNodeMove(groups: readonly Group[]) {
    const replacements = groups.filter(
      (group): group is Extract<Group, { kind: 'replace' }> =>
        group.kind === 'replace'
    );
    const source = replacements.find(
      (group) => group.removed > 0 && group.slice.length === 0
    );
    const landing = replacements.find(
      (group) => group.removed === 0 && group.slice.length > 0
    );

    if (replacements.length !== 2 || !source || !landing) return false;

    const { plainToReview } = this.options;
    const [copyFrom, copyTo] = this.withoutStruckEdges(
      source.before,
      source.before + source.removed
    );
    const copy = this.index.slice(copyFrom, copyTo).tokens;

    for (const group of groups) {
      if (group.kind === 'kept') {
        this.pieces.push({
          afterFrom: group.after,
          afterTo: group.after + group.length,
          beforeFrom: group.before,
          kind: 'kept',
        });
      } else if (group === source) {
        this.strike(copyFrom, copyTo, this.contextAt(copyFrom), 'move');
        this.pushRemoved(source.after, copyFrom, copyTo);
      } else {
        this.ops.push({
          at: landing.before,
          kind: 'insert',
          tokens: this.movedCopy(copy),
        });
        this.followJoin(landing, this.ops.length - 1);
        this.pieces.push({
          afterFrom: landing.after,
          afterTo: landing.after + landing.slice.length,
          at: landing.before,
          kind: 'inserted',
          offsets: Array.from(
            { length: landing.slice.length + 1 },
            (_, offset) =>
              offset === 0
                ? 0
                : plainToReview(source.plainFrom + offset, -1, false) - copyFrom
          ),
        });
      }
    }

    return true;
  }

  /**
   * The pending join a block written at `at`, which is `frameAt` in the
   * frame, goes with: the one the block before it carries or goes with, when
   * the frame's block before it ends there too or, outside a frame, when the
   * block after it goes with that join too; or else the one the line after it
   * carries, past only the ends of elements, which would otherwise merge into
   * it.
   */
  private followedAt(at: number, frameAt: number): string | null {
    const boundary = this.index.childBoundaryAt(at);

    if (!boundary) return null;

    const childrenAt = (path: readonly number[]) =>
      path.length === 0
        ? this.index.value
        : (this.index.node(path).children ?? []);
    let { index, parentPath } = boundary;
    let siblings = childrenAt(parentPath);
    const before = index > 0 ? siblings[index - 1] : undefined;
    const carried = before && this.followedBy(propsOf(before));
    const after = siblings[index];

    // In a frame, where the frame shows the block after the end of an element
    // that the join's landing closes at `at`, the frame's block before it ends
    // later. Outside one, only a block after it that goes with the same join
    // says which side of that end it is on.
    if (
      carried &&
      (this.options.frameIndex
        ? frameAt > 0 &&
          this.options.plainToReview(frameAt - 1, -1, false) === at - 1
        : after !== undefined &&
          this.marks(propsOf(after)).some(
            (mark) => followsOf(mark) === carried
          ))
    ) {
      return carried;
    }
    while (index === siblings.length && parentPath.length > 0) {
      index = getDefined(parentPath.at(-1)) + 1;
      parentPath = parentPath.slice(0, -1);
      siblings = childrenAt(parentPath);
    }

    const next = siblings[index];
    const join =
      next && isTextBlock(next)
        ? this.marks(propsOf(next)).find((mark) => mark.kind === 'join')
        : undefined;

    return join ? incarnationOf(join) : null;
  }

  /**
   * Has the blocks a group inserts go with the pending join they are written
   * after or before, so the join lands where the frame shows them.
   */
  private followJoin(
    group: Extract<Group, { kind: 'replace' }>,
    start: number
  ) {
    if (group.removed > 0) return;

    const key = this.followedAt(group.before, group.plainFrom);

    if (!key) return;

    const own = incarnationOf(this.options.markOf('insert'));

    for (let index = start; index < this.ops.length; index += 1) {
      const op = getDefined(this.ops[index]);

      if (op.kind !== 'insert' || op.at !== group.before) continue;

      let depth = 0;

      this.ops[index] = {
        ...op,
        tokens: op.tokens.map((token) => {
          if (token.kind === 'text') return token;
          if (token.kind === 'close') {
            depth -= 1;
            return token;
          }
          depth += 1;
          if (depth !== 1 || token.nodeKind !== 'element') return token;

          return openToken(
            'element',
            this.withMarks(
              token.props,
              this.marks(token.props).map((mark) =>
                mark.kind === 'insert' && incarnationOf(mark) === own
                  ? { ...mark, follows: key }
                  : mark
              )
            )
          );
        }),
      };
    }
  }

  private withoutStruckEdges(from: number, to: number): [number, number] {
    const { offsets, tokens } = this.index.slice(from, to);
    const hidden = ([open, end]: readonly [number, number]) => {
      const first = tokens[open];
      let live = false;

      if (first.kind !== 'open' || !this.hasMarkKind(first.props, 'delete')) {
        return false;
      }
      for (let index = open; index < end; index += 1) {
        const token = tokens[index];

        if (token.kind === 'open' && token.nodeKind === 'text') {
          live = !this.hasMarkKind(token.props, 'delete');
        } else if (token.kind === 'text' && live) {
          return false;
        }
      }

      return true;
    };
    const opens: number[] = [];
    const nodes: Array<[number, number]> = [];

    tokens.forEach((token, index) => {
      if (token.kind === 'open') {
        opens.push(index);
      } else if (token.kind === 'close') {
        const open = opens.pop();

        if (open !== undefined && opens.length === 0) {
          nodes.push([open, index + 1]);
        }
      }
    });

    let start = 0;
    let end = tokens.length;
    let first = 0;
    let last = nodes.length;

    while (first < last && nodes[first][0] === start && hidden(nodes[first])) {
      start = nodes[first][1];
      first += 1;
    }
    while (
      last > first &&
      nodes[last - 1][1] === end &&
      hidden(nodes[last - 1])
    ) {
      end = nodes[last - 1][0];
      last -= 1;
    }

    const at = (index: number) =>
      index < tokens.length ? from + offsets[index] : to;

    return start < end ? [at(start), at(end)] : [from, to];
  }

  private movedCopy(tokens: readonly JsonToken[]) {
    const mark = this.options.markOf('insert');

    return tokens.map((token) =>
      token.kind === 'open'
        ? openToken(
            token.nodeKind,
            this.withMarks(token.props, [
              ...this.withoutCuts(token.props),
              mark,
            ])
          )
        : token
    );
  }

  private pushRemoved(after: number, from: number, to: number) {
    this.pieces.push({
      after,
      beforeFrom: from,
      beforeTo: to,
      kind: 'removed',
      // Only a caret at the removal's start, as Delete leaves it, steps
      // rightward; a caret at its end may sit past the closing tokens. A
      // later step of the same command, such as the text merge after a block
      // join, keeps the direction the first one took.
      leftward:
        this.options.selectionBefore === null
          ? this.options.leftward
          : this.options.selectionBefore > from,
    });
  }

  private contextAt(position: number): Context[] {
    return this.index
      .openContextAt(position)
      .filter(
        (entry) => entry.contentFrom <= position && position <= entry.contentTo
      )
      .map((entry) => ({
        contentFrom: entry.contentFrom,
        contentTo: entry.contentTo,
        kind: entry.kind,
        path: entry.path,
        props: propsOf(this.index.node(entry.path)),
      }));
  }

  private propsStartingAt(position: number): Props {
    const entry = this.index.nodeStartingAt(position);

    return entry ? propsOf(this.index.node(entry.path)) : {};
  }

  private recordProperties(
    at: number,
    modifications: readonly PropertyModification[],
    frameAt: number | null = null
  ) {
    const previous = this.propsStartingAt(at);
    let next = applyPropertyModifications(
      previous,
      modifications.filter(
        (modification) => modification.key !== AUTHORED_MARKS_KEY
      )
    );
    const entry = this.index.nodeStartingAt(at);

    // The canonical form drops some keys from an empty text, and a change to
    // one there would record a suggestion that applies nothing.
    if (entry && this.index.node(entry.path).text === '') {
      const parents = entry.path
        .slice(1)
        .map((_, depth) =>
          propsOf(this.index.node(entry.path.slice(0, depth + 1)))
        )
        .reverse();

      const dropped = Object.keys({ ...previous, ...next }).filter(
        (key) =>
          !jsonEqual(previous[key], next[key]) &&
          !this.options.emptyTextKeeps(key, next[key] ?? previous[key], parents)
      );

      next = Object.fromEntries([
        ...Object.entries(next).filter(([key]) => !dropped.includes(key)),
        ...dropped
          .filter((key) => Object.hasOwn(previous, key))
          .map((key) => [key, previous[key]]),
      ]);
    }

    const props = this.formattedProps(previous, next);

    if (props) this.ops.push({ at, kind: 'props', props });
    const frameText =
      frameAt === null
        ? undefined
        : this.options.frameIndex?.nodeStartingAt(frameAt);

    if (frameText?.kind === 'text' && entry?.kind === 'text') {
      this.spreadProperties(
        entry,
        previous,
        modifications,
        this.options.plainToReview(frameText.to, -1)
      );
    }
  }

  /**
   * The frame's document merges a text piece with the later pieces that only
   * crossed-out content separates from it when their properties match, so a
   * property change on the merged text reaches each of them.
   */
  private spreadProperties(
    entry: IndexedNodeRange,
    previous: Props,
    modifications: readonly PropertyModification[],
    end: number
  ) {
    const ordinary = (props: Props) => withMembers(props, []);
    const parent = entry.path.slice(0, -1);

    for (
      let next = this.index.nodeStartingAt(entry.to);
      next?.kind === 'text' &&
      next.from < end &&
      next.path.length === entry.path.length &&
      jsonEqual(next.path.slice(0, -1), parent);
      next = this.index.nodeStartingAt(next.to)
    ) {
      const props = propsOf(this.index.node(next.path));

      if (this.hasMarkKind(props, 'delete')) {
        continue;
      }
      if (!jsonEqual(ordinary(props), ordinary(previous))) return;
      this.recordProperties(next.from, modifications);
    }
  }

  /**
   * The properties a node takes when an edit changes keys other than the
   * review marks from `previous` to `next`, or `null` to keep `previous`.
   * Each changed key's tags go through `writeLayer`; Suggesting records
   * nothing on struck content.
   */
  private formattedProps(previous: Props, next: Props): Props | null {
    const keys = [
      ...new Set([...Object.keys(previous), ...Object.keys(next)]),
    ].filter(
      (key) =>
        key !== AUTHORED_MARKS_KEY && !jsonEqual(previous[key], next[key])
    );

    if (keys.length === 0) return null;

    const marks = this.marks(previous);

    if (marks.some((mark) => mark.kind === 'delete')) {
      return null;
    }

    const { changeId, createTagId, isOwn, markOf, source } = this.options;
    const { at, author, change, inc } = markOf('insert');
    const ownInsertion = marks.some(
      (mark) => mark.kind === 'insert' && isOwn(mark)
    );
    let tags = marks.filter(
      (mark): mark is FormatTag => mark.kind === 'format'
    );

    for (const key of keys) {
      const written = writeLayer({
        intent: isEditingChange(changeId) ? 'edit' : 'propose',
        isOwn,
        next: next[key] as LayerValue,
        ownInsertion,
        previous: previous[key] as LayerValue,
        source,
        tag: (fields) => ({
          ...fields,
          at,
          author,
          change,
          ...(inc === undefined ? {} : { inc }),
          id: createTagId(),
          key,
          kind: 'format',
        }),
        tags: tags.filter((tag) => tag.key === key),
      });

      tags = [...tags.filter((tag) => tag.key !== key), ...written];
    }

    return this.withMarks(next, [
      ...marks.filter((mark) => mark.kind !== 'format'),
      ...tags,
    ]);
  }

  private recordReplacement(
    from: number,
    to: number,
    inserted: PreparedTokenSlice,
    after: number,
    { closesWrap = false }: Readonly<{ closesWrap?: boolean }> = {}
  ) {
    const startContext = this.contextAt(from);
    const landing = this.options.moveRole === 'landing';

    // Pending deletions the write puts back, as a replace that moves struck
    // content does, so its source is struck over them and every decision
    // keeps one copy.
    const reinserted = new Set(
      inserted.tokens.flatMap((token) =>
        token.kind === 'open'
          ? this.marks(token.props)
              .filter((mark) => mark.kind === 'delete')
              .map(incarnationOf)
          : []
      )
    );
    const struck = this.strike(
      from,
      to,
      startContext,
      this.options.moveRole === 'source' ? 'move' : 'delete',
      reinserted
    );

    if (this.options.framed && inserted.length === 0) {
      this.keepEmptiedLine(from, to, startContext);
    }
    this.recordInsertion({
      after,
      at: to,
      closesWrap,
      contexts: struck.contexts,
      inserted,
      landing,
      openLeaf: struck.openLeaf,
      reopen: struck.reopen,
      removedFrom: from,
      startContexts: startContext,
    });
  }

  /**
   * A line another author's pending deletion strikes stands in the frame only
   * through its live content. When a removal inside it takes the last of that
   * content, the frame still holds the emptied line, so an empty line with its
   * properties follows it. A suggested one stood only while the line's
   * deletions and the removed content's insertions did, so it rests on both.
   */
  private keepEmptiedLine(
    from: number,
    to: number,
    contexts: readonly Context[]
  ) {
    const line = contexts.findLast((context) => context.kind === 'element');

    if (
      !line ||
      to > line.contentTo ||
      !isTextBlock(this.index.node(line.path)) ||
      !this.hasMarkKind(line.props, 'delete') ||
      !this.holdsLiveContent(line, from, from) ||
      this.holdsLiveContent(line, from, to)
    ) {
      return;
    }

    const { isOwn, markOf } = this.options;
    const lineMarks = this.marks(line.props);
    const resting = [
      ...lineMarks.flatMap((mark) =>
        mark.kind === 'delete'
          ? [asInsertion(mark)]
          : mark.kind === 'insert'
            ? [mark]
            : []
      ),
      ...this.removedLiveContent(line, from, to).flatMap((props) =>
        this.marks(props).filter((mark) => mark.kind === 'insert')
      ),
    ].filter((mark) => !isOwn(mark));
    const node = this.options.dependencies.throughout(
      {
        ...this.withMarks(
          line.props,
          lineMarks.filter((mark) => mark.kind === 'format'),
          true
        ),
        children: [
          { ...this.withMarks(leafOf(contexts) ?? {}, [], true), text: '' },
        ],
      },
      [...resting, markOf('insert')]
    );

    this.ops.push({
      at: line.contentTo + 1,
      kind: 'insert',
      tokens: encodeNodes([node]).slice.tokens,
    });
  }

  /**
   * Whether `line` keeps content that accepting everything leaves once
   * `[from, to)` is gone: a letter of a leaf no deletion strikes, or an
   * element none strikes.
   */
  private holdsLiveContent(line: Context, from: number, to: number) {
    const { offsets, tokens } = this.index.slice(
      line.contentFrom,
      line.contentTo
    );
    let liveLeaf = false;

    return tokens.some((token, index) => {
      const at = line.contentFrom + offsets[index];

      if (token.kind === 'text') {
        return liveLeaf && (at < from || at + token.text.length > to);
      }
      if (token.kind !== 'open') return false;

      const live = !this.hasMarkKind(token.props, 'delete');

      if (token.nodeKind === 'text') {
        liveLeaf = live;
        return false;
      }

      return live && (at < from || at >= to);
    });
  }

  private removedLiveContent(line: Context, from: number, to: number) {
    const { offsets, tokens } = this.index.slice(
      line.contentFrom,
      line.contentTo
    );
    const removed: Props[] = [];
    let leaf: Props | null = null;

    tokens.forEach((token, index) => {
      const at = line.contentFrom + offsets[index];

      if (token.kind === 'open') {
        const live = !this.hasMarkKind(token.props, 'delete');

        if (token.nodeKind === 'text') leaf = live ? token.props : null;
        else if (live && at >= from && at < to) removed.push(token.props);
      } else if (
        token.kind === 'text' &&
        leaf &&
        at < to &&
        at + token.text.length > from &&
        !removed.includes(leaf)
      ) {
        removed.push(leaf);
      }
    });

    return removed;
  }

  /**
   * Keep removed content in place under a delete mark. Each node decides by
   * its own marks: one's own pending insertion is removed for real, and
   * struck content stays as is. A move strikes everything it removes, over
   * other deletions and one's own insertion, which a move never withdraws.
   */
  private strike(
    from: number,
    to: number,
    startContext: readonly Context[],
    mode: StrikeMode,
    reinserted: ReadonlySet<string> = new Set()
  ) {
    const stack: Context[] = [...startContext];
    const opened = new Set<number>();
    const removedTokens = this.index.slice(from, to);
    const local = removedTokens.tokens;
    const localOffsets = removedTokens.offsets;
    const closeOf = matchTokens(local);
    const { changeId, isOwn, markOf } = this.options;
    const struck = (marks: readonly AuthoredMark[]) =>
      marks.some(
        (mark) =>
          mark.kind === 'delete' &&
          (mode === 'delete' || mark.change === changeId) &&
          !reinserted.has(incarnationOf(mark))
      );
    // Another author's insertion inside one's own, as a move's copy of one's
    // own text, stays for that insertion's decision.
    const withdrawn = (marks: readonly AuthoredMark[]) => {
      const innermost = innermostInsert(marks);

      return mode === 'delete' && innermost !== undefined && isOwn(innermost);
    };
    // A node is removed outright only when everything inside it is withdrawn too,
    // so another author's pending content inside it stays to be decided.
    const withdrawnThroughout = (open: number, close: number) => {
      for (let inner = open; inner < close; inner += 1) {
        const token = local[inner];

        if (token.kind !== 'open') continue;

        const marks = this.marks(
          this.propsStartingAt(from + localOffsets[inner])
        );
        // An empty unmarked text, such as an inline element's spacer, holds
        // nothing to keep.
        const spacer =
          inner > open &&
          token.nodeKind === 'text' &&
          local[inner + 1]?.kind === 'close' &&
          marks.length === 0;

        const ownBoundary =
          mode === 'delete' &&
          token.nodeKind === 'element' &&
          marks.length > 0 &&
          marks.every(
            (mark) =>
              (mark.kind === 'split' || mark.kind === 'wrap') && isOwn(mark)
          );

        if (!spacer && !ownBoundary && !withdrawn(marks)) return false;
      }

      return true;
    };
    const strikeMark = (leaf: Context, position: number) =>
      mode === 'move'
        ? markOf('delete')
        : (this.ownDeleteNear(leaf, position, to) ?? markOf('delete'));
    let openLeaf: Props | null = leafOf(startContext);
    let reopen: Props | null = null;
    let firstSplitLeaf: Context | null = null;
    const removedOpenByClose = new Map<number, number>();
    const wholeElementByClose = new Map<
      number,
      Readonly<{ open: number; props: Props; strikeOpIndex: number | null }>
    >();
    const keptElementChildren = new Map<
      Context,
      { removed: boolean; survived: boolean }
    >();
    // A container a suggestion deletes whole owns what is inside it, so
    // accepting it removes content whose own deletion is rejected. An Editing
    // write is accepted at once, so it leaves another author's pending
    // deletion to be decided.
    const deletedWhole = new Set<Context>();
    const ownsStruck = !isEditingChange(changeId);
    // A struck element whose every child is withdrawn keeps its default
    // child, so every element holds a child.
    const emptiedKeptElementAt = new Map<
      number,
      Readonly<{
        at: number;
        marks: readonly AuthoredMark[];
        site: readonly Props[];
      }>
    >();
    // Open tokens of wrappers a pending unwrap dissolves, which a frame's
    // command never saw.
    const unwrappedOpens = new Set<number>();
    const survivingIndexBefore = (index: number) => {
      let back = index - 1;

      for (;;) {
        const open = removedOpenByClose.get(back);

        if (open !== undefined) back = open - 1;
        else if (unwrappedOpens.has(back)) back -= 1;
        else return back;
      }
    };
    const boundaryMark = (previous: JsonToken | undefined) =>
      markOf(
        this.options.origin !== 'unwrap' &&
          previous?.kind === 'close' &&
          previous.nodeKind === 'element'
          ? 'join'
          : 'unwrap'
      );

    for (let index = 0; index < local.length; index += 1) {
      const token = local[index];
      const position = from + localOffsets[index];

      if (token.kind === 'text') {
        const leaf = stack.at(-1);

        if (!leaf || leaf.kind !== 'text') {
          throw new Error('Text tokens must sit inside a text node.');
        }

        const marks = this.marks(leaf.props);

        if (struck(marks)) continue;
        if (withdrawn(marks)) {
          this.ops.push({
            from: position,
            kind: 'remove',
            to: position + token.text.length,
          });
          continue;
        }
        if (!opened.has(leaf.contentFrom) && firstSplitLeaf !== leaf) {
          // Split the leaf so only the removed characters are struck.
          const struckProps = this.withMarks(leaf.props, [
            ...marks,
            strikeMark(leaf, position),
          ]);

          this.ops.push({
            at: position,
            kind: 'insert',
            tokens: [closeToken('text'), openToken('text', struckProps)],
          });
          firstSplitLeaf = leaf;
          openLeaf = struckProps;
          if (leaf.contentTo > to) reopen = leaf.props;
        }
        continue;
      }

      if (token.kind === 'open') {
        const close = closeOf.get(index);
        const props = this.propsStartingAt(position);
        const entry = this.index.nodeStartingAt(position);
        const context: Context = {
          contentFrom: position + 1,
          contentTo: entry ? entry.contentTo : position + 1,
          kind: token.nodeKind,
          path: entry?.path ?? [],
          props,
        };
        const marks = this.marks(props);
        const removedOutright =
          close !== undefined && withdrawnThroughout(index, close);
        const parent = stack.at(-1);
        const parentChildren = parent && keptElementChildren.get(parent);

        if (parentChildren && !removedOutright) parentChildren.survived = true;
        else if (parentChildren) parentChildren.removed = true;
        if (close !== undefined) {
          if (removedOutright) {
            this.ops.push({
              from: position,
              kind: 'remove',
              to: from + localOffsets[close] + 1,
            });
            removedOpenByClose.set(close, index);
            index = close;
            continue;
          }
          const insideDeletedWhole =
            ownsStruck &&
            mode === 'delete' &&
            stack.some((above) => deletedWhole.has(above)) &&
            !marks.some(
              (mark) => mark.kind === 'delete' && mark.change === changeId
            );
          const strikeOpIndex =
            struck(marks) && !insideDeletedWhole ? null : this.ops.length;

          if (token.nodeKind === 'element') {
            wholeElementByClose.set(close, {
              open: index,
              props,
              strikeOpIndex,
            });
          }
          if (strikeOpIndex !== null) {
            this.ops.push({
              at: position,
              kind: 'props',
              props: this.withMarks(props, [...marks, markOf('delete')]),
            });
          }
          if (token.nodeKind === 'text') {
            index = close;
          } else {
            stack.push(context);
            if (strikeOpIndex !== null) deletedWhole.add(context);
            keptElementChildren.set(context, {
              removed: false,
              survived: false,
            });
          }
          continue;
        }

        stack.push(context);
        opened.add(context.contentFrom);

        if (token.nodeKind === 'text') {
          openLeaf = props;
          if (struck(marks) || withdrawn(marks)) continue;

          const struckProps = this.withMarks(props, [
            ...marks,
            strikeMark(context, context.contentFrom),
          ]);

          this.ops.push({ at: position, kind: 'props', props: struckProps });
          openLeaf = struckProps;
          reopen = props;
          continue;
        }

        // The block after such a wrapper meets the boundary before it.
        if (
          this.options.framed &&
          marks.some((mark) => mark.kind === 'unwrap')
        ) {
          unwrappedOpens.add(index);
          openLeaf = null;
          continue;
        }

        const previousIndex = survivingIndexBefore(index);
        const previous = local[previousIndex];
        const mergeTarget = wholeElementByClose.get(previousIndex);
        // Withdrawing merges into the element before, which must be the one
        // the write merges into or one this change strikes, whose strike
        // becomes the boundary instead. Another change's struck element in
        // between takes a join, which lands past it.
        const withdrawsOwnBoundary =
          mode === 'delete' &&
          previous?.kind === 'close' &&
          (!mergeTarget ||
            mergeTarget.strikeOpIndex !== null ||
            this.marks(mergeTarget.props).some(
              (mark) => mark.kind === 'delete' && mark.change === changeId
            )) &&
          marks.some(
            (mark) =>
              (mark.kind === 'split' || mark.kind === 'wrap') && isOwn(mark)
          );

        if (withdrawsOwnBoundary) {
          const previousAt = from + localOffsets[previousIndex];

          this.ops.push({
            from: previousAt,
            kind: 'remove',
            to: previousAt + 1,
          });
          this.ops.push({ from: position, kind: 'remove', to: position + 1 });
          emptiedKeptElementAt.delete(previousIndex);
          if (mergeTarget) {
            const targetMarks = this.marks(mergeTarget.props);
            const withoutOwnDelete = targetMarks.filter(
              (mark) => !(mark.kind === 'delete' && mark.change === changeId)
            );
            const boundaryInsteadOfStrike: Op = {
              at: from + localOffsets[mergeTarget.open],
              kind: 'props',
              props: this.withMarks(mergeTarget.props, [
                ...withoutOwnDelete,
                boundaryMark(local[survivingIndexBefore(mergeTarget.open)]),
              ]),
            };

            if (mergeTarget.strikeOpIndex !== null) {
              this.ops[mergeTarget.strikeOpIndex] = boundaryInsteadOfStrike;
            } else if (withoutOwnDelete.length < targetMarks.length) {
              this.ops.push(boundaryInsteadOfStrike);
            }
          }
          continue;
        }

        const boundary = boundaryMark(previous);

        // A boundary a pending join already removes is gone from the frame's
        // document, so the fold never joins it a second time.
        if (
          boundary.kind !== 'join' ||
          !marks.some((mark) => mark.kind === 'join')
        ) {
          this.ops.push({
            at: position,
            kind: 'props',
            props: this.withMarks(props, [...marks, boundary]),
          });
        }
        openLeaf = null;
        continue;
      }

      const closed = stack.pop();
      const children = closed && keptElementChildren.get(closed);

      if (closed && children?.removed && !children.survived) {
        const whole = wholeElementByClose.get(index);

        emptiedKeptElementAt.set(index, {
          at: position,
          marks: [
            ...this.marks(closed.props).filter(
              (mark) => mark.kind === 'insert' || mark.kind === 'delete'
            ),
            ...(whole && whole.strikeOpIndex !== null
              ? [markOf('delete')]
              : []),
          ],
          site: [
            closed.props,
            ...stack.map((context) => context.props).reverse(),
          ],
        });
      }
      if (token.nodeKind === 'text') {
        openLeaf = null;
        reopen = null;
        if (closed && firstSplitLeaf === closed) firstSplitLeaf = null;
      }
    }
    // The resolver keeps an element while anything inside it survives, so the
    // fill carries the element's insertions and deletions, which decide it
    // with the element.
    for (const { at, marks, site } of emptiedKeptElementAt.values()) {
      const children = this.options.fill(site);

      if (children.length === 0) continue;
      this.ops.push({
        at,
        kind: 'insert',
        tokens: encodeNodes(
          children.map((child) =>
            this.options.dependencies.throughout(child, marks)
          )
        ).slice.tokens,
      });
    }

    return {
      contexts: stack,
      openLeaf,
      reopen: reopen && openLeaf ? reopen : null,
    };
  }

  /**
   * Insert a step's new tokens after any struck run, marking inserted content
   * and restoring the leaf the document continues in. A move's landing keeps
   * the moved content's marks and adds the mover's insertion to each node.
   */
  private recordInsertion(
    input: Readonly<{
      after: number;
      at: number;
      closesWrap?: boolean;
      contexts: readonly Context[];
      inserted: PreparedTokenSlice;
      landing: boolean;
      openLeaf: Props | null;
      removedFrom: number;
      reopen?: Props | null;
      startContexts?: readonly Context[];
    }>
  ) {
    const { at, inserted, landing } = input;
    const output: JsonToken[] = [];
    const outputTextOffsets: number[] = [];
    const local = inserted.tokens;
    const closeOf = matchTokens(local);
    const stack: Context[] = [...input.contexts];
    const baseLeaf = input.reopen ?? leafOf(input.contexts);
    let outLeaf: Props | null = input.openLeaf;
    let outLength = 0;
    const emit = (token: JsonToken) => {
      output.push(token);
      outLength += token.kind === 'text' ? token.text.length : 1;
    };
    const closeLeaf = () => {
      if (outLeaf === null) return;
      emit(closeToken('text'));
      outLeaf = null;
    };
    const ensureLeaf = (props: Props) => {
      if (outLeaf !== null && jsonEqual(outLeaf, props)) return;
      closeLeaf();
      emit(openToken('text', props));
      outLeaf = props;
    };
    const ownElement = () => {
      for (const context of [...stack].reverse()) {
        if (context.kind !== 'element') continue;

        // A block an Editing edit placed after a pending join carries an
        // Editing insertion that only says which join it goes with, so
        // nothing inside it is pending.
        const own = this.marks(context.props).find(
          (mark) =>
            mark.kind === 'insert' &&
            !isEditingChange(mark.change) &&
            this.options.isOwn(mark)
        );

        if (own) {
          const { type } = context.props;

          return {
            // What is written inside the block claims its insertion, never
            // its place after a pending join.
            mark: {
              at: own.at,
              author: own.author,
              change: own.change,
              ...(own.inc === undefined ? {} : { inc: own.inc }),
              kind: 'insert' as const,
            },
            oneText: typeof type === 'string' && this.options.oneText(type),
          };
        }
      }

      return null;
    };
    const insertedMarks = () => {
      const own = ownElement();

      return own
        ? [own.mark]
        : [
            ...this.containedInsertMarks(stack, at),
            this.continuedOwnInsert(stack, at) ?? this.options.markOf('insert'),
          ];
    };
    const withInserted = (props: Props, added: readonly AuthoredMark[]) =>
      this.withMarks(props, [...this.marks(props), ...added]);
    const insertedLeaves = new Set<Context>();
    const landed = (props: Props) => {
      const marks = this.withoutCuts(props);

      return this.withMarks(props, [...marks, this.options.markOf('insert')]);
    };
    let trailingLeafProps: Props | null = input.reopen ?? leafOf(stack);
    let closedElement = false;
    // The slice was written for the elements open where the replacement
    // starts, but a Suggesting insertion lands after the struck range, inside
    // the elements open where it ends. The slice's closes of elements the
    // struck range already closed are dropped, and inline elements only the
    // end has close before the slice writes into them. That holds only while each
    // piece of content lands in the element it was written for, or inline in
    // an element of the same type that the struck range joins to it, which
    // keeps content before the struck range.
    const elementsOf = (contexts: readonly Context[]) =>
      contexts.filter((context) => context.kind === 'element');
    const keyOf = (context: Context | undefined) => context?.path.join(',');
    const written = elementsOf(input.startContexts ?? input.contexts);
    const lands = elementsOf(input.contexts);
    const landKeys = new Set(lands.map(keyOf));
    const shared = new Set(
      written.map(keyOf).filter((key) => landKeys.has(key))
    );
    let closedByStrike = written.length - lands.length;
    let realigned = false;
    let misplaced = false;
    let reopened = false;
    const misplacedReplacement = () =>
      unrepresentable(
        'Suggesting cannot place this replacement after the content it replaces.'
      );
    const closeLanding = () => {
      for (; closedByStrike < 0; closedByStrike += 1) {
        const inner = lands.at(-1);

        if (misplaced || !inner || !this.options.isInline(inner.props)) {
          throw misplacedReplacement();
        }
        closeLeaf();
        if (stack.at(-1)?.kind === 'text') stack.pop();
        emit(closeToken('element'));
        const closed = stack.pop();

        if (closed) splitFrom.push(closed);
        lands.pop();
        closedElement = true;
        realigned = true;
      }
    };
    const place = (inline: boolean) => {
      if (reopened) return;
      closeLanding();

      const into = written.at(-1);
      const onto = lands.at(-1);
      const joined =
        inline &&
        into !== undefined &&
        onto !== undefined &&
        !shared.has(keyOf(into)) &&
        !shared.has(keyOf(onto)) &&
        into.props.type === onto.props.type &&
        input.removedFrom > into.contentFrom + 1;

      if (keyOf(into) !== keyOf(onto) && !joined) misplaced = true;
      if (misplaced && realigned) throw misplacedReplacement();
    };
    // A split closes elements innermost first and its continuations reopen
    // them outermost first, so each continuation pops the element it continues.
    const splitFrom: Context[] = [];

    // Text that lands directly in an element holding blocks, or in the root,
    // goes into the block the schema completes it with, recorded as the
    // writer's insertion. A split in such an element, as Enter writes it,
    // splits that block, and the block after the split is a fill too.
    let filled = 0;
    const fills = new Set<Context>();
    const fillAt = (leaf = false, root = false) => {
      const top = stack.at(-1);

      if (
        !this.options.framed ||
        (top ? top.kind !== 'element' : !root) ||
        outLeaf !== null
      ) {
        return;
      }

      const [first] = this.options.fill(
        stack.map((context) => context.props).reverse()
      );

      if (!first || typeof first.text === 'string' || !first.children) return;

      const { children, ...props } = first;
      const withInsertMark = (marked: Props) =>
        this.withMarks(marked, [
          ...this.marks(marked),
          this.options.markOf('insert'),
        ]);
      const fillProps = withInsertMark(props);
      const fill: Context = {
        contentFrom: at,
        contentTo: at,
        kind: 'element',
        path: [],
        props: fillProps,
      };

      emit(openToken('element', fillProps));
      stack.push(fill);
      fills.add(fill);
      filled += 1;

      const [text] = children as JsonNode[];

      if (leaf && text && typeof text.text === 'string') {
        const { text: _text, ...leafProps } = text;

        ensureLeaf(withInsertMark(leafProps));
        stack.push({ ...fill, kind: 'text', props: outLeaf ?? leafProps });
      }
    };
    const [first] = local;
    const splitsFill = first?.kind === 'close' && !input.closesWrap;

    if (splitsFill) fillAt(first.nodeKind === 'text', true);

    const unfill = () => {
      if (filled === 0) return;
      closeLeaf();
      for (; filled > 0; filled -= 1) {
        emit(closeToken('element'));
        stack.pop();
      }
    };

    for (let index = 0; index < local.length; index += 1) {
      const token = local[index];

      if (token.kind !== 'text' && !splitsFill) unfill();
      if (token.kind === 'text') {
        place(true);
        fillAt(false, true);
        const leaf = stack.at(-1);
        const leafProps =
          leaf && leaf.kind === 'text' ? leaf.props : ({} as Props);
        const desired = landing
          ? landed(leafProps)
          : leaf && insertedLeaves.has(leaf)
            ? leaf.props
            : this.suggestedTextProps(leaf, at, ownElement());

        ensureLeaf(desired);
        for (let offset = 0; offset < token.text.length; offset += 1) {
          outputTextOffsets.push(outLength + offset);
        }
        emit(textToken(token.text));
        continue;
      }

      const close = token.kind === 'open' ? closeOf.get(index) : undefined;

      if (token.kind === 'open' && close !== undefined) {
        place(token.nodeKind === 'text' || this.options.isInline(token.props));
        closeLeaf();
        const subtree = local.slice(index, close + 1);
        const added = landing ? null : insertedMarks();

        for (const item of subtree) {
          if (item.kind === 'text') {
            for (let offset = 0; offset < item.text.length; offset += 1) {
              outputTextOffsets.push(outLength + offset);
            }
          } else {
            outputTextOffsets.push(outLength);
          }
          emit(
            item.kind !== 'open'
              ? item
              : openToken(
                  item.nodeKind,
                  added === null
                    ? landed(item.props)
                    : withInserted(item.props, added)
                )
          );
        }
        index = close;
        continue;
      }

      if (token.kind === 'open') {
        // A continuation: an element opened before any close encloses what
        // follows it, as a wrap writes it, and after a close splits its
        // block. A text continues the leaf the document goes on in, which is
        // opened once its properties are known.
        closeLanding();
        reopened = true;
        closeLeaf();
        outputTextOffsets.push(outLength);
        const insertedLeaf =
          token.nodeKind === 'text' &&
          !landing &&
          this.options.origin === 'slice';
        const continuing: Context = {
          contentFrom: at,
          contentTo: at,
          kind: token.nodeKind,
          path: [],
          props: insertedLeaf
            ? withInserted(token.props, insertedMarks())
            : token.props,
        };

        stack.push(continuing);
        if (insertedLeaf) insertedLeaves.add(continuing);
        if (token.nodeKind === 'text') {
          trailingLeafProps = this.continuedLeafProps(baseLeaf, token.props);
          continue;
        }
        // A continuation keeps the pending insertion or deletion of the
        // element it continues, whose existence it shares, and the pending
        // writes of each property it keeps.
        const continued = closedElement ? splitFrom.pop() : undefined;
        const marks = continued ? this.marks(continued.props) : [];
        const dropped = continued
          ? this.droppedOnSplit(continued, token.props, marks)
          : null;
        const inherited = marks.filter(
          (mark) =>
            mark.kind === 'insert' ||
            mark.kind === 'delete' ||
            (mark.kind === 'format' && !dropped?.has(mark.key))
        );
        const own = ownElement();
        // Text that survives rejecting one's own insertion needs the split's
        // own claim to come back together.
        const suggested =
          !own ||
          (continued !== undefined &&
            continued.path.length > 0 &&
            !this.rejectingEmpties(this.index.node(continued.path), own.mark));
        const claim =
          this.continuedOwnInsert(input.contexts, at) ??
          this.options.markOf('split');
        const rightCuts = this.splitInline(
          continued,
          token.props,
          suggested,
          claim
        );

        if (continued && fills.has(continued)) {
          fills.add(getDefined(stack.at(-1)));
          filled += 1;
        }

        emit(
          openToken(
            'element',
            this.withMarks(token.props, [
              ...this.marks(token.props),
              ...inherited,
              ...(rightCuts ?? []),
              ...(suggested && !rightCuts
                ? [
                    closedElement
                      ? this.splitOf(continued, claim)
                      : this.options.markOf('wrap'),
                  ]
                : []),
            ])
          )
        );
        continue;
      }

      // A structural close of a container open at the insertion point.
      if (token.nodeKind === 'text') {
        outputTextOffsets.push(outLength);
        closeLeaf();
        stack.pop();
        trailingLeafProps = null;
        continue;
      }
      closeLanding();
      written.pop();
      if (closedByStrike > 0) {
        if (misplaced) throw misplacedReplacement();
        closedByStrike -= 1;
        realigned = true;
        closeLeaf();
        outputTextOffsets.push(outLength);
        continue;
      }
      lands.pop();
      closeLeaf();
      outputTextOffsets.push(outLength);
      emit(token);
      const closed = stack.pop();

      if (closed) splitFrom.push(closed);
      if (closed && fills.has(closed)) filled -= 1;
      closedElement = true;
    }

    // An insertion that ends by opening the next leaf, as Enter does, leaves
    // the caret inside that leaf, so the leaf opens before the insertion ends.
    if (trailingLeafProps !== null && local.at(-1)?.kind === 'open') {
      ensureLeaf(trailingLeafProps);
    }
    outputTextOffsets.push(outLength);
    if (filled > 0) {
      trailingLeafProps = null;
      unfill();
    }
    if (trailingLeafProps === null) closeLeaf();
    else ensureLeaf(trailingLeafProps);

    if (output.length > 0) {
      this.ops.push({ at, kind: 'insert', tokens: output });
    }
    if (inserted.length > 0) {
      this.pieces.push({
        afterFrom: input.after,
        afterTo: input.after + inserted.length,
        at,
        kind: 'inserted',
        offsets: outputTextOffsets,
      });
    }
    if (at > input.removedFrom) {
      this.pushRemoved(input.after, input.removedFrom, at);
    }
  }

  /**
   * A split of an inline element: the left fragment's `end` cuts move to the
   * new right fragment, and a suggested split adds a cut, its `end` on the
   * left fragment and its `start` on the right, which keeps the properties
   * the split dropped. Returns the right fragment's cut tags, or `null` when
   * it gets none.
   */
  private splitInline(
    continued: Context | undefined,
    rightProps: Props,
    suggested: boolean,
    claim: AuthoredMark
  ): AuthoredMark[] | null {
    if (
      !continued ||
      continued.path.length === 0 ||
      !this.options.isInline(continued.props)
    ) {
      return null;
    }

    const marks = this.marks(continued.props);
    const moved = marks.filter((mark) => isCut(mark) && mark.side === 'end');

    if (!suggested && moved.length === 0) return null;

    const { at, author, change, inc } = claim;
    const cut = suggested
      ? {
          at,
          author,
          change,
          ...(inc === undefined ? {} : { inc }),
          cut: this.options.createTagId(),
          kind: 'split' as const,
        }
      : null;
    const kept = Object.fromEntries(
      Object.entries(continued.props).filter(
        ([key]) => key !== AUTHORED_MARKS_KEY && !Object.hasOwn(rightProps, key)
      )
    ) as Readonly<Record<string, EditorJsonValue>>;

    this.ops.push({
      at: continued.contentFrom - 1,
      kind: 'props',
      props: this.withMarks(continued.props, [
        ...marks.filter((mark) => !moved.includes(mark)),
        ...(cut ? [{ ...cut, side: 'end' as const }] : []),
      ]),
    });

    return [
      ...moved,
      ...(cut
        ? [
            {
              ...cut,
              ...(Object.keys(kept).length > 0 ? { kept } : {}),
              side: 'start' as const,
            },
          ]
        : []),
    ];
  }

  /**
   * The leaf a split or an insertion continues the document in: the review
   * leaf's marks with the other properties the edit changed, which Suggesting
   * records as that text's format change.
   */
  private continuedLeafProps(base: Props | null, next: Props): Props {
    if (!base) return next;

    return (
      this.formattedProps(base, this.withMarks(next, this.marks(base))) ?? base
    );
  }

  private suggestedTextProps(
    leaf: Context | undefined,
    at: number,
    ownElement: Readonly<{ mark: AuthoredMark; oneText: boolean }> | null
  ): Props {
    if (!leaf || leaf.kind !== 'text') {
      return this.withMarks({}, [
        ownElement?.mark ?? this.options.markOf('insert'),
      ]);
    }

    const marks = this.marks(leaf.props);
    const innermost = innermostInsert(marks);
    // Text whose innermost insertion is another author's is theirs, so typing
    // in it nests a new insertion inside theirs that a delete withdraws, even
    // in one's own pending element, unless that element is one-text.
    const foreign = innermost !== undefined && !this.options.isOwn(innermost);
    const struck = marks.some((mark) => mark.kind === 'delete');

    if (innermost && !foreign && !struck) return withoutHeld(leaf.props);
    if (ownElement && (ownElement.oneText || !foreign)) {
      // Text in one's own pending element carries that element's insert mark,
      // so a late edit is reviewable; a one-text element cannot split.
      const live = marks.filter(
        (mark) => mark.kind !== 'delete' && mark.kind !== 'format'
      );

      return this.withMarks(
        leaf.props,
        ownElement.oneText ? live : [...live, ownElement.mark],
        true
      );
    }

    const inside = leaf.contentFrom < at && at < leaf.contentTo;
    const kept = inside
      ? marks.filter((mark) => mark.kind === 'insert')
      : this.sharedNeighborInserts(leaf, at);

    return this.withMarks(
      leaf.props,
      [
        ...kept,
        this.continuedOwnInsert([leaf], at) ?? this.options.markOf('insert'),
      ],
      true
    );
  }

  /**
   * Insert marks an edge insertion keeps: only those on both sides of it, in
   * the left side's order.
   */
  private sharedNeighborInserts(leaf: Context, at: number) {
    const leftEdge = at === leaf.contentFrom;
    const neighbor = this.neighborLeaf(leaf, leftEdge ? -1 : 1);

    if (!neighbor) return [];

    const inserts = (props: Props) =>
      this.marks(props).filter((mark) => mark.kind === 'insert');
    const [left, right] = leftEdge
      ? [inserts(neighbor), inserts(leaf.props)]
      : [inserts(leaf.props), inserts(neighbor)];
    const keys = new Set(right.map(incarnationOf));

    return left.filter((mark) => keys.has(incarnationOf(mark)));
  }

  /** The pending join a block with these marks carries or goes with. */
  private followedBy(props: Props) {
    const marks = this.marks(props);
    const join = marks.find((mark) => mark.kind === 'join');

    return join ? incarnationOf(join) : marks.map(followsOf).find(Boolean);
  }

  private splitOf(
    source: Context | undefined,
    claim: AuthoredMark
  ): AuthoredMark {
    const { at, author, change, inc } = claim;
    const follows = source ? this.followedBy(source.props) : undefined;

    return {
      at,
      author,
      change,
      ...(inc === undefined ? {} : { inc }),
      ...(follows === undefined ? {} : { follows }),
      kind: 'split',
    };
  }

  private rejectingEmpties(node: unknown, own: AuthoredMark): boolean {
    const { children, text } = node as {
      children?: readonly unknown[];
      text?: unknown;
    };

    if (typeof text === 'string') {
      return (
        text === '' ||
        this.marks(propsOf(node)).some(
          (mark) =>
            mark.kind === 'insert' && incarnationOf(mark) === incarnationOf(own)
        )
      );
    }

    return (children ?? []).every((child) => this.rejectingEmpties(child, own));
  }

  private continuedOwnInsert(stack: readonly Context[], at: number) {
    const leaf = stack.at(-1);
    const candidates: Props[] = [];

    if (leaf?.kind === 'text') {
      candidates.push(leaf.props);
      if (at === leaf.contentFrom || at === leaf.contentTo) {
        const neighbor = this.neighborLeaf(
          leaf,
          at === leaf.contentFrom ? -1 : 1
        );

        if (neighbor) candidates.push(neighbor);
      }
    } else {
      const ownSplitOfEmptyBlock =
        leaf && at === leaf.contentFrom && at === leaf.contentTo
          ? this.marks(leaf.props).find(
              (mark) =>
                mark.kind === 'split' &&
                !isCut(mark) &&
                this.options.isOwn(mark)
            )
          : undefined;

      if (ownSplitOfEmptyBlock) {
        const { at: time, author, change, inc } = ownSplitOfEmptyBlock;

        return {
          at: time,
          author,
          change,
          ...(inc === undefined ? {} : { inc }),
          kind: 'insert',
        } satisfies AuthoredMark;
      }
      for (const direction of [-1, 1] as const) {
        const point = this.index.pointAt(at, direction);

        if (
          point &&
          (!leaf ||
            leaf.path.every((index, depth) => point.path[depth] === index))
        ) {
          candidates.push(...this.textsBeside(point.path, direction));
        }
      }
    }

    for (const props of candidates) {
      const marks = this.marks(props);

      if (marks.some((mark) => mark.kind === 'delete')) continue;

      const innermost = innermostInsert(marks);

      if (innermost && this.options.isOwn(innermost)) return innermost;
    }

    return null;
  }

  private containedInsertMarks(stack: readonly Context[], at: number) {
    const leaf = stack.at(-1);

    if (!leaf || leaf.kind !== 'text') return [];
    if (!(leaf.contentFrom < at && at < leaf.contentTo)) return [];

    return this.marks(leaf.props).filter(
      (mark) => mark.kind === 'insert' && !this.options.isOwn(mark)
    );
  }

  /**
   * One's own pending deletion right beside a struck run takes it in, so
   * repeated Backspace or Delete grows one deletion instead of many.
   */
  private ownDeleteNear(leaf: Context, from: number, to: number) {
    const neighbors = [
      from === leaf.contentFrom ? this.neighborLeaf(leaf, -1) : null,
      to >= leaf.contentTo ? this.neighborLeaf(leaf, 1) : null,
    ];

    for (const props of neighbors) {
      const own = props
        ? this.marks(props).find(
            (mark) => mark.kind === 'delete' && this.options.isOwn(mark)
          )
        : undefined;

      if (own) return own;
    }

    return null;
  }

  /** A split at a text's end leaves an empty leaf for a write to look past. */
  private textsBeside(path: readonly number[], direction: -1 | 1) {
    const parentPath = path.slice(0, -1);
    const siblings = (
      parentPath.length === 0
        ? this.index.value
        : (this.index.node(parentPath) as JsonRecord).children
    ) as readonly JsonRecord[];
    const texts: Props[] = [];

    for (
      let index = path.at(-1) ?? 0;
      typeof siblings[index]?.text === 'string';
      index += direction
    ) {
      texts.push(propsOf(siblings[index]));
      if (siblings[index].text !== '') break;
    }

    return texts;
  }

  private neighborLeaf(leaf: Context, direction: -1 | 1): Props | null {
    const parentPath = leaf.path.slice(0, -1);
    const index = leaf.path.at(-1) ?? 0;
    const siblings =
      parentPath.length === 0
        ? this.index.value
        : ((this.index.node(parentPath) as JsonRecord)
            .children as readonly unknown[]);
    const sibling = siblings?.[index + direction] as JsonRecord | undefined;

    return sibling && typeof sibling.text === 'string'
      ? propsOf(sibling)
      : null;
  }

  private sections(): RootChangeSection[] {
    // Several rules can rewrite one token's properties, each against the
    // review draft before the step, so their changes compose.
    const propsAt = new Map<number, Props>();

    for (const op of this.ops) {
      if (op.kind !== 'props') continue;

      const original = this.propsStartingAt(op.at);

      propsAt.set(
        op.at,
        applyPropertyModifications(
          propsAt.get(op.at) ?? original,
          semanticPropertyModifications(original, op.props, isMarksKey)
        )
      );
    }

    const ordered = [...this.ops].sort(
      (left, right) =>
        startOf(left) - startOf(right) || rank(left) - rank(right)
    );
    const sections: RootChangeSection[] = [];

    for (const op of ordered) {
      const previous = sections.at(-1);

      if (op.kind === 'insert') {
        if (
          previous &&
          previous.insert &&
          (previous.to ?? previous.from) === op.at
        ) {
          sections[sections.length - 1] = {
            ...previous,
            insert: previous.insert.concat(
              PreparedTokenSlice.fromTokens(op.tokens)
            ),
          };
          continue;
        }
        sections.push({
          from: op.at,
          insert: PreparedTokenSlice.fromTokens(op.tokens),
          to: op.at,
        });
        continue;
      }
      if (op.kind === 'remove') {
        if (
          previous &&
          previous.insert &&
          previous.from === op.from &&
          previous.to === op.from
        ) {
          sections[sections.length - 1] = { ...previous, to: op.to };
          continue;
        }
        if (
          previous &&
          !previous.properties &&
          (previous.to ?? previous.from) === op.from &&
          previous.to !== previous.from
        ) {
          sections[sections.length - 1] = { ...previous, to: op.to };
          continue;
        }
        sections.push({ from: op.from, to: op.to });
        continue;
      }

      const props = propsAt.get(op.at);

      if (!props) continue;
      propsAt.delete(op.at);

      const modifications = semanticPropertyModifications(
        this.propsStartingAt(op.at),
        props,
        isMarksKey
      );

      if (modifications.length === 0) continue;
      sections.push({
        from: op.at,
        properties: deltaOf(modifications),
        to: op.at + 1,
      });
    }

    return sections;
  }

  private mapPosition(
    recorded: RootChange,
    position: number,
    assoc: -1 | 1,
    caret: boolean
  ) {
    let removed: Extract<Piece, { kind: 'removed' }> | null = null;

    for (const piece of this.pieces) {
      if (
        piece.kind === 'removed' &&
        (piece.after === position ||
          (caret && this.besideRemoval(piece, position)))
      ) {
        removed = piece;
      }
    }
    for (const piece of this.pieces) {
      if (piece.kind === 'removed') continue;
      if (position < piece.afterFrom || position > piece.afterTo) continue;
      if (piece.kind === 'shifted') {
        return (
          recorded.mapPos(
            this.options.plainToReview(
              piece.plainFrom + position - piece.afterFrom,
              assoc,
              caret
            ),
            assoc
          ) ?? position
        );
      }
      if (piece.kind === 'kept') {
        if (removed) break;
        if (
          position === piece.afterTo &&
          assoc === 1 &&
          piece.afterTo > piece.afterFrom
        ) {
          continue;
        }
        return (
          recorded.mapPos(
            piece.beforeFrom + position - piece.afterFrom,
            assoc
          ) ?? position
        );
      }

      const start = recorded.mapPos(piece.at, -1) ?? position;
      const offset = piece.offsets[position - piece.afterFrom];

      return start + (offset ?? 0);
    }

    if (removed) {
      const right = caret ? !removed.leftward : assoc === 1;
      const edge = right ? removed.beforeTo : removed.beforeFrom;

      return (
        recorded.mapPos(
          caret ? this.intoLeaf(edge, right) : edge,
          right ? 1 : -1
        ) ?? position
      );
    }

    return position;
  }

  /**
   * Whether a caret sits at a removal with only text-leaf boundaries between,
   * which an edit leaves when it puts the caret in the next or previous leaf.
   */
  private besideRemoval(
    removed: Extract<Piece, { kind: 'removed' }>,
    position: number
  ) {
    for (const piece of this.pieces) {
      if (piece.kind !== 'kept') continue;
      if (position < piece.afterFrom || position > piece.afterTo) continue;

      const at = piece.beforeFrom + position - piece.afterFrom;

      if (piece.afterTo === removed.after) {
        return this.onlyLeafBoundaries(at, removed.beforeFrom);
      }
      if (piece.afterFrom === removed.after) {
        return this.onlyLeafBoundaries(removed.beforeTo, at);
      }
    }

    return false;
  }

  private onlyLeafBoundaries(from: number, to: number) {
    return (
      from <= to &&
      this.index
        .slice(from, to)
        .tokens.every(
          (token) => token.kind !== 'text' && token.nodeKind === 'text'
        )
    );
  }

  private intoLeaf(position: number, right: boolean) {
    const boundary = (from: number, kind: 'close' | 'open') => {
      const token = this.index.slice(from, from + 1).tokens[0];

      return token?.kind === kind && token.nodeKind === 'text';
    };
    let at = position;

    if (right) {
      while (boundary(at, 'open')) at += 1;
    } else {
      while (at > 0 && boundary(at - 1, 'close')) at -= 1;
    }

    return at;
  }
}

const isMarksKey = (key: string) => key === AUTHORED_MARKS_KEY;

const sameToken = (left: JsonToken, right: JsonToken) => {
  if (left.kind === 'text') {
    return right.kind === 'text' && left.text === right.text;
  }
  if (right.kind !== left.kind || right.nodeKind !== left.nodeKind) {
    return false;
  }

  return left.kind === 'open' && right.kind === 'open'
    ? jsonEqual(left.props, right.props)
    : true;
};

const hasEnclosingEdges = (tokens: readonly JsonToken[], depth: number) => {
  const closeOf = matchTokens(tokens);

  for (let level = 0; level < depth; level += 1) {
    const open = tokens[level];

    if (
      open?.kind !== 'open' ||
      open.nodeKind !== 'element' ||
      closeOf.get(level) !== tokens.length - 1 - level
    ) {
      return false;
    }
  }

  return true;
};

const enclosureOf = (
  removed: PreparedTokenSlice,
  inserted: PreparedTokenSlice
) => {
  const wraps = removed.tokens.length < inserted.tokens.length;
  const inner = wraps ? removed.tokens : inserted.tokens;
  const outer = wraps ? inserted.tokens : removed.tokens;
  const depth = (outer.length - inner.length) / 2;

  if (inner.length === 0 || depth < 1 || !Number.isInteger(depth)) {
    return null;
  }
  if (
    !hasEnclosingEdges(outer, depth) ||
    !inner.every((token, index) => sameToken(token, outer[depth + index]))
  ) {
    return null;
  }

  return { depth, wraps };
};

const asInsertion = ({
  at,
  author,
  change,
  inc,
}: AuthoredMark): AuthoredMark => ({
  at,
  author,
  change,
  ...(inc === undefined ? {} : { inc }),
  kind: 'insert',
});

const leafOf = (contexts: readonly Context[]): Props | null => {
  const leaf = contexts.at(-1);

  return leaf?.kind === 'text' ? leaf.props : null;
};

const matchTokens = (tokens: readonly JsonToken[]) => {
  const closeOf = new Map<number, number>();
  const open: number[] = [];

  tokens.forEach((token, index) => {
    if (token.kind === 'open') open.push(index);
    else if (token.kind === 'close') {
      const opened = open.pop();

      if (opened !== undefined) closeOf.set(opened, index);
    }
  });

  return closeOf;
};

const startOf = (op: Op) => (op.kind === 'remove' ? op.from : op.at);

const rank = (op: Op) =>
  op.kind === 'insert' ? 0 : op.kind === 'remove' ? 1 : 2;

const deltaOf = (modifications: readonly PropertyModification[]) => {
  const set: Record<string, unknown> = {};
  const unset: string[] = [];
  const add: Record<string, unknown[]> = {};
  const remove: Record<string, unknown[]> = {};

  for (const modification of modifications) {
    if (modification.type === 'set') set[modification.key] = modification.value;
    else if (modification.type === 'unset') unset.push(modification.key);
    else if (modification.type === 'add') {
      add[modification.key] = [...modification.values];
    } else remove[modification.key] = [...modification.values];
  }

  return {
    ...(Object.keys(add).length > 0 ? { add } : {}),
    ...(Object.keys(remove).length > 0 ? { remove } : {}),
    ...(Object.keys(set).length > 0 ? { set: set as JsonRecord } : {}),
    ...(unset.length > 0 ? { unset } : {}),
  };
};
