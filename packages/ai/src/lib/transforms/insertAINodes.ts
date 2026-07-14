import { type BaseEditor, getPluginType } from '@platejs/core';
import type { Descendant, EditorUpdateTransaction, Path } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const insertAINodes = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  nodes: Descendant[],
  {
    target,
  }: {
    target?: Path;
  } = {}
) => {
  const selection = tx.selection();
  const at = target ?? selection?.focus.path;

  if (!at) return;

  const point = tx.points.end(at);

  if (!point) return;

  const aiType = getPluginType(editor, KEYS.ai);
  const aiNodes = nodes.map((node) => ({
    ...node,
    [aiType]: true,
  }));

  tx.nodes.insert(aiNodes, {
    at: point,
    select: true,
  });
  tx.selection.collapse({ edge: 'end' });
};
