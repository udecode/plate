import {
  NodeApi,
  PathApi,
  type Point,
  PointApi,
  RangeApi,
  type Range,
  TextApi,
} from '../..';
import { getEditorCommitSnapshot } from '../../core/commit';
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
import { readRuntimeSelectionRange } from './runtime-selection-state';

/** Text a mounted Editable committed with typing intent. */
export type TypedText = Readonly<{
  /** The Editable root element whose input produced the text. */
  editable: HTMLElement;
  /** The inserted text in the model, ending at the caret. */
  range: Range;
  text: string;
}>;

export type TypedTextListener = (typed: TypedText) => void;

type TypingInput = Readonly<{
  at?: Point;
  inputType: string | undefined;
  text: string;
}>;

type TypingScope = Readonly<{
  at: Point;
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

  const selection = input.at ? null : readRuntimeSelectionRange(editor);
  const at =
    input.at ??
    (selection && RangeApi.isCollapsed(selection) ? selection.focus : null);

  if (!at) return fn();

  scopes.push({
    at,
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

const snapshotBlock = <V extends Value>(
  commit: EditorCommit<V>,
  index: number | undefined
) =>
  index === undefined
    ? undefined
    : getEditorCommitSnapshot(commit, commit.selectionAfterRoot ?? 'main')
        .children[index];

const readBlockText = <V extends Value>(
  commit: EditorCommit<V>,
  from: Point,
  to: Point,
  maxLength: number
) => {
  const [index, ...fromPath] = from.path;
  const [toIndex, ...toPath] = to.path;
  const block = index === toIndex ? snapshotBlock(commit, index) : undefined;

  if (
    !block ||
    !TextApi.isText(NodeApi.getIf(block, fromPath)) ||
    !TextApi.isText(NodeApi.getIf(block, toPath))
  ) {
    return null;
  }

  let text = '';

  for (const [leaf, path] of NodeApi.texts(block, {
    from: fromPath,
    to: toPath,
  })) {
    const start = PathApi.equals(path, fromPath) ? from.offset : 0;
    const end = PathApi.equals(path, toPath) ? to.offset : leaf.text.length;

    text += leaf.text.slice(start, end);
    if (text.length > maxLength) return null;
  }

  return text;
};

const readInsertion = <V extends Value>(
  commit: EditorCommit<V>,
  { at, text }: TypingScope
): Range | null => {
  const caret = commit.selectionAfter;

  if (
    !RangeApi.isRange(caret) ||
    !RangeApi.isCollapsed(caret) ||
    caret.focus.offset < text.length
  ) {
    return null;
  }

  let changes = 0;
  let inserts = 0;

  commit.changes.iterChangedRanges((_root, fromA, toA, fromB, toB) => {
    changes += 1;
    if (fromA === toA && toB > fromB) inserts += 1;
  });

  const end = caret.focus;
  const start = { ...end, offset: end.offset - text.length };

  if (
    changes !== 1 ||
    inserts !== 1 ||
    readBlockText(commit, start, end, text.length) !== text
  ) {
    return null;
  }

  // Plite can write text typed at a leaf edge into the neighboring leaf or a
  // new one, so the text either runs from the input's point to the caret or
  // ends where that point sits.
  const insertedAt = PointApi.isAfter(at, end)
    ? readBlockText(commit, end, at, 0) === ''
    : readBlockText(commit, at, end, text.length) === text;

  return insertedAt ? { anchor: start, focus: end } : null;
};

const readTypedText = <V extends Value, TPlugins extends readonly unknown[]>(
  view: ReactRuntimeEditor<V, TPlugins>,
  commit: EditorCommit<V>
): TypedText | null => {
  const scope = scopes.at(-1);

  if (
    scope?.owner !== getEditorRuntimeOwner(view) ||
    commit.previousVersion !== scope.previousVersion ||
    // A listener that edited during delivery moved the document past this
    // commit, so its range no longer names the typed text.
    getSnapshotVersion(scope.owner) !== commit.version ||
    commit.selectionAfterRoot !== view.read.view.root()
  ) {
    return null;
  }

  const editable = getMountedEditableDOMRuntimes(view).find(
    (runtime) => runtime.inputController === scope.controller
  )?.rootRef.current;
  const range = editable ? readInsertion(commit, scope) : null;

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
