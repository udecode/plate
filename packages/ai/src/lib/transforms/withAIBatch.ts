import {
  type SlateEditor,
  withMerging,
  withNewBatch,
} from '@udecode/plate-common';

export const withAIBatch = (
  editor: SlateEditor,
  fn: () => void,
  {
    split,
  }: {
    split?: boolean;
  } = {}
) => {
  if (!split && (editor.history.undos?.at(-1) as any)?.ai) {
    withMerging(editor, fn);
  } else {
    withNewBatch(editor, fn);

    const batch = editor.history.undos?.at(-1) as any;

    if (batch) {
      batch.ai = true;
    }
  }
};
