import type { Descendant, Path, SlateEditor } from '@udecode/plate';

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

  editor.tf.withoutNormalizing(() => {
    editor.tf.insertNodes(aiNodes, {
      at: editor.api.end(target || editor.selection!.focus.path),
      select: true,
    });
    editor.tf.collapse({ edge: 'end' });
  });
};
