import type { BaseEditor } from '@platejs/core';
import {
  type Descendant,
  type EditorTransactionChangeContext,
  type Element,
  ElementApi,
} from '@platejs/plite';

export const findCodeBlockLanguageChange = <
  TEditor extends BaseEditor = BaseEditor,
>(
  context: Pick<
    EditorTransactionChangeContext<TEditor>,
    'after' | 'before' | 'change' | 'changed'
  >,
  codeBlockType: string
): { after: Element | undefined; before: Element | undefined } | undefined => {
  const nodeAtPath = (
    children: readonly Descendant[],
    path: readonly number[]
  ): Descendant | undefined => {
    let node: Descendant | undefined;

    for (const [depth, index] of path.entries()) {
      node =
        depth === 0
          ? children[index]
          : ElementApi.isElement(node)
            ? node.children[index]
            : undefined;

      if (!node) return;
    }

    return node;
  };
  const roots = new Set<string | undefined>();

  context.change.iterChangedRanges((root) => roots.add(root ?? undefined));

  for (const root of roots) {
    if (!context.changed.has('properties', root)) continue;

    const beforeChildren =
      root === undefined
        ? context.before.children
        : (context.before.roots?.[root] ?? []);
    const afterChildren =
      root === undefined
        ? context.after.children
        : (context.after.roots?.[root] ?? []);

    for (const path of context.changed.paths(root)) {
      const beforeNode = nodeAtPath(beforeChildren, path);
      const afterNode = nodeAtPath(afterChildren, path);
      const before =
        ElementApi.isElement(beforeNode) && beforeNode.type === codeBlockType
          ? beforeNode
          : undefined;
      const after =
        ElementApi.isElement(afterNode) && afterNode.type === codeBlockType
          ? afterNode
          : undefined;
      const beforeLanguage = before?.language;
      const afterLanguage = after?.language;

      if (
        (beforeLanguage !== undefined || afterLanguage !== undefined) &&
        beforeLanguage !== afterLanguage
      ) {
        return { after, before };
      }
    }
  }
};
