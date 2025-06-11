import type { Editor, NodeEntry } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

import { ListStyleType } from '../types';

export const areEqListStyleType = (
  editor: Editor,
  entries: NodeEntry[],
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  let eqListStyleType = true;

  for (const entry of entries) {
    const [block] = entry;

    if (listStyleType === KEYS.listTodo) {
      if (!block.hasOwnProperty(KEYS.listChecked)) {
        eqListStyleType = false;

        break;
      }

      continue;
    }
    if (!block[KEYS.listType] || block[KEYS.listType] !== listStyleType) {
      eqListStyleType = false;

      break;
    }
  }

  return eqListStyleType;
};
