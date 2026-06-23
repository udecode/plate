import type { Node, NodeEntry } from '@platejs/slate';
import type { SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import { ListStyleType } from '../types';

export const areEqListStyleType = (
  _editor: SlateEditor,
  entries: NodeEntry<Node>[],
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  let eqListStyleType = true;

  for (const entry of entries) {
    const [block] = entry;
    const blockProps = block as Record<string, unknown>;

    if (listStyleType === KEYS.listTodo) {
      if (!Object.hasOwn(blockProps, KEYS.listChecked)) {
        eqListStyleType = false;

        break;
      }

      continue;
    }
    if (
      !blockProps[KEYS.listType] ||
      blockProps[KEYS.listType] !== listStyleType
    ) {
      eqListStyleType = false;

      break;
    }
  }

  return eqListStyleType;
};
