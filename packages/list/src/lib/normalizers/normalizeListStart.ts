import type { Element, NodeEntry } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

import { isDefined, KEYS } from 'platejs';

import type { GetSiblingListOptions } from '../queries/getSiblingList';

import { getListSequenceSiblingOptions } from '../internal/isSameListSequence';
import { getPreviousList } from '../queries/getPreviousList';
import { ULIST_STYLE_TYPES } from '../types';

export const getListExpectedListStart = (
  entry: NodeEntry,
  prevEntry?: NodeEntry
): number => {
  const [node] = entry;
  const [prevNode] = prevEntry ?? [null];
  const nodeProps = node as Record<string, unknown>;
  const prevNodeProps = prevNode as Record<string, unknown> | null;

  const restart = (nodeProps[KEYS.listRestart] as number | null) ?? null;
  const restartPolite =
    (nodeProps[KEYS.listRestartPolite] as number | null) ?? null;

  if (restart) {
    return restart;
  }

  if (restartPolite && !prevNode) {
    return restartPolite;
  }

  if (prevNodeProps) {
    const prevListStart = (prevNodeProps[KEYS.listStart] as number) ?? 1;
    return prevListStart + 1;
  }

  return 1;
};

export const normalizeListStart = <N extends Element = Element>(
  editor: BasePlateEditor,
  entry: NodeEntry<Element>,
  options?: Partial<GetSiblingListOptions<N>>
) =>
  editor.update(
    (tx) => {
      const [node, path] = entry;
      const listStyleType = (node as any)[KEYS.listType];
      const listStart = (node as Record<string, unknown>)[KEYS.listStart] as
        | number
        | undefined;

      if (!listStyleType) return;

      if (ULIST_STYLE_TYPES.includes(listStyleType)) {
        if (isDefined(listStart)) {
          tx.nodes.unset(KEYS.listStart, { at: path });

          return true;
        }

        return;
      }

      const prevEntry = getPreviousList(
        editor,
        entry,
        getListSequenceSiblingOptions(editor, {
          breakOnEqIndentNeqListStyleType: false,
          ...options,
        })
      );
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
    },
    { skipNormalize: true }
  );
