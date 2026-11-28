import {
  ElementApi,
  NodeApi,
  PathApi,
  RangeApi,
  type Range,
  TextApi,
} from '../..';
import { valueRootIndex } from '../../core/change/document-change';
import {
  getEditorCommitSnapshot,
  getEditorCommitValue,
} from '../../core/commit';
import { getEditorRuntimeOwner } from '../../core/editor-runtime';
import { getSnapshotVersion } from '../../core/public-state';
import type {
  AnyEditor,
  Editor,
  EditorCommit,
  Value,
} from '../../interfaces/editor';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { getMountedEditableDOMRuntimes } from './editable-dom-runtime';
import type { EditableInputController } from './input-state';

/** Text a mounted Editable committed with typing intent. */
export type TypedText = Readonly<{
  /** The Editable root element whose input produced the text. */
  editable: HTMLElement;
  /** The inserted text in the model, ending at the caret. */
  range: Range;
  text: string;
}>;

/** Listener called when a mounted Editable commits typed text. */
export type TypedTextListener = (typed: TypedText) => void;

type TypingInput = Readonly<{
  inputType: string | undefined;
  text: string;
}>;

type TypingScope = Readonly<{
  controller: EditableInputController;
  owner: Editor;
  previousVersion: number;
  text: string;
}>;

const TYPING_INPUT_TYPES = new Set([
  'insertCompositionText',
  'insertFromComposition',
  'insertText',
]);

const scopes: TypingScope[] = [];
const subscribers = new WeakMap<Editor, Set<object>>();

export const isTypingInputType = (inputType: string | undefined) =>
  inputType !== undefined && TYPING_INPUT_TYPES.has(inputType);

export const withTypedTextIntent = <T>(
  editor: AnyEditor,
  controller: EditableInputController | undefined,
  input: TypingInput,
  fn: () => T
): T => {
  const owner = getEditorRuntimeOwner(editor);

  if (
    !controller ||
    !isTypingInputType(input.inputType) ||
    !subscribers.get(owner)?.size
  ) {
    return fn();
  }

  scopes.push({
    controller,
    owner,
    previousVersion: getSnapshotVersion(owner),
    text: input.text,
  });

  try {
    return fn();
  } finally {
    scopes.pop();
  }
};

// Every input that opens a scope leaves the caret just past the text it wrote,
// wherever Plite put that text, so the text before the caret identifies it.
// Plain typing takes the O(1) token-range fast path without stringifying the
// block; structural splits (Suggesting marks or mid-leaf pending marks) fall
// back to comparing only the leaf's parent element.
const readInsertion = <V extends Value>(
  commit: EditorCommit<V>,
  children: Value,
  before: Value,
  text: string
): Range | null => {
  const beforeSelection = commit.selectionBefore;
  const caret = commit.selectionAfter;

  if (
    !RangeApi.isRange(beforeSelection) ||
    !RangeApi.isCollapsed(beforeSelection) ||
    !RangeApi.isRange(caret) ||
    !RangeApi.isCollapsed(caret) ||
    caret.focus.offset < text.length
  ) {
    return null;
  }

  const root = commit.selectionAfterRoot ?? 'main';
  let changes = 0;
  let rangeRoot: string | null = null;
  let fromA = 0;
  let toA = 0;
  let fromB = 0;
  let toB = 0;

  commit.changes.iterChangedRanges((changedRoot, a0, a1, b0, b1) => {
    changes += 1;
    rangeRoot = changedRoot;
    fromA = a0;
    toA = a1;
    fromB = b0;
    toB = b1;
  });

  const end = caret.focus;
  const start = end.offset - text.length;
  const [index, ...rest] = end.path;
  const block = children[index];
  const leaf = block && NodeApi.getIf(block, rest);

  if (
    changes !== 1 ||
    (rangeRoot ?? 'main') !== root ||
    !TextApi.isText(leaf) ||
    leaf.text.slice(start, end.offset) !== text ||
    !before[index]
  ) {
    return null;
  }

  const posAtEnd = valueRootIndex(
    getEditorCommitValue(commit),
    root
  ).positionAt(end);

  if (posAtEnd === null || fromB >= posAtEnd || toB < posAtEnd) {
    return null;
  }

  if (fromA === toA && toB - fromB === text.length && toB === posAtEnd) {
    return { anchor: { ...end, offset: start }, focus: end };
  }

  const parentPath = PathApi.parent(rest);
  const leafIndex = rest.at(-1) ?? 0;
  const parentAfter = NodeApi.getIf(block, parentPath);
  const parentBefore = NodeApi.getIf(before[index], parentPath);

  if (
    !parentAfter ||
    !parentBefore ||
    !ElementApi.isElement(parentAfter) ||
    !ElementApi.isElement(parentBefore)
  ) {
    return null;
  }

  let offset = start;

  for (let childIndex = 0; childIndex < leafIndex; childIndex += 1) {
    offset += NodeApi.string(parentAfter.children[childIndex]).length;
  }

  const typed = NodeApi.string(parentAfter);

  return typed.slice(0, offset) + typed.slice(offset + text.length) ===
    NodeApi.string(parentBefore)
    ? { anchor: { ...end, offset: start }, focus: end }
    : null;
};

const readTypedText = <V extends Value, TPlugins extends readonly unknown[]>(
  view: ReactRuntimeEditor<V, TPlugins>,
  commit: EditorCommit<V>
): TypedText | null => {
  const scope = scopes.at(-1);

  if (
    scope?.owner !== getEditorRuntimeOwner(view) ||
    commit.previousVersion !== scope.previousVersion ||
    commit.selectionAfterRoot !== view.read.view.root()
  ) {
    return null;
  }

  const { children } = getEditorCommitSnapshot(
    commit,
    commit.selectionAfterRoot ?? 'main'
  );

  // A listener that edited the document during delivery replaced its
  // children, so this commit's range no longer names the typed text.
  if (view.read.children() !== children) return null;

  const editable = getMountedEditableDOMRuntimes(view).find(
    (runtime) => runtime.inputController === scope.controller
  )?.rootRef.current;
  const range = editable
    ? readInsertion(
        commit,
        children,
        getEditorCommitSnapshot(
          commit,
          commit.selectionAfterRoot ?? 'main',
          'before'
        ).children,
        scope.text
      )
    : null;

  return editable && range ? { editable, range, text: scope.text } : null;
};

export const subscribeTypedText = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  view: ReactRuntimeEditor<V, TPlugins>,
  listener: TypedTextListener
) => {
  const owner = getEditorRuntimeOwner(view);
  const subscriber = {};
  const release = view.subscribeCommit((commit) => {
    const typed = readTypedText(view, commit);

    if (typed) listener(typed);
  });
  const owned = subscribers.get(owner) ?? new Set<object>();

  owned.add(subscriber);
  subscribers.set(owner, owned);

  return () => {
    release();
    owned.delete(subscriber);
  };
};
