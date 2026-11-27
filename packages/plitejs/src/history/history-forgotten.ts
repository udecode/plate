import type { EditorDocumentValue, Value } from '..';
import type { HistoryBranch } from './history-state';
import { knownHistoryStepId } from './history-step-id';

export const resolveForgottenTop = <V extends Value>(
  forgottenStepIds: ReadonlySet<string>,
  value: HistoryBranch<V> | null,
  resolveHead: (entry: HistoryBranch<V>) => HistoryBranch<V> | null,
  mapOnto: (
    entry: HistoryBranch<V>,
    from: EditorDocumentValue<V>,
    to: EditorDocumentValue<V>
  ) => HistoryBranch<V> | null
): HistoryBranch<V> | null => {
  const isForgotten = (entry: HistoryBranch<V>) =>
    forgottenStepIds.has(knownHistoryStepId(entry.identity) ?? '');
  let base: EditorDocumentValue<V> | null = null;
  let after: EditorDocumentValue<V> | null = null;
  let current = value;

  while (current) {
    if (base && after && !isForgotten(current)) {
      current = mapOnto(current, after, base);
      base = null;
      after = null;
    } else if (current.mappings) {
      current = resolveHead(current);
    } else if (isForgotten(current)) {
      base ??= current.base;
      ({ after } = current.replay.record());
      current = current.next;
    } else {
      break;
    }
  }

  return current;
};
