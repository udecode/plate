import type { DecorationSlice } from './decoration-source';

/** An exact replacement in the observed text's UTF-16 before coordinates. */
export type ExternalTextChange = Readonly<{
  from: number;
  insert: string;
  to: number;
}>;

/** Directed UTF-16 offsets within one canonical Text. */
export type ExternalTextSelection = Readonly<{
  anchor: number;
  focus: number;
}>;

/** Only the focused view may install a native selection. */
export type ExternalTextSelectionState = ExternalTextSelection &
  Readonly<{ mode: 'model' | 'native' }>;

/** A keyed editor decoration clipped to this Text's offsets. */
export type ExternalTextDecoration = DecorationSlice;

/** Canonical state delivered to one mounted external text view. */
export type ExternalTextState<TConfig = undefined> = Readonly<{
  config: TConfig;
  decorations: readonly ExternalTextDecoration[];
  readOnly: boolean;
  selection: ExternalTextSelectionState | null;
  /** The canonical string reference; retain it without diffing whole strings. */
  text: string;
  /** Echo this observed version in actions; unrelated commits need no update. */
  version: number;
}>;

/** Rejected actions never change the canonical document and may reset the view before returning. */
export type ExternalTextDispatchResult = Readonly<{
  status: 'applied' | 'read-only' | 'stale';
}>;

/** The only mutation bridge from an external view to its owning editor runtime.
 * Actions may synchronously deliver view updates before they return. Invoke them
 * from input and command handlers, never from adapter lifecycle callbacks.
 */
export type ExternalTextActions = Readonly<{
  composition: (phase: 'end' | 'start') => void;
  deleteOut: (input: {
    baseVersion: number;
    direction: 'backward' | 'forward';
  }) => ExternalTextDispatchResult;
  dispatch: (input: {
    baseVersion: number;
    changes: readonly ExternalTextChange[];
    intent: 'composition' | 'cut' | 'drop' | 'input' | 'paste';
    selection: ExternalTextSelection;
  }) => ExternalTextDispatchResult;
  /** Delegate to installed editor history; adapters must disable local history. */
  history: (direction: 'redo' | 'undo') => boolean;
  navigateOut: (input: {
    baseVersion: number;
    direction: 'backward' | 'forward';
    extend?: boolean;
    x?: number;
  }) => ExternalTextDispatchResult;
  select: (input: {
    baseVersion: number;
    selection: ExternalTextSelection;
  }) => ExternalTextDispatchResult;
}>;

/** Adapter-owned DOM and local resources for one mounted host. */
export type ExternalTextView<TConfig = undefined> = Readonly<{
  destroy: () => void;
  focus: (options?: { edge?: 'end' | 'start'; x?: number }) => void;
  /** Apply patches and canonical state before returning without dispatching an action. */
  update: (input: {
    /** `null` resets from state.text; a list applies exact patches; [] acknowledges. */
    changes: readonly ExternalTextChange[] | null;
    state: ExternalTextState<TConfig>;
  }) => void;
}>;

/** Render one exact-one-Text block without a second model or history owner.
 * Lifecycle callbacks are synchronous notifications and must not mutate the
 * owning editor or reenter the mounted view.
 */
export type ExternalTextAdapter<TConfig = undefined> = Readonly<{
  mount: (context: {
    actions: ExternalTextActions;
    host: HTMLElement;
    state: ExternalTextState<TConfig>;
  }) => ExternalTextView<TConfig>;
}>;

/** Mount options inferred from the adapter; changing config does not remount it. */
export type ExternalTextOptions<TConfig = undefined> = Readonly<{
  adapter: ExternalTextAdapter<TConfig>;
  ariaLabel: string;
}> &
  (undefined extends TConfig
    ? Readonly<{ config?: TConfig }>
    : Readonly<{ config: TConfig }>);
