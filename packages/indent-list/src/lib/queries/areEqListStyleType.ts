import type { TEditor, TNodeEntry } from '@udecode/plate-common';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';
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

    if (listStyleType === INDENT_LIST_KEYS.todo) {
      if (!block.hasOwnProperty(INDENT_LIST_KEYS.checked)) {
        eqListStyleType = false;

        break;
      }

      continue;
    }
    if (
      !block[BaseIndentListPlugin.key] ||
      block[BaseIndentListPlugin.key] !== listStyleType
    ) {
      eqListStyleType = false;

      break;
    }
  }

  return eqListStyleType;
};
