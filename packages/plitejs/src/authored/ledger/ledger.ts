import { createInternalDocumentChange } from '../../core/change/document-change';
import {
  type DocumentIndex,
  type NodeList,
  rootIndexOf,
} from '../../core/change/document-index';
import { setLazyRoot } from '../../core/change/lazy-root';
import type { JsonEditorValue } from '../../core/change/tokens';
import type {
  CommandProjection,
  CommandProjectionMap,
} from '../../core/command-document';
import { countFrameWork } from '../../core/frame-work';
import {
  deriveValue,
  getRecordSetVersion,
  getValueRecords,
} from '../../core/record-store';
import type {
  AnyEditor as Editor,
  EditorDocumentValue,
} from '../../interfaces/editor';
import { getDefined } from '../../internal/get-defined';
import type { createDocumentMarksValidator } from '../facts/admission';
import { factsOf, primeInsertions } from '../facts/facts';
import { VERDICTS } from '../facts/records';
import { isAuthoredSetValued } from '../tree/marks';
import type { AuthoredResolveSchema } from '../tree/resolve';
import { RootProjection } from './projection';
import type { ReviewMode, RunContext } from './runs';

type MarksValidator = ReturnType<typeof createDocumentMarksValidator>;
type Roots = ReadonlyMap<string, DocumentIndex>;

const contentRootsOf = (value: JsonEditorValue): Roots =>
  new Map([
    ['main', rootIndexOf(value, 'children')],
    ...Object.keys(value.roots ?? {}).map(
      (root) =>
        [
          root,
          rootIndexOf(
            value.roots as Readonly<Record<string, readonly never[]>>,
            root
          ),
        ] as const
    ),
  ]);

const UNSET = {};

/** One review mode of every content root, kept in step with one stored value. */
class ModeProjection {
  private readonly roots = new Map<string, RootProjection>();
  // The verdict set's version and the schema the runs read; unset until the
  // first sync.
  private epoch: unknown = UNSET;
  private schema: unknown = UNSET;

  constructor(readonly mode: ReviewMode) {}

  sync(value: JsonEditorValue, schema: AuthoredResolveSchema | null) {
    const facts = factsOf(value);
    const epoch = getRecordSetVersion(getValueRecords(value), VERDICTS);
    const contextOf = (root: string): RunContext => ({
      facts,
      isSetValued: isAuthoredSetValued,
      mode: this.mode,
      root,
      schema,
    });
    const content = contentRootsOf(value);
    // A verdict can settle claims a block's own marks still show, and the
    // schema decides completion, so either one changing re-derives each root.
    const forget = epoch !== this.epoch || schema !== this.schema;

    this.epoch = epoch;
    this.schema = schema;
    for (const root of this.roots.keys()) {
      if (!content.has(root)) this.roots.delete(root);
    }
    for (const [root, index] of content) {
      const projection = this.roots.get(root);

      if (!projection) {
        this.roots.set(
          root,
          new RootProjection(this.mode, index, contextOf(root))
        );
      } else if (forget) {
        projection.sync(index, contextOf(root));
        projection.forgetRuns(contextOf(root));
      } else {
        projection.sync(index, contextOf(root));
      }
    }

    return this.roots;
  }
}

const projectedValueOf = (
  stored: JsonEditorValue,
  roots: ReadonlyMap<string, RootProjection>
) => {
  const value = deriveValue(stored, {}) as Record<string, unknown>;
  const named: Record<string, unknown> = { ...stored.roots };
  let renamed = false;

  for (const [root, projection] of roots) {
    if (!projection.changed) continue;
    if (root === 'main') {
      setLazyRoot(value, 'children', projection.index);
    } else {
      named[root] = projection.index.value;
      renamed = true;
    }
  }
  if (renamed) value.roots = Object.freeze(named);

  return Object.freeze(value) as JsonEditorValue;
};

