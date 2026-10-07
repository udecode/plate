import type { AnyEditor, NodeKey } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import type { Descendant, NodeEntry } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import type { NodeSelection } from '../interfaces/selection';

/** A position beside one block, addressed by its key. */
export type TransferEdge = Readonly<{
  edge: 'after' | 'before';
  key: NodeKey;
}>;

/**
 * The inline start or end side of a block, where a dropped block lands beside
 * it. A `transfer.side` read decides what the landing builds; without one the
 * transfer refuses.
 */
export type TransferSide = Readonly<{
  key: NodeKey;
  side: 'end' | 'start';
}>;

/** A resolved landing: beside a block, at its side, or at a text point. */
export type TransferLandingTarget =
  | TransferEdge
  | TransferSide
  | Readonly<{ point: Point }>;

/**
 * Where a transfer lands. `previous` and `next` step the payload past the
 * nearest sibling edge the landing policy admits, and keep the selection.
 */
export type TransferTarget = TransferLandingTarget | 'next' | 'previous';

export type TransferInput = Readonly<{
  /** Screen-reader text the commit carries when the transfer lands. */
  announce?: string;
  /** Source view. Defaults to the editor that runs the transfer. */
  from?: AnyEditor;
  /**
   * Block payload in `from`, addressed by key. Defaults to the selected
   * blocks, or the blocks containing the selection.
   */
  nodes?: readonly NodeKey[];
  /** Text payload in `from`, instead of `nodes`. */
  range?: Range;
  to: TransferTarget;
}>;

/**
 * How the source and target documents relate. `document` is one document
 * across its views and roots; `identity` is one runtime seen through a
 * different document override, projection or authoring intent;
 * `independent` is another editor.
 */
export type TransferRelation = 'document' | 'identity' | 'independent';

export type TransferIntent = 'copy' | 'move';

export type TransferPayload =
  | Readonly<{
      kind: 'nodes';
      nodes: readonly Descendant[];
      /** Parent keys in the source; comparable to target keys only within one document. */
      parentKeys: ReadonlyArray<NodeKey | null>;
    }>
  | Readonly<{ kind: 'text' }>
  | Readonly<{ kind: 'files'; types: readonly string[] }>;

export type TransferLandingInput = Readonly<{
  edge: 'after' | 'before';
  /** Source view. */
  from: AnyEditor;
  intent: TransferIntent;
  payload: TransferPayload;
  relation: TransferRelation;
  target: NodeEntry<Element>;
}>;

/**
 * What a side landing builds: `shell`, an element with empty slots, and the
 * slot at `payload`, a path inside it, for the dropped blocks. With `target`,
 * the shell takes the target's place and the target moves into the slot at
 * `target`. Otherwise the shell lands at `edge` of the target's ancestor
 * `ancestor` levels up, 0 being the target itself.
 */
export type TransferWrap =
  | Readonly<{ payload: Path; shell: Element; target: Path }>
  | Readonly<{
      ancestor: number;
      edge: 'after' | 'before';
      payload: Path;
      shell: Element;
    }>;

export type TransferSideInput = Readonly<{
  /** Source view. */
  from: AnyEditor;
  intent: TransferIntent;
  payload: TransferPayload;
  relation: TransferRelation;
  side: 'end' | 'start';
  target: NodeEntry<Element>;
}>;

/**
 * A veto's input. For a side landing, `edge` and `target` place the shell and
 * `wrap` is set: the payload lands inside the shell, deeper than the edge, and
 * a wrap that takes the target's place also runs every veto with the target as
 * the payload.
 */
export type TransferVetoInput = TransferLandingInput &
  Readonly<{ wrap?: TransferWrap }>;

/**
 * A veto refuses a landing on the final edge in `view`, the target view;
 * every contributed veto runs.
 */
export type TransferVeto = (
  input: TransferVetoInput,
  view: AnyEditor
) => boolean;

export type TransferSourceInput = Readonly<{ selection: NodeSelection }>;

export type TransferDiagnostic = Readonly<{
  impact: 'lossless' | 'lossy';
  message: string;
}>;

export type TransferRefusalReason =
  | 'inside-source'
  | 'lossy'
  | 'no-op'
  | 'policy'
  | 'read-only-target'
  | 'schema'
  | 'source-missing';

export type TransferOutcome =
  | Readonly<{ at: NodeSelection | Range; status: 'moved' }>
  | Readonly<{
      at: NodeSelection | Range;
      diagnostics: readonly TransferDiagnostic[];
      reason: 'identity' | 'independent' | 'intent' | 'read-only-source';
      status: 'copied';
    }>
  | Readonly<{ reason: TransferRefusalReason; status: 'refused' }>;

/** A transfer's admission without building it, for hover feedback. */
export type TransferCheck =
  | Readonly<{ admitted: true; to: TransferLandingTarget }>
  | Readonly<{ admitted: false; reason: TransferRefusalReason }>;
