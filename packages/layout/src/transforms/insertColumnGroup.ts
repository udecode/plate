import {
  ELEMENT_DEFAULT,
  type PlateEditor,
  type Value,
  insertNodes,
  withoutNormalizing,
} from '@udecode/plate-common/server';

import type { TColumnGroupElement } from '../types';

import { ELEMENT_COLUMN, ELEMENT_COLUMN_GROUP } from '../createColumnPlugin';

export const insertColumnGroup = <V extends Value>(editor: PlateEditor<V>) => {
  withoutNormalizing(editor, () => {
    insertNodes<TColumnGroupElement>(editor, {
      children: [
        {
          children: [{ children: [{ text: '' }], type: ELEMENT_DEFAULT }],
          type: ELEMENT_COLUMN,
          width: '50%',
        },
        {
          children: [{ children: [{ text: '' }], type: ELEMENT_DEFAULT }],
          type: ELEMENT_COLUMN,
          width: '50%',
        },
      ],
      layout: [50, 50],
      type: ELEMENT_COLUMN_GROUP,
    });
  });
};
