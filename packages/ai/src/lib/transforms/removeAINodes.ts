import { type BaseEditor, getPluginType } from '@platejs/core';
import {
  type EditorUpdateTransaction,
  type Path,
  TextApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const removeAINodes = (
  editor: BaseEditor,
  tx: Pick<EditorUpdateTransaction, 'nodes'>,
  { at = [] }: { at?: Path } = {}
) => {
  const aiType = getPluginType(editor, KEYS.ai);

  tx.nodes.remove({
    at,
    match: (node) => TextApi.isText(node) && Boolean(Reflect.get(node, aiType)),
  });
};
