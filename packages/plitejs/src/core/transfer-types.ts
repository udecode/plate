import type { AnyEditor, NodeKey } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import type { Descendant, NodeEntry } from '../interfaces/node';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import type { NodeSelection } from '../interfaces/selection';

/** A position beside one block, addressed by its key. */
export type TransferEdge = Readonly<{
  edge: 'after' | 'before';
  key: NodeKey;
}>;

/** A resolved landing: beside a block or at a text point. */
export type TransferLandingTarget = TransferEdge | Readonly<{ point: Point }>;

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
 * A veto refuses a landing on the final edge in `view`, the target view;
 * every contributed veto runs.
 */
export type TransferVeto = (
  input: TransferLandingInput,
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
