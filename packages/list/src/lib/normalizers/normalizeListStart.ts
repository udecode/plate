import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  Element,
  NodeEntry,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { isDefined } from '@udecode/utils';

import type { GetSiblingListOptions } from '../queries/getSiblingList';

import { getListSequenceSiblingOptions } from '../internal/isSameListSequence';
import { getPreviousList } from '../queries/getPreviousList';
import { ULIST_STYLE_TYPES } from '../types';

export const getListExpectedListStart = (
  entry: NodeEntry<Element>,
  prevEntry?: NodeEntry<Element>
): number => {
  const [node] = entry;
  const [prevNode] = prevEntry ?? [null];

  const restart = (node[KEYS.listRestart] as number | null) ?? null;
  const restartPolite = (node[KEYS.listRestartPolite] as number | null) ?? null;

  if (restart) {
    return restart;
  }

  if (restartPolite && !prevNode) {
    return restartPolite;
  }

  if (prevNode) {
    const prevListStart = (prevNode[KEYS.listStart] as number) ?? 1;
    return prevListStart + 1;
  }

  return 1;
};

export const normalizeListStart = (
  editor: BaseEditor,
  tx: Pick<EditorUpdateTransaction, 'nodes'>,
  entry: NodeEntry<Element>,
  options?: Partial<GetSiblingListOptions<Element>>,
  previousEntry?: NodeEntry<Element> | null
) => {
  const [node, path] = entry;
  const listStyleType = node[KEYS.listType];
  const listStart = node[KEYS.listStart] as number | undefined;

  if (typeof listStyleType !== 'string') return false;

  if (
    ULIST_STYLE_TYPES.some(
      (unorderedListStyleType) => unorderedListStyleType === listStyleType
    )
  ) {
    if (isDefined(listStart)) {
      tx.nodes.unset(KEYS.listStart, { at: path });

      return true;
    }

    return;
  }

  const prevEntry =
    previousEntry === undefined
      ? getPreviousList(
          editor,
          entry,
          getListSequenceSiblingOptions(editor, {
            breakOnEqIndentNeqListStyleType: false,
            ...options,
          })
        )
      : (previousEntry ?? undefined);
  const expectedListStart = getListExpectedListStart(entry, prevEntry);

  if (isDefined(listStart) && expectedListStart === 1) {
    tx.nodes.unset(KEYS.listStart, { at: path });

    return true;
  }

  if (listStart !== expectedListStart && expectedListStart > 1) {
    tx.nodes.set({ [KEYS.listStart]: expectedListStart }, { at: path });

    return true;
  }

  return false;
};
