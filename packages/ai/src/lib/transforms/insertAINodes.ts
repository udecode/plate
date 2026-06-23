import type { Descendant, Path } from '@platejs/slate';
import type { SlateEditor } from 'platejs';

export const insertAINodes = (
  editor: SlateEditor,
  nodes: Descendant[],
  {
    target,
  }: {
    target?: Path;
  } = {}
) => {
  if (!target && !editor.selection?.focus.path) return;

  const aiNodes = nodes.map((node) => ({
    ...node,
    ai: true,
  }));

  editor.update((tx) => {
    tx.nodes.insert(aiNodes, {
      at: editor.api.end(target || editor.selection!.focus.path),
      select: true,
    });
    tx.selection.collapse({ edge: 'end' });
  });
};
