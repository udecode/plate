import {
  type ElementEntryOf,
  type ElementOf,
  type ElementOrTextOf,
  type TEditor,
  type TNode,
  type TNodeEntry,
  isDefined,
} from '@udecode/plate-common';
import { BaseIndentPlugin } from '@udecode/plate-indent';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';

export interface GetSiblingIndentListOptions<
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
> {
  getNextEntry?: (
    entry: TNodeEntry<ElementOrTextOf<E>>
  ) => TNodeEntry<N> | undefined;
  getPreviousEntry?: (
    entry: TNodeEntry<ElementOrTextOf<E>>
  ) => TNodeEntry<N> | undefined;
  breakOnEqIndentNeqListStyleType?: boolean;
  breakOnListRestart?: boolean;
  breakOnLowerIndent?: boolean;
  breakQuery?: (siblingNode: TNode, currentNode: TNode) => boolean | undefined;
  /** Query to break lookup */
  eqIndent?: boolean;
  /** Query to validate lookup. If false, check the next sibling. */
  query?: (siblingNode: TNode, currentNode: TNode) => boolean | undefined;
}

/**
 * Get the next sibling indent list node. Default query: the sibling node should
 * have the same listStyleType.
 */
export const getSiblingIndentList = <
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
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
  }: GetSiblingIndentListOptions<N, E>
): TNodeEntry<N> | undefined => {
  if (!getPreviousEntry && !getNextEntry) return;

  const getSiblingEntry = getNextEntry ?? getPreviousEntry!;

  let nextEntry = getSiblingEntry([node, path]);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (!nextEntry) return;

    const [nextNode, nextPath] = nextEntry;

    const indent = (node as any)[BaseIndentPlugin.key] as number;
    const nextIndent = (nextNode as any)[BaseIndentPlugin.key] as number;

    if (breakQuery?.(nextNode, node)) return;
    if (!isDefined(nextIndent)) return;
    if (breakOnListRestart) {
      if (getPreviousEntry && (node as any)[INDENT_LIST_KEYS.listRestart]) {
        return;
      }
      if (getNextEntry && (nextNode as any)[INDENT_LIST_KEYS.listRestart]) {
        return;
      }
    }
    if (breakOnLowerIndent && nextIndent < indent) return;
    if (
      breakOnEqIndentNeqListStyleType &&
      nextIndent === indent &&
      (nextNode as any)[BaseIndentListPlugin.key] !==
        (node as any)[BaseIndentListPlugin.key]
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
