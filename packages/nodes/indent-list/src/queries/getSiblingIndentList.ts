import {
  EElement,
  EElementEntry,
  EElementOrText,
  isDefined,
  TEditor,
  TNode,
  TNodeEntry,
  Value,
} from '@udecode/plate-common';
import { KEY_INDENT } from '@udecode/plate-indent';
import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';

export interface GetSiblingIndentListOptions<
  N extends EElement<V>,
  V extends Value = Value
> {
  getPreviousEntry?: (
    entry: TNodeEntry<EElementOrText<V>>
  ) => TNodeEntry<N> | undefined;
  getNextEntry?: (
    entry: TNodeEntry<EElementOrText<V>>
  ) => TNodeEntry<N> | undefined;
  /**
   * Query to validate lookup. If false, check the next sibling.
   */
  query?: (siblingNode: TNode) => boolean | undefined;
  /**
   * Query to break lookup
   */
  eqIndent?: boolean;
  breakQuery?: (siblingNode: TNode) => boolean | undefined;
  breakOnLowerIndent?: boolean;
  breakOnEqIndentNeqListStyleType?: boolean;
}

/**
 * Get the next sibling indent list node.
 * Default query: the sibling node should have the same listStyleType.
 */
export const getSiblingIndentList = <
  N extends EElement<V>,
  V extends Value = Value
>(
  editor: TEditor<V>,
  [node, path]: EElementEntry<V>,
  {
    getPreviousEntry,
    getNextEntry,
    query,
    eqIndent = true,
    breakQuery,
    breakOnLowerIndent = true,
    breakOnEqIndentNeqListStyleType = true,
  }: GetSiblingIndentListOptions<N, V>
): TNodeEntry<N> | undefined => {
  if (!getPreviousEntry && !getNextEntry) return;

  const getSiblingEntry = getNextEntry ?? getPreviousEntry!;

  let nextEntry = getSiblingEntry([node, path]);

  while (true) {
    if (!nextEntry) return;

    const [nextNode, nextPath] = nextEntry;

    const indent = node[KEY_INDENT] as number;
    const nextIndent = nextNode[KEY_INDENT] as number;

    if (!isDefined(nextIndent)) return;

    if (breakQuery && breakQuery(nextNode)) return;

    if (breakOnLowerIndent && nextIndent < indent) return;
    if (
      breakOnEqIndentNeqListStyleType &&
      nextIndent === indent &&
      nextNode[KEY_LIST_STYLE_TYPE] !== node[KEY_LIST_STYLE_TYPE]
    )
      return;

    let valid = !query || query(nextNode as TNode);
    if (valid) {
      valid = !eqIndent || nextIndent === indent;
      if (valid) return [nextNode, nextPath];
    }

    nextEntry = getSiblingEntry(nextEntry);
  }
};
