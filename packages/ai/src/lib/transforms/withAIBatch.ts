import type { History, SlateEditor } from '@udecode/plate';

export type AIBatch = History['undos'][number] & { ai?: boolean };

export const withAIBatch = (
  editor: SlateEditor,
  fn: () => void,
  {
    split,
  }: {
    split?: boolean;
  } = {}
) => {
  if (split) {
    editor.tf.withNewBatch(fn);
  } else {
    editor.tf.withMerging(fn);
  }

  const lastBatch = editor.history.undos?.at(-1) as AIBatch | undefined;

  if (lastBatch) {
    lastBatch.ai = true;
  }
};
