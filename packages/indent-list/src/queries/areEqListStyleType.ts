import { TEditor, TNodeEntry, Value } from '@udecode/plate-common/server';

import {
  KEY_LIST_CHECKED,
  KEY_LIST_STYLE_TYPE,
  KEY_TODO_STYLE_TYPE,
} from '../createIndentListPlugin';
import { ListStyleType } from '../types';

export const areEqListStyleType = <V extends Value>(
  editor: TEditor<V>,
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
      !block[KEY_LIST_STYLE_TYPE] ||
      block[KEY_LIST_STYLE_TYPE] !== listStyleType
    ) {
      eqListStyleType = false;
      break;
    }
  }

  return eqListStyleType;
};
