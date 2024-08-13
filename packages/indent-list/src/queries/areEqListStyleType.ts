import type { TEditor, TNodeEntry } from '@udecode/plate-common';

import {
  IndentListPlugin,
  KEY_LIST_CHECKED,
  KEY_TODO_STYLE_TYPE,
} from '../IndentListPlugin';
import { ListStyleType } from '../types';

export const areEqListStyleType = (
  editor: TEditor,
  entries: TNodeEntry[],
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  let eqListStyleType = true;

  for (const entry of entries) {
    const [block] = entry;

    if (listStyleType === KEY_TODO_STYLE_TYPE) {
      if (!block.hasOwnProperty(KEY_LIST_CHECKED)) {
        eqListStyleType = false;

        break;
      }

      continue;
    }
    if (
      !block[IndentListPlugin.key] ||
      block[IndentListPlugin.key] !== listStyleType
    ) {
      eqListStyleType = false;

      break;
    }
  }

  return eqListStyleType;
};
