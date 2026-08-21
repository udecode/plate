import {
  screenReaderAnnouncementEffect,
  type Editor,
  type EditorCommit,
  type Value,
} from '@platejs/plite';
import React, { useRef, useState } from 'react';

import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';

const visuallyHiddenStyle: React.CSSProperties = {
  border: 0,
  clip: 'rect(0 0 0 0)',
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

/** One polite live region owned by a logical Plite React editor runtime. */
export const EditorAnnouncementLiveRegion = <
  V extends Value,
  TExtensions extends readonly unknown[],
>({
  editor,
}: {
  editor: Editor<V, TExtensions>;
}) => {
  const lastEditorRef = useRef(editor);
  const lastCommitVersionRef = useRef(editor.read.lastCommit()?.version ?? 0);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  if (lastEditorRef.current !== editor) {
    lastEditorRef.current = editor;
    lastCommitVersionRef.current = editor.read.lastCommit()?.version ?? 0;
  }

  useIsomorphicLayoutEffect(() => {
    setAnnouncement(null);

    const onCommit = (commit: EditorCommit<V>) => {
      lastCommitVersionRef.current = commit.version;

      const message = getCommitAnnouncement(commit);

      if (message === null) return;

      setAnnouncement({ commitVersion: commit.version, message });
    };
    const unsubscribe = editor.subscribeCommit(onCommit);
    const latestCommit = editor.read.lastCommit();

    if (latestCommit && latestCommit.version > lastCommitVersionRef.current) {
      onCommit(latestCommit);
    }

    return unsubscribe;
  }, [editor]);

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
