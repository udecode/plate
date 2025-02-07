import type { Descendant, Path, SlateEditor, TElement } from '@udecode/plate';

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

  const addAINodes = (plainNodes: Descendant[]) => {
    return plainNodes.map(
      (plainNode: Descendant): Descendant => ({
        ...plainNode,
        ...(plainNode.children ? {} : { ai: true }),
        ...(plainNode.children
          ? { children: addAINodes((plainNode as TElement).children) }
          : {}),
      })
    );
  };
  const aiNodes = addAINodes(nodes);

  editor.tf.withoutNormalizing(() => {
    editor.tf.insertFragment(aiNodes, {
      at: editor.api.end(target || editor.selection!.focus.path),
    });
    editor.tf.collapse({ edge: 'end' });
  });
};
