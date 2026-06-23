import type { Location } from '@platejs/slate';
import { type SlateEditor, getPluginType, KEYS } from 'platejs';

export const removeAIMarks = (
  editor: SlateEditor,
  { at = [] }: { at?: Location } = {}
) => {
  const nodeType = getPluginType(editor, KEYS.ai);

  editor.update((tx) => {
    tx.nodes.unset(nodeType, {
      at,
      match: (n) => Boolean((n as Record<string, unknown>)[nodeType]),
    });
  });
};
