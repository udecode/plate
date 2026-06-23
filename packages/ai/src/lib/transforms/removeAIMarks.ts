import type { Location } from '@platejs/plite';
import { type BasePlateEditor, getPluginType, KEYS } from 'platejs';

export const removeAIMarks = (
  editor: BasePlateEditor,
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
