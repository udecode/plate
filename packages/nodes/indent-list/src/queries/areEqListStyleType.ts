import { TEditor } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
import { ListStyleType } from '../types';

export const areEqListStyleType = (
  editor: TEditor,
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
