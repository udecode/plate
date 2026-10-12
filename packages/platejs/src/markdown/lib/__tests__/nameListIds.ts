import { type Descendant, ElementApi } from '../../../core';

/**
 * Renames each list id to the order it first appears in, so two parses of one
 * source compare equal when they hold the same lists, whatever ids each parse
 * generated.
 */
export const nameListIds = (
  nodes: readonly Descendant[],
  names = new Map<string, string>()
): Descendant[] =>
  nodes.map((node) => {
    if (!ElementApi.isElement(node)) return node;

    const { listId } = node;

    if (typeof listId === 'string' && !names.has(listId)) {
      names.set(listId, String.fromCharCode(97 + names.size));
    }

    return {
      ...node,
      ...(typeof listId === 'string' ? { listId: names.get(listId) } : {}),
      children: nameListIds(node.children, names),
    };
  });

/** The same document with its list ids renamed by `nameListIds`. */
export const nameDocumentListIds = <
  T extends Readonly<{ children: readonly Descendant[] }>,
>(
  document: T
): T => ({ ...document, children: nameListIds(document.children) });
