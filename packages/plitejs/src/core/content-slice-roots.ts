import type { AnyEditor as Editor } from '../interfaces/editor';
import { ElementApi } from '../interfaces/element';
import type { Descendant } from '../interfaces/node';
import { getEditorSchema } from './editor-runtime';

export const rewriteContentRootReferences = (
  editor: Editor,
  children: readonly Descendant[],
  rewriteRoot: (root: string) => string
): readonly Descendant[] => {
  let changed = false;
  const result = children.map((node): Descendant => {
    if (!ElementApi.isElement(node)) return node;

    const nextChildren = rewriteContentRootReferences(
      editor,
      node.children,
      rewriteRoot
    );
    let { childRoots } = node as { childRoots?: unknown };
    let rootsChanged = false;

    for (const { root, slot } of getEditorSchema(editor).getElementOwnedRoots(
      node
    )) {
      const replacement = rewriteRoot(root);

      if (replacement === root) continue;
      childRoots = {
        ...(typeof childRoots === 'object' && childRoots !== null
          ? childRoots
          : {}),
        [slot]: replacement,
      };
      rootsChanged = true;
    }

    if (!rootsChanged && nextChildren === node.children) return node;
    changed = true;

    return {
      ...node,
      ...(childRoots === undefined ? {} : { childRoots }),
      children: nextChildren,
    };
  });

  return changed ? result : children;
};
