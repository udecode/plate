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
} from '../..';
import type { TextDiff } from './diff-text';
import type { Key } from './key';

type AnyPluginEditor = Editor<any, any>;

export type Action = { at?: Point | Range; run: () => void };

/**
 * Two weak maps that allow us rebuild a path given a node. They are populated
 * at render time such that after a render occurs we can always backtrack.
 */
export const IS_NODE_MAP_DIRTY = new WeakMap<AnyPluginEditor, boolean>();
export const NODE_TO_INDEX = new WeakMap<Node, number>();
export const NODE_TO_PARENT = new WeakMap<Node, Ancestor>();
export const NODE_TO_RUNTIME_ID = new WeakMap<Node, NodeKey>();

/**
 * Weak maps that allow us to go between Plite nodes and DOM nodes. These
 * are used to resolve DOM event-related logic into Plite actions.
 */
export const EDITOR_TO_WINDOW = new WeakMap<AnyPluginEditor, Window>();
export const EDITOR_TO_ELEMENT = new WeakMap<AnyPluginEditor, HTMLElement>();
export const EDITOR_TO_DOM_ROOT = new WeakMap<AnyPluginEditor, HTMLElement>();
export const EDITOR_TO_DOM_EDITABLE = new WeakMap<
  AnyPluginEditor,
  Map<RootKey, HTMLElement>
>();
export const EDITOR_TO_DOM_SCROLL = new WeakMap<object, HTMLElement>();
export const EDITOR_TO_DOM_SCOPE_LISTENERS = new WeakMap<
  object,
  Set<() => void>
>();
export const EDITOR_TO_PLACEHOLDER = new WeakMap<AnyPluginEditor, string>();
export const EDITOR_TO_PLACEHOLDER_ELEMENT = new WeakMap<
  AnyPluginEditor,
  HTMLElement
>();
export const ELEMENT_TO_NODE = new WeakMap<HTMLElement, Node>();
export const ELEMENT_TO_EDITOR = new WeakMap<HTMLElement, AnyPluginEditor>();
export const NODE_TO_ELEMENT = new WeakMap<Node, HTMLElement>();
export const NODE_TO_KEY = new WeakMap<Node, Key>();
export const EDITOR_TO_RUNTIME_ID_TO_KEY = new WeakMap<
  AnyPluginEditor,
  Map<NodeKey, Key>
>();
export const EDITOR_TO_RUNTIME_ID_TO_ELEMENTS = new WeakMap<
  object,
  Map<NodeKey, Set<HTMLElement>>
>();
export const EDITOR_TO_KEY_TO_ELEMENT = new WeakMap<
  AnyPluginEditor,
  WeakMap<Key, HTMLElement>
>();

/**
 * Weak maps for storing editor-related state.
 */

export const IS_READ_ONLY = new WeakMap<AnyPluginEditor, boolean>();
export const IS_FOCUSED = new WeakMap<AnyPluginEditor, boolean>();
export const IS_COMPOSING = new WeakMap<AnyPluginEditor, boolean>();

export const EDITOR_TO_USER_SELECTION = new WeakMap<
  AnyPluginEditor,
  Anchor<Range> | null
>();

/**
 * Weak maps for saving pending state on composition stage.
 */

export const EDITOR_TO_SCHEDULE_FLUSH = new WeakMap<
  AnyPluginEditor,
  () => void
>();

export const EDITOR_TO_PENDING_INSERTION_MARKS = new WeakMap<
  AnyPluginEditor,
  Partial<Text> | null
>();

export const EDITOR_TO_USER_MARKS = new WeakMap<
  AnyPluginEditor,
  Partial<Text> | null
>();

/**
 * Android input handling specific weak-maps
 */

export const EDITOR_TO_PENDING_DIFFS = new WeakMap<
  AnyPluginEditor,
  TextDiff[]
>();

export const EDITOR_TO_ROOT_VIEW_EDITORS = new WeakMap<
  object,
  Set<AnyPluginEditor>
>();

export const EDITOR_TO_PENDING_ACTION = new WeakMap<
  AnyPluginEditor,
  Action | null
>();

export const EDITOR_TO_PENDING_SELECTION = new WeakMap<
  AnyPluginEditor,
  Range | null
>();

export const EDITOR_TO_FORCE_RENDER = new WeakMap<
  AnyPluginEditor,
  () => void
>();

/**
 * Symbols.
 */

export const PLACEHOLDER_SYMBOL = Symbol('placeholder') as unknown as string;
export const MARK_PLACEHOLDER_SYMBOL = Symbol(
  'mark-placeholder'
) as unknown as string;
