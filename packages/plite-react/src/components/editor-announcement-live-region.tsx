import {
  screenReaderAnnouncementEffect,
  type Editor,
  type EditorCommit,
  type Value,
} from '@platejs/plite';
import React, {
  type CSSProperties,
  useMemo,
  useSyncExternalStore,
} from 'react';

const visuallyHiddenStyle: CSSProperties = {
  border: 0,
  clipPath: 'inset(50%)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: 1,
};

type Announcement = {
  commitVersion: number;
  message: string;
};

const getCommitAnnouncement = <V extends Value>(
  commit: EditorCommit<V>
): string | null => {
  const messages = commit.effects.flatMap((effect) =>
    effect.type.key === screenReaderAnnouncementEffect.key &&
    typeof effect.value === 'string' &&
    effect.value.trim().length > 0
      ? [effect.value]
      : []
  );

  return messages.length > 0 ? messages.join(' ') : null;
};

const createEditorAnnouncementStore = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>
) => {
  let announcement: Announcement | null = null;
  let lastCommitVersion = editor.read.lastCommit()?.version ?? 0;

  const getSnapshot = () => announcement;
  const subscribe = (listener: () => void) => {
    const onCommit = (commit: EditorCommit<V>) => {
      if (commit.version <= lastCommitVersion) return;

      lastCommitVersion = commit.version;
      const message = getCommitAnnouncement(commit);

      if (message === null) return;

      announcement = { commitVersion: commit.version, message };
      listener();
    };
    const unsubscribe = editor.subscribeCommit(onCommit);
    const latestCommit = editor.read.lastCommit();

    if (latestCommit) onCommit(latestCommit);

    return unsubscribe;
  };

  return { getSnapshot, subscribe };
};

/** One polite live region owned by a logical Plite React editor runtime. */
export const EditorAnnouncementLiveRegion = <
  V extends Value,
  TExtensions extends readonly unknown[],
>({
  editor,
}: {
  editor: Editor<V, TExtensions>;
}) => {
  const store = useMemo(() => createEditorAnnouncementStore(editor), [editor]);
  const announcement = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );

  return (
    <span
      aria-atomic="true"
      aria-live="polite"
      data-plite-announcer=""
      role="status"
      style={visuallyHiddenStyle}
    >
      {announcement ? (
        <span key={announcement.commitVersion}>{announcement.message}</span>
      ) : null}
    </span>
  );
};
