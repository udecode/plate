import type { Editor, Element, NodeEntry } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { isDefined } from '@udecode/utils';

export type GetSiblingListOptions<N extends Element = Element> = {
  breakOnEqIndentNeqListStyleType?: boolean;
  breakOnListRestart?: boolean;
  breakOnLowerIndent?: boolean;
  breakQuery?: (
    siblingNode: Element,
    currentNode: Element
  ) => boolean | undefined;
  getNextEntry?: (entry: NodeEntry<Element>) => NodeEntry<N> | undefined;
  getPreviousEntry?: (entry: NodeEntry<Element>) => NodeEntry<N> | undefined;
  /** Query to break lookup. */
  eqIndent?: boolean;
  /** Query to validate lookup. If false, check the next sibling. */
  query?: (siblingNode: Element, currentNode: Element) => boolean | undefined;
};

/** Get the next sibling indent-list node. */
export const getSiblingList = <N extends Element = Element>(
  _editor: Editor,
  [node, path]: NodeEntry<Element>,
  {
    breakOnEqIndentNeqListStyleType = true,
    breakOnListRestart = false,
    breakOnLowerIndent = true,
    breakQuery,
    eqIndent = true,
    getNextEntry,
    getPreviousEntry,
    query,
  }: GetSiblingListOptions<N>
): NodeEntry<N> | undefined => {
  if (!getPreviousEntry && !getNextEntry) return;

  const getSiblingEntry = getNextEntry ?? getPreviousEntry!;
  let nextEntry = getSiblingEntry([node, path]);

  while (nextEntry) {
    const [nextNode, nextPath] = nextEntry;
    const indent = node[KEYS.indent];
    const nextIndent = nextNode[KEYS.indent];

    if (breakQuery?.(nextNode, node)) return;
    if (typeof indent !== 'number' || typeof nextIndent !== 'number') return;
    if (
      breakOnListRestart &&
      ((getPreviousEntry && isDefined(node[KEYS.listRestart])) ||
        (getNextEntry && isDefined(nextNode[KEYS.listRestart])))
    ) {
      return;
    }
    if (breakOnLowerIndent && nextIndent < indent) return;
    if (
      breakOnEqIndentNeqListStyleType &&
      nextIndent === indent &&
      nextNode[KEYS.listType] !== node[KEYS.listType]
    ) {
      return;
    }

    if (
      (!query || query(nextNode, node)) &&
      (!eqIndent || nextIndent === indent)
    ) {
      return [nextNode, nextPath];
    }

    nextEntry = getSiblingEntry(nextEntry);
  }
};
