import type {
  Anchor,
  Ancestor,
  Editor,
  Node,
  Point,
  Range,
  RootKey,
  NodeKey,
  Text,
} from '@platejs/plite';

import type { TextDiff } from './diff-text';
import type { Key } from './key';

type AnyExtensionEditor = Editor<any, any>;

export type Action = { at?: Point | Range; run: () => void };

/**
 * Two weak maps that allow us rebuild a path given a node. They are populated
 * at render time such that after a render occurs we can always backtrack.
 */
export const IS_NODE_MAP_DIRTY: WeakMap<AnyExtensionEditor, boolean> =
  new WeakMap();
export const NODE_TO_INDEX: WeakMap<Node, number> = new WeakMap();
export const NODE_TO_PARENT: WeakMap<Node, Ancestor> = new WeakMap();
export const NODE_TO_RUNTIME_ID: WeakMap<Node, NodeKey> = new WeakMap();

/**
 * Weak maps that allow us to go between Plite nodes and DOM nodes. These
 * are used to resolve DOM event-related logic into Plite actions.
 */
export const EDITOR_TO_WINDOW: WeakMap<AnyExtensionEditor, Window> =
  new WeakMap();
export const EDITOR_TO_ELEMENT: WeakMap<AnyExtensionEditor, HTMLElement> =
  new WeakMap();
export const EDITOR_TO_DOM_ROOT: WeakMap<AnyExtensionEditor, HTMLElement> =
  new WeakMap();
export const EDITOR_TO_DOM_EDITABLE: WeakMap<
  AnyExtensionEditor,
  Map<RootKey, HTMLElement>
> = new WeakMap();
export const EDITOR_TO_DOM_SCROLL: WeakMap<AnyExtensionEditor, HTMLElement> =
  new WeakMap();
export const EDITOR_TO_DOM_SCOPE_LISTENERS: WeakMap<
  AnyExtensionEditor,
  Set<() => void>
> = new WeakMap();
export const EDITOR_TO_PLACEHOLDER: WeakMap<AnyExtensionEditor, string> =
  new WeakMap();
export const EDITOR_TO_PLACEHOLDER_ELEMENT: WeakMap<
  AnyExtensionEditor,
  HTMLElement
> = new WeakMap();
export const ELEMENT_TO_NODE: WeakMap<HTMLElement, Node> = new WeakMap();
export const NODE_TO_ELEMENT: WeakMap<Node, HTMLElement> = new WeakMap();
export const NODE_TO_KEY: WeakMap<Node, Key> = new WeakMap();
export const EDITOR_TO_RUNTIME_ID_TO_KEY: WeakMap<
  AnyExtensionEditor,
  Map<NodeKey, Key>
> = new WeakMap();
export const EDITOR_TO_KEY_TO_ELEMENT: WeakMap<
  AnyExtensionEditor,
  WeakMap<Key, HTMLElement>
> = new WeakMap();

/**
 * Weak maps for storing editor-related state.
 */

export const IS_READ_ONLY: WeakMap<AnyExtensionEditor, boolean> = new WeakMap();
export const IS_FOCUSED: WeakMap<AnyExtensionEditor, boolean> = new WeakMap();
export const IS_COMPOSING: WeakMap<AnyExtensionEditor, boolean> = new WeakMap();

export const EDITOR_TO_USER_SELECTION: WeakMap<
  AnyExtensionEditor,
  Anchor<Range> | null
> = new WeakMap();

/**
 * Weak maps for saving pending state on composition stage.
 */

export const EDITOR_TO_SCHEDULE_FLUSH: WeakMap<AnyExtensionEditor, () => void> =
  new WeakMap();

export const EDITOR_TO_PENDING_INSERTION_MARKS: WeakMap<
  AnyExtensionEditor,
  Partial<Text> | null
> = new WeakMap();

export const EDITOR_TO_USER_MARKS: WeakMap<
  AnyExtensionEditor,
  Partial<Text> | null
> = new WeakMap();

/**
 * Android input handling specific weak-maps
 */

export const EDITOR_TO_PENDING_DIFFS: WeakMap<AnyExtensionEditor, TextDiff[]> =
  new WeakMap();

export const EDITOR_TO_ROOT_VIEW_EDITORS: WeakMap<
  object,
  Set<AnyExtensionEditor>
> = new WeakMap();

export const EDITOR_TO_PENDING_ACTION: WeakMap<
  AnyExtensionEditor,
  Action | null
> = new WeakMap();

export const EDITOR_TO_PENDING_SELECTION: WeakMap<
  AnyExtensionEditor,
  Range | null
> = new WeakMap();

export const EDITOR_TO_FORCE_RENDER: WeakMap<AnyExtensionEditor, () => void> =
  new WeakMap();

/**
 * Symbols.
 */

export const PLACEHOLDER_SYMBOL = Symbol('placeholder') as unknown as string;
export const MARK_PLACEHOLDER_SYMBOL = Symbol(
  'mark-placeholder'
) as unknown as string;
