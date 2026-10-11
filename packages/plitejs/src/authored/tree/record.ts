import type {
  DraftStep,
  DraftStepOrigin,
  DraftStepSource,
} from '../../core/change/builder';
import {
  createInternalDocumentChange,
  type DocumentChange,
  getInternalDocumentChangeEntries,
  valueRoot,
} from '../../core/change/document-change';
import { DocumentIndex } from '../../core/change/document-index';
import {
  applyPropertyModifications,
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
  type JsonRecord,
  type JsonToken,
  jsonEqual,
  openToken,
  PreparedTokenSlice,
  textToken,
} from '../../core/change/tokens';
import type { PropertyModification } from '../../core/change/transform';
import type { EditorJsonValue } from '../../interfaces/json';
import { isCut } from './cuts';
import { type FormatTag, type LayerValue, writeLayer } from './layers';
import {
  AUTHORED_MARKS_KEY,
  type AuthoredMark,
  readAuthoredMarks,
  withAuthoredMarks,
} from './marks';
import { isTextBlock } from './resolve';

export type AuthoredRecordIntent = 'edit' | 'propose';

export type AuthoredRecordInput = Readonly<{
  before: JsonEditorValue;
  /** Id of the change a Suggesting transaction creates. */
  changeId: string;
  createRoots: ReadonlySet<string>;
  /**
   * A fresh id for each format tag and inline split cut, unique across
   * collaborators.
   */
  createTagId: () => string;
  /**
   * The child an element keeps when a suggestion withdraws every child, or
   * null when its schema names none and allows it empty.
   */
  defaultChild: (props: Readonly<JsonRecord>) => JsonNode | null;
  deleteRoots: ReadonlySet<string>;
  /** A forced change: "own" then means this change, not the writer. */
  forcedChangeId?: string | null;
  intent: AuthoredRecordIntent;
  /** Whether an element with `props` is inline, so a split of it records a cut. */
  isInline: (props: Readonly<JsonRecord>) => boolean;
  /** Whether a split's continued element keeps property `key` of `props`. */
  keepsOnSplit: (
    props: Readonly<JsonRecord>,
    path: readonly number[],
    root: string,
    key: string,
    draftRoot: readonly JsonNode[]
  ) => boolean;
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
   * Map a selection position in the plain draft after the last step into the
   * recorded document: at a removal kept in place, the caret goes to the side
   * the deletion moved away from.
   */
  mapPosition: (root: string, position: number, assoc: -1 | 1) => number;
}>;

/** A Suggesting edit whose review form the schema cannot hold. */
export class AuthoredUnrepresentableError extends Error {
  override name = 'AuthoredUnrepresentableError';
}

type Props = Readonly<JsonRecord>;

/**
 * Maps a position between drafts. A removal the review draft keeps in place
 * maps to the side `assoc` names; a `caret` instead goes to the side the
 * deletion moved away from, as the selection after Backspace or Delete does.
 */
