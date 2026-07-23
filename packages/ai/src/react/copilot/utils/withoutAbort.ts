import type { EditorUpdateTransaction } from '@platejs/plite';

export const COPILOT_SKIP_ABORT_TAG = 'skip-copilot-abort' as const;

/** Keep a Copilot-authored transaction from rejecting its own suggestion. */
export const withoutAbort = <T>(
  tx: Pick<EditorUpdateTransaction, 'tags'>,
  fn: () => T
): T => {
  tx.tags.add(COPILOT_SKIP_ABORT_TAG);

  return fn();
};
