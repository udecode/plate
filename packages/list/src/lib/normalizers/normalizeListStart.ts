import {
  type Editor,
  type ElementEntryOf,
  type ElementOf,
  type NodeEntry,
  isDefined,
  KEYS,
} from 'platejs';

import type { GetSiblingListOptions } from '../queries/getSiblingList';

import { getPreviousList } from '../queries/getPreviousList';
import { ULIST_STYLE_TYPES } from '../types';

export const getListExpectedListStart = (
  entry: NodeEntry,
  prevEntry?: NodeEntry
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

export const normalizeListStart = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  entry: ElementEntryOf<E>,
  options?: Partial<GetSiblingListOptions<N, E>>
) =>
  editor.tf.withoutNormalizing(() => {
    const [node, path] = entry;
    const listStyleType = (node as any)[KEYS.listType];
    const listStart = node[KEYS.listStart] as number | undefined;

    if (!listStyleType) return;

    if (ULIST_STYLE_TYPES.includes(listStyleType)) {
      if (isDefined(listStart)) {
        editor.tf.unsetNodes(KEYS.listStart, { at: path });

        return true;
      }

      return;
    }

    const prevEntry = getPreviousList(editor, entry, {
      breakOnEqIndentNeqListStyleType: false,
      query: (nextNode, curNode) =>
        (nextNode as any)[KEYS.listType] === (curNode as any)[KEYS.listType],
      ...options,
    });
    const expectedListStart = getListExpectedListStart(entry, prevEntry);

    if (isDefined(listStart) && expectedListStart === 1) {
      editor.tf.unsetNodes(KEYS.listStart, { at: path });

      return true;
    }

    if (listStart !== expectedListStart && expectedListStart > 1) {
      editor.tf.setNodes({ [KEYS.listStart]: expectedListStart }, { at: path });

      return true;
    }

    return false;
  });