const mapOf = (
  roots: ReadonlyMap<string, RootProjection>
): CommandProjectionMap => {
  const changed = [...roots].filter(([, projection]) => projection.changed);
  const byRoot = new Map(changed);
  let composed: ReturnType<typeof createInternalDocumentChange> | null = null;

  return Object.freeze({
    added: (root: string, position: number) =>
      byRoot.get(root)?.added(position) ?? null,
    change: () => {
      countFrameWork('projectionChanges');
      composed ??= createInternalDocumentChange(
        new Map(
          changed.map(([root, projection]) => [
            root,
            projection.composedChange(),
          ])
        )
      );

      return composed;
    },
    hides: (root: string, position: number) =>
      byRoot.get(root)?.hides(position) ?? false,
    roots: Object.freeze(changed.map(([root]) => root)),
    toProjected: (root: string, position: number, association) =>
      byRoot.get(root)?.toProjected(
        position,
        association === 'forward' ? 1 : -1
      ) ?? position,
    toStored: (root: string, position: number, assoc: -1 | 1) =>
      byRoot.get(root)?.toStored(position, assoc) ?? position,
  });
};

/**
 * Everything review derives from one owner editor's stored document: the
 * projections commands and previews read, kept in step with the stored value
 * each reader asks about, so a key costs what its edit changed.
 *
 * @internal
 */
export class ReviewLedger {
  private readonly checked = new Map<string, DocumentIndex>();
  private readonly modes = new Map<ReviewMode, ModeProjection>();
  // The proposed projection's maps read its live state, so a frame holds
  // only while that projection stays at the frame's value.
  private lastFrame: Readonly<{
    frame: CommandProjection | null;
    stored: JsonEditorValue;
  }> | null = null;

  constructor(
    private readonly schemaOf: () => AuthoredResolveSchema | null,
    private readonly marks: MarksValidator
  ) {}

  /**
   * Validate the marks of the blocks `value` changed since the last value
   * this checked, every block the first time.
   */
  check(value: JsonEditorValue) {
    const roots = contentRootsOf(value);
    const changed: NodeList<unknown>[] = [];

    for (const root of this.checked.keys()) {
      if (!roots.has(root)) this.checked.delete(root);
    }
    for (const [root, index] of roots) {
      const last = this.checked.get(root);

      if (last === index) continue;
      changed.push(last ? changedBlocks(last, index) : index.nodes);
      this.checked.set(root, index);
    }
    if (changed.length > 0) {
      this.marks.validateIn(value as EditorDocumentValue, changed);
    }
  }

  /** Build what keys read, so the first key derives only its own edit. */
  prepare(value: JsonEditorValue) {
    this.check(value);
    primeInsertions(value);
    this.frame(value);
  }

  /** The roots of `stored` as `mode` shows them. */
  project(stored: JsonEditorValue, mode: ReviewMode) {
    let projection = this.modes.get(mode);

    if (!projection) {
      projection = new ModeProjection(mode);
      this.modes.set(mode, projection);
    }
    if (mode === 'proposed' && this.lastFrame?.stored !== stored) {
      this.lastFrame = null;
    }

    return projection.sync(stored, this.schemaOf());
  }

  /** The document commands decide on, with every pending change accepted. */
  frame(stored: JsonEditorValue): CommandProjection | null {
    if (this.lastFrame?.stored === stored) return this.lastFrame.frame;

    const roots = this.project(stored, 'proposed');
    const changed = [...roots].filter(([, projection]) => projection.changed);
    const step = roots.get('main')?.lastStep;
    const frame: CommandProjection | null =
      changed.length === 0
        ? null
        : {
            ...(step
              ? { carried: { change: step.change, from: step.from } }
              : {}),
            indexes: new Map(
              changed.map(([root, projection]) => [root, projection.index])
            ),
            map: mapOf(roots),
            value: projectedValueOf(stored, roots) as EditorDocumentValue,
          };

    this.lastFrame = { frame, stored };

    return frame;
  }
}

// The blocks of `after` that differ from `before`'s, each at its index.
const changedBlocks = (
  before: DocumentIndex,
  after: DocumentIndex
): NodeList<unknown> => {
  const ranges = before.changedChildren(after);

  return {
    at: (index) => after.child(index),
    forEach: (visit) => {
      for (const [, , from, to] of ranges) {
        for (let index = from; index < to; index += 1) {
          visit(getDefined(after.child(index)), index);
        }
      }
    },
    length: after.size,
    slice: () => [],
  };
};

const LEDGERS = new WeakMap<object, ReviewLedger>();

/** @internal */
export const createReviewLedger = (
  owner: Editor,
  schemaOf: () => AuthoredResolveSchema | null,
  marks: MarksValidator
) => {
  const ledger = new ReviewLedger(schemaOf, marks);

  LEDGERS.set(owner, ledger);

  return ledger;
};

/** @internal */
export const getReviewLedger = (owner: Editor) => LEDGERS.get(owner) ?? null;
