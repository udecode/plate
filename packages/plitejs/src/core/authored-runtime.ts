import type {
  AnyEditor as Editor,
  EditorCommit,
  EditorSelectionTarget,
  EditorViewOptions,
  Value,
} from '../interfaces/editor';
import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import { jsonEqual } from './change/json';
import { isDocumentView } from './document-view-read';
import { getEditorRuntimeOwner } from './editor-runtime';
import { definePluginPoint } from './plugin-point';
import { toInternalRoot } from './public-root';

/**
 * Contribute element property keys that apply directly in place during
 * Suggesting mode without recording format suggestion tags.
 *
 * @internal
 */
export const authoredDirectProperties = definePluginPoint<readonly string[]>(
  'authored.direct-properties'
);

type AuthoredView = NonNullable<EditorViewOptions['authored']>;

type AuthoredLocation = Path | Point | Range;

export type StoredTarget =
  | Readonly<{ kind: 'stored'; target: EditorSelectionTarget }>
  | Readonly<{ kind: 'unmapped' }>;

type AuthoredRuntime = {
  /** A stored location of `root` as `view` reads it, or null when it reads none of it. */
  mapToView: <T extends AuthoredLocation>(
    view: Editor,
    root: string,
    value: T
  ) => T | null;
  readStored: <T>(view: Editor, read: () => T) => T;
  readView: <T>(view: Editor, read: () => T) => T;
  requestView: (view: Editor, value: AuthoredView) => void;
  setView: (view: Editor, value: AuthoredView) => void;
  toStored: (
    view: Editor,
    root: string,
    target: EditorSelectionTarget
  ) => StoredTarget;
  view: (view: Editor) => AuthoredView;
  viewCommit: (view: Editor, commit: EditorCommit) => EditorCommit;
};

const AUTHORED_RUNTIMES = new WeakMap<Editor, AuthoredRuntime>();
const UPDATE_VIEWS = new WeakMap<Editor, Editor>();

export const toStoredTarget = (
  view: Editor,
  target: EditorSelectionTarget
): StoredTarget => {
  const installed = AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view));

  return installed
    ? installed.toStored(view, toInternalRoot(view.read.view.root()), target)
    : { kind: 'stored', target };
};

/** `read` with every view of `view`'s editor reading the stored document. */
export const withStoredAuthoredRead = <T>(view: Editor, read: () => T): T => {
  const installed = AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view));

  return installed ? installed.readStored(view, read) : read();
};

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

export const isAuthoredPreview = (view: Editor) => {
  const authored = readAuthoredView(view);

  return authored !== undefined && 'preview' in authored;
};

export const readShownPreview = (view: Editor) => {
  const authored = isDocumentView(view) ? undefined : readAuthoredView(view);

  return authored && 'preview' in authored ? authored.preview : undefined;
};

export const readAuthoredViewKey = (view: Editor): string | undefined => {
  const authored = readAuthoredView(view);

  if (!authored) return undefined;

  return 'preview' in authored
    ? `preview:${authored.preview}`
    : `intent:${authored.intent}`;
};

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

/** Switch a live view's authored setting once its composition, if any, ends. */
export const requestAuthoredView = (view: Editor, value: AuthoredView) => {
  const installed = AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view));

  if (!installed) throw new Error('Authored changes are not installed.');
  installed.requestView(view, value);
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

const VIEW_COMMIT_SOURCES = new WeakMap<EditorCommit, EditorCommit>();

export const getViewCommitSource = (commit: EditorCommit) =>
  VIEW_COMMIT_SOURCES.get(commit) ?? commit;

export const getAuthoredViewCommit = <V extends Value>(
  view: Editor,
  commit: EditorCommit<V>
): EditorCommit<V> => {
  const shown = (AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view))?.viewCommit(
    view,
    commit
  ) ?? commit) as EditorCommit<V>;

  if (shown !== commit) VIEW_COMMIT_SOURCES.set(shown, commit);

  return shown;
};

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

const AUTHORED_MARKS_PROPERTY_KEY = 'authored';

const isAllowedFormatMark = (
  entry: unknown,
  allowedKeys: readonly string[]
): boolean => {
  if (typeof entry !== 'object' || entry === null) return false;

  const record = entry as Record<string, unknown>;

  return (
    record.kind === 'format' &&
    typeof record.key === 'string' &&
    allowedKeys.includes(record.key)
  );
};

/**
 * Check whether an uncommitted element property modification only adds, updates,
 * or removes authored `format` marks on `allowedKeys` while leaving every other
 * raw authored member (including context members) unchanged.
 *
 * @internal
 */
export const isAuthoredFormatOnlyPropertyWrite = (
  element: object,
  modification: Readonly<{
    key: string;
    type: string;
    value?: unknown;
    values?: readonly unknown[];
  }>,
  allowedKeys: readonly string[]
): boolean => {
  if (modification.key !== AUTHORED_MARKS_PROPERTY_KEY) return false;

  if (modification.type === 'add' || modification.type === 'remove') {
    return (
      Array.isArray(modification.values) &&
      modification.values.every((entry) =>
        isAllowedFormatMark(entry, allowedKeys)
      )
    );
  }

  const beforeRaw = (element as Record<string, unknown>)[
    AUTHORED_MARKS_PROPERTY_KEY
  ];
  const before = Array.isArray(beforeRaw) ? beforeRaw : [];
  const after =
    modification.type === 'set' && Array.isArray(modification.value)
      ? modification.value
      : modification.type === 'unset'
        ? []
        : null;

  if (after === null) return false;

  const beforeRest = before.filter(
    (entry) => !isAllowedFormatMark(entry, allowedKeys)
  );
  const afterRest = after.filter(
    (entry) => !isAllowedFormatMark(entry, allowedKeys)
  );

  return (
    beforeRest.length === afterRest.length &&
    beforeRest.every((entry, index) => jsonEqual(entry, afterRest[index]))
  );
};
