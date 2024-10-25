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
  const lastBatch = editor.history.undos?.at(-1) as AIBatch | undefined;

  if (!split && lastBatch?.ai) {
    withMerging(editor, fn);
  } else {
    withNewBatch(editor, fn);

    if (lastBatch) {
      lastBatch.ai = true;
    }
  }
};
