import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction, Location } from '@platejs/plite';
import { getPluginType } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export const removeAIMarks = (
  editor: BaseEditor,
  tx: Pick<EditorUpdateTransaction, 'nodes'>,
  { at = [] }: { at?: Location } = {}
) => {
  const nodeType = getPluginType(editor, KEYS.ai);

  tx.nodes.unset(nodeType, {
    at,
    match: (node) => Boolean(Reflect.get(node, nodeType)),
  });
};
