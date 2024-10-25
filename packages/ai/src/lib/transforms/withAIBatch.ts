import {
  type History,
  type SlateEditor,
  withMerging,
  withNewBatch,
} from '@udecode/plate-common';

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
    withNewBatch(editor, fn);
  } else {
    withMerging(editor, fn);
  }

  const lastBatch = editor.history.undos?.at(-1) as AIBatch | undefined;

  if (lastBatch) {
    lastBatch.ai = true;
  }
};
