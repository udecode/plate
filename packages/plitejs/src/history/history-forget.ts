import type { Editor, Value } from '..';
import { getEditorDocumentValue } from '../core/public-state';
import {
  getStore,
  type HistoryBranch,
  type HistoryStack,
  type HistoryStore,
  mappedOnto,
  publish,
  rebaseOnto,
  rebuildBranch,
  recordDroppedCause,
  resolveDownTo,
} from './history-state';
import { knownHistoryStepId } from './history-step-id';
import { type DropSink, withDrops } from './history-store';

export const forgetHistoryStep = <V extends Value>(
  editor: Editor<V>,
  id: string
) => {
  const store = getStore(editor);
  const claim = store.pendingReplay;

  if (claim?.direction === 'redo') return false;

  const forgottenStepIds = new Set(store.forgottenStepIds).add(id);
  const open: readonly HistoryStack[] = claim ? ['redos'] : ['undos', 'redos'];

  for (const stack of open) {
    const drops: DropSink = [];
    const found = resolveDownTo(editor, drops, store[stack], id);

    if (!found) continue;

    const { above, entry, tail } = found;
    const below =
      above.length === 0
        ? tail
        : mappedOnto(editor, tail, entry.replay.record().after, entry.base);
    const remaining = rebaseOnto(
      editor,
      drops,
      rebuildBranch(above, store.maxDepth, below),
      getEditorDocumentValue(editor)
    );

    publish(editor, withDrops(store, drops), {
      forgottenStepIds,
      [stack]: remaining,
    });
    for (const cause of found.causes) recordDroppedCause(editor, cause);

    return true;
  }

  if (store.redos && !store.forgottenStepIds.has(id) && !undoHolds(store, id)) {
    publish(editor, store, { forgottenStepIds });
  }

  return false;
};

const undoHolds = <V extends Value>(store: HistoryStore<V>, id: string) => {
  if (
    store.pendingReplay &&
    knownHistoryStepId(store.pendingReplay.identity) === id
  ) {
    return true;
  }
  for (
    let entry: HistoryBranch<V> | null = store.undos;
    entry;
    entry = entry.next
  ) {
    if (knownHistoryStepId(entry.identity) === id) return true;
  }

  return false;
};
