import type {
  AnyEditor as Editor,
  EditorCommit,
  EditorViewOptions,
  Value,
} from '../interfaces/editor';
import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import { getEditorRuntimeOwner } from './editor-runtime';

type AuthoredView = NonNullable<EditorViewOptions['authored']>;

type AuthoredLocation = Path | Point | Range;

type AuthoredRuntime = {
  /** A stored location of `root` as `view` reads it, or null when it reads none of it. */
  mapToView: <T extends AuthoredLocation>(
    view: Editor,
    root: string,
    value: T
  ) => T | null;
  readView: <T>(view: Editor, read: () => T) => T;
  setView: (view: Editor, value: AuthoredView) => void;
  view: (view: Editor) => AuthoredView;
  viewCommit: (view: Editor, commit: EditorCommit) => EditorCommit;
};

const AUTHORED_RUNTIMES = new WeakMap<Editor, AuthoredRuntime>();
const UPDATE_VIEWS = new WeakMap<Editor, Editor>();

export const mapToAuthoredView = <T extends AuthoredLocation>(
  view: Editor,
  root: string,
  value: T
): T | null => {
  const installed = AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view));

  return installed ? installed.mapToView(view, root, value) : value;
};

export const readAuthoredView = (view: Editor) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view))?.view(view);

export const withAuthoredViewRead = <T>(
  source: Editor,
  view: Editor,
  read: () => T
): T => {
  const installed = AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(source));

  return installed ? installed.readView(view, read) : read();
};

export const configureAuthoredView = (view: Editor, value?: AuthoredView) => {
  const installed = AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view));

  if (!installed) {
    if (value) throw new Error('Authored changes are not installed.');
    return;
  }
  if (value) installed.setView(view, value);
};

/** Run an update as one view's, so the recorder reads that view's intent. */
export const withAuthoredUpdateView = <T>(
  source: Editor,
  view: Editor,
  update: () => T
): T => {
  const owner = getEditorRuntimeOwner(source);
  const previous = UPDATE_VIEWS.get(owner);

  UPDATE_VIEWS.set(owner, view);
  try {
    return update();
  } finally {
    if (previous) UPDATE_VIEWS.set(owner, previous);
    else UPDATE_VIEWS.delete(owner);
  }
};

export const getAuthoredUpdateView = (editor: Editor) =>
  UPDATE_VIEWS.get(getEditorRuntimeOwner(editor)) ?? editor;

export const getAuthoredViewCommit = <V extends Value>(
  view: Editor,
  commit: EditorCommit<V>
): EditorCommit<V> =>
  (AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view))?.viewCommit(
    view,
    commit
  ) ?? commit) as EditorCommit<V>;

export const registerAuthoredRuntime = (
  editor: Editor,
  runtime: AuthoredRuntime
) => {
  const owner = getEditorRuntimeOwner(editor);

  AUTHORED_RUNTIMES.set(owner, runtime);

  return () => {
    if (AUTHORED_RUNTIMES.get(owner) === runtime) {
      AUTHORED_RUNTIMES.delete(owner);
    }
  };
};
