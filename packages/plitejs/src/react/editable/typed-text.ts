import { NodeApi, RangeApi, type Range, TextApi } from '../..';
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
const readInsertion = <V extends Value>(
  commit: EditorCommit<V>,
  children: Value,
  text: string
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
  const start = end.offset - text.length;
  const [index, ...rest] = end.path;
  const block = children[index];
  const leaf = block && NodeApi.getIf(block, rest);

  return changes === 1 &&
    inserts === 1 &&
    TextApi.isText(leaf) &&
    leaf.text.slice(start, end.offset) === text
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
  const range = editable ? readInsertion(commit, children, scope.text) : null;

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
