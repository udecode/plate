import {
  type Editor,
  type ElementEntryOf,
  type ElementOf,
  type ElementOrTextOf,
  type NodeEntry,
  type TNode,
  isDefined,
  KEYS,
} from 'platejs';

export type GetSiblingListOptions<
  N extends ElementOf<E>,
  E extends Editor = Editor,
> = {
  breakOnEqIndentNeqListStyleType?: boolean;
  breakOnListRestart?: boolean;
  breakOnLowerIndent?: boolean;
  breakQuery?: (siblingNode: TNode, currentNode: TNode) => boolean | undefined;
  getNextEntry?: (
    entry: NodeEntry<ElementOrTextOf<E>>
  ) => NodeEntry<N> | undefined;
  getPreviousEntry?: (
    entry: NodeEntry<ElementOrTextOf<E>>
  ) => NodeEntry<N> | undefined;
  /** Query to break lookup */
  eqIndent?: boolean;
  /** Query to validate lookup. If false, check the next sibling. */
  query?: (siblingNode: TNode, currentNode: TNode) => boolean | undefined;
};

/**
 * Get the next sibling indent list node. Default query: the sibling node should
 * have the same listStyleType.
 */
export const getSiblingList = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  _editor: E,
  [node, path]: ElementEntryOf<E>,
  {
    breakOnEqIndentNeqListStyleType = true,
    breakOnListRestart = false,
    breakOnLowerIndent = true,
    breakQuery,
    eqIndent = true,
    getNextEntry,
    getPreviousEntry,
    query,
  }: GetSiblingListOptions<N, E>
): NodeEntry<N> | undefined => {
  if (!getPreviousEntry && !getNextEntry) return;

  const getSiblingEntry = getNextEntry ?? getPreviousEntry!;

  let nextEntry = getSiblingEntry([node, path]);

  while (true) {
    if (!nextEntry) return;

    const [nextNode, nextPath] = nextEntry;

    const indent = (node as any)[KEYS.indent] as number;
    const nextIndent = (nextNode as any)[KEYS.indent] as number;

    if (breakQuery?.(nextNode, node)) return;
    if (!isDefined(nextIndent)) return;
    if (breakOnListRestart) {
      if (getPreviousEntry && (node as any)[KEYS.listRestart]) {
        return;
      }
      if (getNextEntry && (nextNode as any)[KEYS.listRestart]) {
        return;
      }
    }
    if (breakOnLowerIndent && nextIndent < indent) return;
    if (
      breakOnEqIndentNeqListStyleType &&
      nextIndent === indent &&
      (nextNode as any)[KEYS.listType] !== (node as any)[KEYS.listType]
    )
      return;

    let valid = !query || query(nextNode, node);

    if (valid) {
      valid = !eqIndent || nextIndent === indent;

      if (valid) return [nextNode, nextPath];
    }

    nextEntry = getSiblingEntry(nextEntry);
  }
};
