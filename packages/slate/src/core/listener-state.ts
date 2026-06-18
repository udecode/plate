import type {
  Editor,
  EditorCommit,
  EditorCommitSource,
  SnapshotListener,
  Value,
} from '../interfaces/editor';

const LISTENERS = new WeakMap<Editor, Set<SnapshotListener>>();
const COMMIT_LISTENERS = new WeakMap<
  Editor,
  Set<(commit: EditorCommit) => void>
>();
const SOURCE_LISTENERS = new WeakMap<
  Editor,
  Map<EditorCommitSource, Set<SnapshotListener>>
>();

export const initializeListenerState = (editor: Editor) => {
  LISTENERS.set(editor, new Set());
  COMMIT_LISTENERS.set(editor, new Set());
  SOURCE_LISTENERS.set(editor, new Map());
};

export const getSnapshotListeners = (editor: Editor) => LISTENERS.get(editor);

export const getCommitListeners = (editor: Editor) =>
  COMMIT_LISTENERS.get(editor);

export const getSourceListeners = (editor: Editor) =>
  SOURCE_LISTENERS.get(editor);

export const hasSnapshotListeners = (editor: Editor) =>
  (LISTENERS.get(editor)?.size ?? 0) > 0 || hasSourceListeners(editor);

const hasCommitListeners = (editor: Editor) =>
  (COMMIT_LISTENERS.get(editor)?.size ?? 0) > 0;

export const hasListeners = (editor: Editor) =>
  hasSnapshotListeners(editor) || hasCommitListeners(editor);

const hasSourceListeners = (editor: Editor) => {
  const sourceListeners = SOURCE_LISTENERS.get(editor);

  if (!sourceListeners) {
    return false;
  }

  for (const listeners of sourceListeners.values()) {
    if (listeners.size > 0) {
      return true;
    }
  }

  return false;
};

export const getSourcesForChange = (
  change: EditorCommit
): readonly EditorCommitSource[] => {
  const sources: EditorCommitSource[] = ['commit'];

  if (
    change.selectionChanged ||
    (change.selectionImpactRuntimeIds?.length ?? 0) > 0
  ) {
    sources.push('selection');
  }

  if (change.classes.includes('text')) {
    sources.push('text');
  }

  if (
    change.classes.includes('structural') ||
    change.nodeImpactRuntimeIds == null ||
    change.nodeImpactRuntimeIds.length > 0
  ) {
    sources.push('node');
  }

  if (
    change.classes.includes('text') ||
    change.classes.includes('structural') ||
    change.classes.includes('replace')
  ) {
    sources.push('decoration');
  }

  if (
    change.classes.includes('text') ||
    change.classes.includes('structural') ||
    change.classes.includes('replace')
  ) {
    sources.push('root');
  }

  if (change.dirtyStateKeys.length > 0) {
    sources.push('state');
  }

  return sources;
};

export const subscribe = <V extends Value>(
  editor: Editor<V>,
  listener: SnapshotListener<V>
) => {
  const typedListener = listener as SnapshotListener;
  const listeners = LISTENERS.get(editor) ?? new Set<SnapshotListener>();
  listeners.add(typedListener);
  LISTENERS.set(editor, listeners);

  return () => {
    listeners.delete(typedListener);
  };
};

export const subscribeCommit = <V extends Value>(
  editor: Editor<V>,
  listener: (commit: EditorCommit<V>) => void
) => {
  const typedListener = listener as (commit: EditorCommit) => void;
  const listeners =
    COMMIT_LISTENERS.get(editor) ?? new Set<(commit: EditorCommit) => void>();
  listeners.add(typedListener);
  COMMIT_LISTENERS.set(editor, listeners);

  return () => {
    listeners.delete(typedListener);
  };
};

export const subscribeSource = <V extends Value>(
  editor: Editor<V>,
  source: EditorCommitSource,
  listener: SnapshotListener<V>
) => {
  const typedListener = listener as SnapshotListener;
  const sourceListeners =
    SOURCE_LISTENERS.get(editor) ??
    new Map<EditorCommitSource, Set<SnapshotListener>>();
  const listeners = sourceListeners.get(source) ?? new Set<SnapshotListener>();

  listeners.add(typedListener);
  sourceListeners.set(source, listeners);
  SOURCE_LISTENERS.set(editor, sourceListeners);

  return () => {
    listeners.delete(typedListener);

    if (listeners.size === 0) {
      sourceListeners.delete(source);
    }
  };
};
