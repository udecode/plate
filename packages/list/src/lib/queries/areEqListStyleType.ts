import type { Editor, NodeEntry } from 'platejs';

import { KEYS } from 'platejs';

import { ListStyleType } from '../types';

export const areEqListStyleType = (
  _editor: Editor,
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
      if (!Object.hasOwn(block, KEYS.listChecked)) {
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
