import type { Path } from '@platejs/slate';
import { type SlateEditor, TextApi } from 'platejs';

export const removeAINodes = (
  editor: SlateEditor,
  { at = [] }: { at?: Path } = {}
) => {
  editor.update((tx) => {
    tx.nodes.remove({
      at,
      match: (n) => TextApi.isText(n) && !!(n as Record<string, unknown>).ai,
    });
  });
};