type PosMap = (position: number, assoc: -1 | 1, caret?: boolean) => number;

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
// inserted tokens as the plain step wrote them, and `plainFrom` the plain
// draft before the step.
type Group =
  | Readonly<{
      after: number;
      before: number;
      data: readonly PropertyModification[] | null;
      kind: 'kept';
      length: number;
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

const withMarks = (props: Props, marks: readonly AuthoredMark[]): Props =>
  withAuthoredMarks(props, marks);

// A copy that lands somewhere is a new node and carries no cuts, so each cut
// keeps one fragment per side: a struck source keeps them, and `relinkCuts`
// moves them off a removed one.
const withoutCuts = (props: Props) =>
  readAuthoredMarks(props).filter((mark) => !isCut(mark));

const withMarksThroughout = (
  node: JsonNode,
  marks: readonly AuthoredMark[]
): JsonNode => {
  if (marks.length === 0) return node;
  const record = node as JsonRecord & { children?: readonly JsonNode[] };

  return {
    ...withAuthoredMarks(record, [...readAuthoredMarks(record), ...marks]),
    ...(record.children
      ? {
          children: record.children.map((child) =>
            withMarksThroughout(child, marks)
          ),
        }
      : {}),
  } as JsonNode;
};

const identity: PosMap = (position) => position;

const mapBack = (change: RootChange, position: number, assoc: -1 | 1) => {
  let after = 0;
  let before = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];

    if (inserted < 0) {
      if (after + length > position) return before + position - after;
      after += length;
      before += length;
      continue;
    }

    const end = after + inserted;

    if (end > position || (end === position && assoc < 0 && inserted === 0)) {
      return position === after || assoc < 0 ? before : before + length;
    }
    after = end;
    before += length;
  }

  return before + position - after;
};

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
    }>
  > = [];

  for (let pair = 0; pair < step.sections.length / 2; pair += 1) {
    const length = step.sections[pair * 2];
    const inserted = step.sections[pair * 2 + 1];
    // A replacement covers only what the plain step replaced: struck content
    // the review draft keeps at either edge stays out of it, so new text
    // follows a deletion and a removal leaves earlier struck content alone.
    const replacesNext = inserted < 0 && pair + 1 < step.sections.length / 2;
    const reviewEnd = Math.max(
      reviewBefore,
      map(plainBefore + length, replacesNext ? 1 : -1)
    );
    const removed = reviewEnd - reviewBefore;

    if (inserted < 0) {
      outputs.push({
        inserted: false,
        plainAfter,
        plainAfterTo: plainAfter + length,
        plainBefore,
        reviewAfter,
        reviewBefore,
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

  const afterMap: PosMap = (position, assoc, caret) => {
    for (const output of outputs) {
      if (position < output.plainAfter || position > output.plainAfterTo) {
        continue;
      }
      if (output.inserted) {
        return output.reviewAfter + position - output.plainAfter;
      }

      return (
        output.reviewAfter +
        map(output.plainBefore + position - output.plainAfter, assoc, caret) -
        output.reviewBefore
      );
    }

    return reviewAfter;
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

type RootFold = {
  composed: RootChange | null;
  index: DocumentIndex;
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
  const { intent } = input;
  const changeId = input.forcedChangeId ?? input.changeId;
  const isOwn = (mark: AuthoredMark) =>
    input.forcedChangeId
      ? mark.change === input.forcedChangeId
      : mark.author === input.writer;
  const markOf = (
    kind: Exclude<AuthoredMark['kind'], 'format'>
  ): AuthoredMark => ({
    at: input.now,
    author: input.writer,
    change: changeId,
    kind,
  });
  const folds = new Map<string, RootFold>();
  const foldOf = (root: string) => {
    let fold = folds.get(root);

    if (!fold) {
      const created = input.createRoots.has(root);

      fold = {
        composed: null,
        index: DocumentIndex.fromValue(
          created ? [] : valueRoot(input.before, root)
        ),
        map: identity,
        created,
        touched: false,
      };
      folds.set(root, fold);
    }

    return fold;
  };

  if (intent === 'propose' && input.deleteRoots.size > 0) {
    throw new AuthoredUnrepresentableError(
      'Suggesting cannot delete a named root; suggest deleting its content.'
    );
  }

  for (const step of input.steps) {
    for (const [root, rootChange] of getInternalDocumentChangeEntries(
      step.change
    )) {
      const fold = foldOf(root);

      // The review draft runs its own canonical pass, so canonical
      // construction only moves the plain draft away from it.
      if (step.origin === 'canonical') {
        const previous = fold.map;

        fold.map = (position, assoc, caret) =>
          previous(mapBack(rootChange, position, assoc), assoc, caret);
        continue;
      }

      const plainToReview = fold.map;
      const { afterMap, groups } = rebase(
        rootChange,
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
          plainToReview,
          changeId,
          createTagId: input.createTagId,
          defaultChild: input.defaultChild,
          intent,
          isInline: input.isInline,
          isOwn,
          keepsOnSplit: (props, path, key, draftRoot) =>
            input.keepsOnSplit(props, path, root, key, draftRoot),
          markOf,
          moveRole: step.move?.role ?? null,
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
      }
      fold.touched = true;
      if (!recorded.empty) {
        fold.index = recorded.apply(fold.index);
        fold.composed = fold.composed
          ? fold.composed.compose(recorded)
          : recorded;
      }
      fold.map = (position, assoc, caret) =>
        mapRecorded(afterMap(position, assoc, caret), assoc, caret);
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
    mapPosition: (root, position, assoc) =>
      folds.get(root)?.map(position, assoc, true) ?? position,
  };
};

type RecorderOptions = Readonly<{
  plainToReview: PosMap;
  changeId: string;
  createTagId: () => string;
  defaultChild: (props: Props) => JsonNode | null;
  intent: AuthoredRecordIntent;
  isInline: (props: Props) => boolean;
  isOwn: (mark: AuthoredMark) => boolean;
  keepsOnSplit: (
    props: Props,
    path: readonly number[],
    key: string,
    draftRoot: readonly JsonNode[]
  ) => boolean;
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

  private get propose() {
    return this.options.intent === 'propose';
  }

  record(groups: readonly Group[]) {
    if (this.options.origin !== 'move' || !this.recordNodeMove(groups)) {
      for (const group of groups) {
        if (group.kind === 'replace') {
          this.recordGroup(group);
          continue;
        }
        if (group.data) {
          for (let offset = 0; offset < group.length; offset += 1) {
            this.recordProperties(group.before + offset, group.data);
          }
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
      mapPosition: (position: number, assoc: -1 | 1, caret?: boolean) =>
        this.mapPosition(recorded, position, assoc, caret === true),
    };
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
      this.propose &&
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
        after + depth + inner
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
   * merge, which records as a move of the right container's children.
   */
  private recordBoundaryRemoval(group: Extract<Group, { kind: 'replace' }>) {
    const { after, before, removed } = group;
    const { tokens } = this.index.slice(before, before + removed);
    const first = tokens[0];
    const last = tokens.at(-1);

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
            withMarks(leftProps, readAuthoredMarks(rightProps))
          ) ?? rightProps;

        if (jsonEqual(merged, leftProps)) {
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
    if (!this.propose || first.nodeKind !== 'element') return false;

    const right = this.index.nodeStartingAt(before + removed - 1);

    if (!right || isTextBlock(this.index.node(right.path))) return false;

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

    if (container?.kind !== 'element') return false;

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
          withMarks(open.props, [
            ...readAuthoredMarks(open.props),
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

    const sourceTo = source.before + source.removed;
    const copy = this.index.slice(source.before, sourceTo).tokens;
    const { plainToReview } = this.options;

    for (const group of groups) {
      if (group.kind === 'kept') {
        this.pieces.push({
          afterFrom: group.after,
          afterTo: group.after + group.length,
          beforeFrom: group.before,
          kind: 'kept',
        });
      } else if (group === source) {
        if (this.propose) {
          this.strike(
            source.before,
            sourceTo,
            this.contextAt(source.before),
            'move'
          );
        } else {
          this.ops.push({ from: source.before, kind: 'remove', to: sourceTo });
        }
        this.pushRemoved(source.after, source.before, sourceTo);
      } else {
        this.ops.push({
          at: landing.before,
          kind: 'insert',
          tokens: this.propose ? this.movedCopy(copy) : copy,
        });
        this.pieces.push({
          afterFrom: landing.after,
          afterTo: landing.after + landing.slice.length,
          at: landing.before,
          kind: 'inserted',
          offsets: Array.from(
            { length: landing.slice.length + 1 },
            (_, offset) =>
              plainToReview(source.plainFrom + offset, -1) - source.before
          ),
        });
      }
    }

    return true;
  }

  private movedCopy(tokens: readonly JsonToken[]) {
    const mark = this.options.markOf('insert');

    return tokens.map((token) =>
      token.kind === 'open'
        ? openToken(
            token.nodeKind,
            withMarks(token.props, [...withoutCuts(token.props), mark])
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
      // rightward; a caret at its end may sit past the closing tokens.
      leftward:
        this.options.selectionBefore === null ||
        this.options.selectionBefore > from,
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
    modifications: readonly PropertyModification[]
  ) {
    const previous = this.propsStartingAt(at);
    const next = applyPropertyModifications(
      previous,
      modifications.filter(
        (modification) => modification.key !== AUTHORED_MARKS_KEY
      )
    );
    const props = this.formattedProps(previous, next);

    if (props) this.ops.push({ at, kind: 'props', props });
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

    const marks = readAuthoredMarks(previous);

    if (this.propose && marks.some((mark) => mark.kind === 'delete')) {
      return null;
    }

    const { createTagId, intent, isOwn, markOf, source } = this.options;
    const { at, author, change } = markOf('insert');
    const ownInsertion = marks.some(
      (mark) => mark.kind === 'insert' && isOwn(mark)
    );
    let tags = marks.filter(
      (mark): mark is FormatTag => mark.kind === 'format'
    );

    for (const key of keys) {
      const written = writeLayer({
        intent,
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
          id: createTagId(),
          key,
          kind: 'format',
        }),
        tags: tags.filter((tag) => tag.key === key),
      });

      tags = [...tags.filter((tag) => tag.key !== key), ...written];
    }

    return withMarks(next, [
      ...marks.filter((mark) => mark.kind !== 'format'),
      ...tags,
    ]);
  }

  private recordReplacement(
    from: number,
    to: number,
    inserted: PreparedTokenSlice,
    after: number
  ) {
    const startContext = this.contextAt(from);
    const landing = this.options.moveRole === 'landing';

    if (!this.propose) {
      if (to > from) this.ops.push({ from, kind: 'remove', to });
      this.recordInsertion({
        after,
        at: to,
        contexts: startContext,
        inserted,
        landing,
        openLeaf: leafOf(startContext),
        removedFrom: from,
      });
      return;
    }

    const struck = this.strike(
      from,
      to,
      startContext,
      this.options.moveRole === 'source' ? 'move' : 'delete'
    );

    this.recordInsertion({
      after,
      at: to,
      contexts: struck.contexts,
      inserted,
      landing,
      openLeaf: struck.openLeaf,
      reopen: struck.reopen,
      removedFrom: from,
    });
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
    mode: StrikeMode
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
          (mode === 'delete' || mark.change === changeId)
      );
    const withdrawn = (marks: readonly AuthoredMark[]) =>
      mode === 'delete' &&
      marks.some((mark) => mark.kind === 'insert' && isOwn(mark));
    // A node is removed outright only when everything inside it is withdrawn too,
    // so another author's pending content inside it stays to be decided.
    const withdrawnThroughout = (open: number, close: number) => {
      for (let inner = open; inner < close; inner += 1) {
        const token = local[inner];

        if (token.kind !== 'open') continue;

        const marks = readAuthoredMarks(
          this.propsStartingAt(from + localOffsets[inner])
        );
        // An empty unmarked text, such as an inline element's spacer, holds
        // nothing to keep.
        const spacer =
          inner > open &&
          token.nodeKind === 'text' &&
          local[inner + 1]?.kind === 'close' &&
          marks.length === 0;

        if (!spacer && !withdrawn(marks)) return false;
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
    // A struck element whose every child is withdrawn keeps its default
    // child, so every element holds a child.
    const emptiedKeptElementAt = new Map<
      number,
      Readonly<{ at: number; marks: readonly AuthoredMark[]; props: Props }>
    >();
    const survivingIndexBefore = (index: number) => {
      let back = index - 1;

      for (
        let open = removedOpenByClose.get(back);
        open !== undefined;
        open = removedOpenByClose.get(back)
      ) {
        back = open - 1;
      }

      return back;
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

        const marks = readAuthoredMarks(leaf.props);

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
          const struckProps = withMarks(leaf.props, [
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
        const marks = readAuthoredMarks(props);
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
          const strikeOpIndex = struck(marks) ? null : this.ops.length;

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
              props: withMarks(props, [...marks, markOf('delete')]),
            });
          }
          if (token.nodeKind === 'text') {
            index = close;
          } else {
            stack.push(context);
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

          const struckProps = withMarks(props, [
            ...marks,
            strikeMark(context, context.contentFrom),
          ]);

          this.ops.push({ at: position, kind: 'props', props: struckProps });
          openLeaf = struckProps;
          reopen = props;
          continue;
        }

        const previousIndex = survivingIndexBefore(index);
        const previous = local[previousIndex];
        const withdrawsOwnBoundary =
          mode === 'delete' &&
          previous?.kind === 'close' &&
          marks.some(
            (mark) =>
              (mark.kind === 'split' || mark.kind === 'wrap') && isOwn(mark)
          );

        if (withdrawsOwnBoundary) {
          const previousAt = from + localOffsets[previousIndex];
          const mergeTarget = wholeElementByClose.get(previousIndex);

          this.ops.push({
            from: previousAt,
            kind: 'remove',
            to: previousAt + 1,
          });
          this.ops.push({ from: position, kind: 'remove', to: position + 1 });
          emptiedKeptElementAt.delete(previousIndex);
          if (mergeTarget) {
            const targetMarks = readAuthoredMarks(mergeTarget.props);
            const withoutOwnDelete = targetMarks.filter(
              (mark) => !(mark.kind === 'delete' && mark.change === changeId)
            );
            const boundaryInsteadOfStrike: Op = {
              at: from + localOffsets[mergeTarget.open],
              kind: 'props',
              props: withMarks(mergeTarget.props, [
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

        this.ops.push({
          at: position,
          kind: 'props',
          props: withMarks(props, [...marks, boundaryMark(previous)]),
        });
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
            ...readAuthoredMarks(closed.props).filter(
              (mark) => mark.kind === 'insert' || mark.kind === 'delete'
            ),
            ...(whole && whole.strikeOpIndex !== null
              ? [markOf('delete')]
              : []),
          ],
          props: closed.props,
        });
      }
      if (token.nodeKind === 'text') {
        openLeaf = null;
        reopen = null;
        if (closed && firstSplitLeaf === closed) firstSplitLeaf = null;
      }
    }
    // The resolver keeps an element while anything inside it survives, so the
    // default child carries the element's insertions and deletions, which
    // decide it with the element.
    for (const { at, marks, props } of emptiedKeptElementAt.values()) {
      const child = this.options.defaultChild(props);

      if (!child) continue;
      this.ops.push({
        at,
        kind: 'insert',
        tokens: encodeNodes([withMarksThroughout(child, marks)]).slice.tokens,
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
      contexts: readonly Context[];
      inserted: PreparedTokenSlice;
      landing: boolean;
      openLeaf: Props | null;
      removedFrom: number;
      reopen?: Props | null;
    }>
  ) {
    const { at, inserted, landing } = input;
    const { propose } = this;
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

        const own = readAuthoredMarks(context.props).find(
          (mark) => mark.kind === 'insert' && this.options.isOwn(mark)
        );

        if (own) {
          const { type } = context.props;

          return {
            mark: own,
            oneText: typeof type === 'string' && this.options.oneText(type),
          };
        }
      }

      return null;
    };
    const landed = (props: Props) => {
      const marks = withoutCuts(props);

      return propose
        ? withMarks(props, [...marks, this.options.markOf('insert')])
        : withMarks(props, marks);
    };
    let trailingLeafProps: Props | null = input.reopen ?? leafOf(stack);
    let closedElement = false;
    // A split closes elements innermost first and its continuations reopen
    // them outermost first, so each continuation pops the element it continues.
    const splitFrom: Context[] = [];

    for (let index = 0; index < local.length; index += 1) {
      const token = local[index];

      if (token.kind === 'text') {
        const leaf = stack.at(-1);
        const leafProps =
          leaf && leaf.kind === 'text' ? leaf.props : ({} as Props);
        const desired = landing
          ? landed(leafProps)
          : propose
            ? this.suggestedTextProps(leaf, at, ownElement())
            : this.editedTextProps(leaf, leafProps, at);

        ensureLeaf(desired);
        for (let offset = 0; offset < token.text.length; offset += 1) {
          outputTextOffsets.push(outLength + offset);
        }
        emit(textToken(token.text));
        continue;
      }

      const close = token.kind === 'open' ? closeOf.get(index) : undefined;

      if (token.kind === 'open' && close !== undefined) {
        closeLeaf();
        const subtree = local.slice(index, close + 1);
        const own = landing || !propose ? null : ownElement();
        const added = landing
          ? null
          : !propose
            ? []
            : own
              ? [own.mark]
              : [
                  ...this.containedInsertMarks(stack, at),
                  this.adjacentOwnInsert(stack, at) ??
                    this.options.markOf('insert'),
                ];

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
                    : withMarks(item.props, [
                        ...readAuthoredMarks(item.props),
                        ...added,
                      ])
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
        closeLeaf();
        outputTextOffsets.push(outLength);
        stack.push({
          contentFrom: at,
          contentTo: at,
          kind: token.nodeKind,
          path: [],
          props: token.props,
        });
        if (token.nodeKind === 'text') {
          trailingLeafProps = this.continuedLeafProps(baseLeaf, token.props);
          continue;
        }
        // The element a split continues keeps the pending insertion or
        // deletion of the element it splits, whose existence it shares, and
        // the pending writes of each property the split keeps.
        const continued = closedElement ? splitFrom.pop() : undefined;
        const shared = continued
          ? readAuthoredMarks(continued.props).filter(
              (mark) =>
                mark.kind === 'insert' ||
                mark.kind === 'delete' ||
                (mark.kind === 'format' &&
                  this.options.keepsOnSplit(
                    continued.props,
                    continued.path,
                    mark.key,
                    this.index.value
                  ))
            )
          : [];
        const suggested = propose && !ownElement();
        const rightCuts = this.splitInline(continued, token.props, suggested);

        emit(
          openToken(
            'element',
            withMarks(token.props, [
              ...readAuthoredMarks(token.props),
              ...shared,
              ...(rightCuts ?? []),
              ...(suggested && !rightCuts
                ? [this.options.markOf(closedElement ? 'split' : 'wrap')]
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
      closeLeaf();
      outputTextOffsets.push(outLength);
      emit(token);
      const closed = stack.pop();

      if (closed) splitFrom.push(closed);
      closedElement = true;
    }

    outputTextOffsets.push(outLength);
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
    suggested: boolean
  ): AuthoredMark[] | null {
    if (
      !continued ||
      continued.path.length === 0 ||
      !this.options.isInline(continued.props)
    ) {
      return null;
    }

    const marks = readAuthoredMarks(continued.props);
    const moved = marks.filter((mark) => isCut(mark) && mark.side === 'end');

    if (!suggested && moved.length === 0) return null;

    const { at, author, change } = this.options.markOf('split');
    const cut = suggested
      ? {
          at,
          author,
          change,
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
      props: withMarks(continued.props, [
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
      this.formattedProps(base, withMarks(next, readAuthoredMarks(base))) ??
      base
    );
  }

  /**
   * Editing text inside struck text splits the deletion, and text at an
   * insertion's edge stays out of it; text inside an insertion joins it.
   */
  private editedTextProps(
    leaf: Context | undefined,
    props: Props,
    at: number
  ): Props {
    const marks = readAuthoredMarks(props);
    const atEdge =
      leaf?.kind === 'text' &&
      (at === leaf.contentFrom || at === leaf.contentTo);
    const kept = marks.filter((mark) => {
      if (mark.kind === 'delete' || mark.kind === 'format') return false;
      if (mark.kind !== 'insert' || !atEdge || !leaf) return true;

      return this.sharedNeighborInserts(leaf, at).includes(mark);
    });

    return kept.length === marks.length ? props : withMarks(props, kept);
  }

  private suggestedTextProps(
    leaf: Context | undefined,
    at: number,
    ownElement: Readonly<{ mark: AuthoredMark; oneText: boolean }> | null
  ): Props {
    if (!leaf || leaf.kind !== 'text') {
      return withMarks({}, [ownElement?.mark ?? this.options.markOf('insert')]);
    }

    const marks = readAuthoredMarks(leaf.props);
    const own = marks.find(
      (mark) => mark.kind === 'insert' && this.options.isOwn(mark)
    );
    const struck = marks.some((mark) => mark.kind === 'delete');

    if (own && !struck) return leaf.props;
    if (ownElement) {
      // Text in one's own pending element carries that element's insert mark,
      // so a late edit is reviewable; a one-text element cannot split.
      const live = marks.filter(
        (mark) => mark.kind !== 'delete' && mark.kind !== 'format'
      );

      return ownElement.oneText
        ? withMarks(leaf.props, live)
        : withMarks(leaf.props, [...live, ownElement.mark]);
    }

    const inside = leaf.contentFrom < at && at < leaf.contentTo;
    const kept = inside
      ? marks.filter((mark) => mark.kind === 'insert')
      : this.sharedNeighborInserts(leaf, at);

    return withMarks(leaf.props, [
      ...kept,
      this.adjacentOwnInsert([leaf], at) ?? this.options.markOf('insert'),
    ]);
  }

  /** Insert marks an edge insertion keeps: only those on both sides of it. */
  private sharedNeighborInserts(leaf: Context, at: number) {
    const neighbor = this.neighborLeaf(leaf, at === leaf.contentFrom ? -1 : 1);
    const mine = readAuthoredMarks(leaf.props).filter(
      (mark) => mark.kind === 'insert'
    );

    if (!neighbor) return [];

    const theirs = readAuthoredMarks(neighbor);

    return mine.filter((mark) =>
      theirs.some((other) => jsonEqual(other, mark))
    );
  }

  /** One's own pending insertion at either edge of an insertion is amended. */
  private adjacentOwnInsert(stack: readonly Context[], at: number) {
    const leaf = stack.at(-1);
    const candidates: Props[] = [];

    if (leaf?.kind === 'text') {
      if (at === leaf.contentFrom || at === leaf.contentTo) {
        candidates.push(leaf.props);
        const neighbor = this.neighborLeaf(
          leaf,
          at === leaf.contentFrom ? -1 : 1
        );

        if (neighbor) candidates.push(neighbor);
      }
    } else {
      const before = this.index.pointAt(at, -1);
      const afterPoint = this.index.pointAt(at, 1);

      for (const point of [before, afterPoint]) {
        if (point) candidates.push(propsOf(this.index.node(point.path)));
      }
    }

    for (const props of candidates) {
      const marks = readAuthoredMarks(props);

      if (marks.some((mark) => mark.kind === 'delete')) continue;

      const own = marks.find(
        (mark) => mark.kind === 'insert' && this.options.isOwn(mark)
      );

      if (own) return own;
    }

    return null;
  }

  private containedInsertMarks(stack: readonly Context[], at: number) {
    const leaf = stack.at(-1);

    if (!leaf || leaf.kind !== 'text') return [];
    if (!(leaf.contentFrom < at && at < leaf.contentTo)) return [];

    return readAuthoredMarks(leaf.props).filter(
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
        ? readAuthoredMarks(props).find(
            (mark) => mark.kind === 'delete' && this.options.isOwn(mark)
          )
        : undefined;

      if (own) return own;
    }

    return null;
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
      if (piece.kind === 'removed' && piece.after === position) removed = piece;
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

      return (
        recorded.mapPos(
          right ? removed.beforeTo : removed.beforeFrom,
          right ? 1 : -1
        ) ?? position
      );
    }

    return position;
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
