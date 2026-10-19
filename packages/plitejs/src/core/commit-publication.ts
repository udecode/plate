import type { EditorCommit, EditorSnapshot, Value } from '../interfaces/editor';

type PendingEditorCommit<V extends Value> = {
  commit: EditorCommit;
  snapshot: EditorSnapshot<V>;
};

type EditorCommitPublicationQueue<V extends Value> = {
  lastVersion: number;
  pending: Map<number, PendingEditorCommit<V>>;
  publishing: boolean;
};

export const createEditorCommitPublicationQueue = <V extends Value>(
  lastVersion: number
): EditorCommitPublicationQueue<V> => ({
  lastVersion,
  pending: new Map(),
  publishing: false,
});

export const resetEditorCommitPublicationQueue = <V extends Value>(
  queue: EditorCommitPublicationQueue<V>,
  lastVersion: number
) => {
  queue.lastVersion = lastVersion;
  queue.pending.clear();
  queue.publishing = false;
};

export const publishEditorCommitInVersionOrder = <V extends Value>(
  queue: EditorCommitPublicationQueue<V>,
  commit: EditorCommit,
  snapshot: EditorSnapshot<V>,
  publish: (commit: EditorCommit, snapshot: EditorSnapshot<V>) => void,
  options: { allowVersionGap?: boolean } = {}
) => {
  if (commit.version <= queue.lastVersion) return;

  queue.pending.set(commit.version, { commit, snapshot });
  if (queue.publishing) return;

  queue.publishing = true;

  try {
    let allowVersionGap = options.allowVersionGap ?? false;

    while (queue.pending.size > 0) {
      let nextVersion = queue.lastVersion + 1;
      let next = queue.pending.get(nextVersion);

      if (!next && allowVersionGap) {
        nextVersion = Math.min(...queue.pending.keys());
        next = queue.pending.get(nextVersion);
      }
      if (!next) break;

      queue.pending.delete(nextVersion);
      queue.lastVersion = nextVersion;
      publish(next.commit, next.snapshot);
      allowVersionGap = false;
    }
  } finally {
    queue.publishing = false;
  }
};
