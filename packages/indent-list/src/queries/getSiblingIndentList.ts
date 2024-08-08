import {
  type EElement,
  type EElementEntry,
  type EElementOrText,
  type TEditor,
  type TNode,
  type TNodeEntry,
  type Value,
  isDefined,
} from '@udecode/plate-common/server';
import { KEY_INDENT } from '@udecode/plate-indent';

import { KEY_LIST_STYLE_TYPE } from '../IndentListPlugin';

export interface GetSiblingIndentListOptions<
  N extends EElement<V>,
  V extends Value = Value,
> {
  breakOnEqIndentNeqListStyleType?: boolean;
  breakOnLowerIndent?: boolean;
  breakQuery?: (siblingNode: TNode) => boolean | undefined;
  /** Query to break lookup */
  eqIndent?: boolean;
  getNextEntry?: (
    entry: TNodeEntry<EElementOrText<V>>
  ) => TNodeEntry<N> | undefined;
  getPreviousEntry?: (
    entry: TNodeEntry<EElementOrText<V>>
  ) => TNodeEntry<N> | undefined;
  /** Query to validate lookup. If false, check the next sibling. */
  query?: (siblingNode: TNode) => boolean | undefined;
}

/**
 * Get the next sibling indent list node. Default query: the sibling node should
 * have the same listStyleType.
 */
export const getSiblingIndentList = <
  N extends EElement<V>,
  V extends Value = Value,
>(
  editor: TEditor<V>,
  [node, path]: EElementEntry<V>,
  {
    breakOnEqIndentNeqListStyleType = true,
    breakOnLowerIndent = true,
    breakQuery,
    eqIndent = true,
    getNextEntry,
    getPreviousEntry,
    query,
  }: GetSiblingIndentListOptions<N, V>
): TNodeEntry<N> | undefined => {
  if (!getPreviousEntry && !getNextEntry) return;

  const getSiblingEntry = getNextEntry ?? getPreviousEntry!;

  let nextEntry = getSiblingEntry([node, path]);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (!nextEntry) return;

    const [nextNode, nextPath] = nextEntry;

    const indent = (node as any)[KEY_INDENT] as number;
    const nextIndent = (nextNode as any)[KEY_INDENT] as number;

    if (!isDefined(nextIndent)) return;
    if (breakQuery?.(nextNode)) return;
    if (breakOnLowerIndent && nextIndent < indent) return;
    if (
      breakOnEqIndentNeqListStyleType &&
      nextIndent === indent &&
      (nextNode as any)[KEY_LIST_STYLE_TYPE] !==
        (node as any)[KEY_LIST_STYLE_TYPE]
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
