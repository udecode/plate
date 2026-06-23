import type { SlateEditor } from 'platejs';

export type AIBatch = SlateEditor['history']['undos'][number] & {
  ai?: boolean;
};

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
    editor.api.history.withNewBatch(fn);
  } else {
    editor.api.history.withMerging(fn);
  }

  const lastBatch = editor.history.undos?.at(-1) as AIBatch | undefined;

  if (lastBatch) {
    lastBatch.ai = true;
  }
};
