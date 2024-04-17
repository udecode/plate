import {
  ELEMENT_DEFAULT,
  insertNodes,
  PlateEditor,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';

import { ELEMENT_COLUMN, ELEMENT_COLUMN_GROUP } from '../createLayoutPlugin';
import { TColumnGroupElement } from '../types';

export const insertColumnGroup = <V extends Value>(editor: PlateEditor<V>) => {
  withoutNormalizing(editor, () => {
    insertNodes<TColumnGroupElement>(editor, {
      type: ELEMENT_COLUMN_GROUP,
      layout: [50, 50],
      children: [
        {
          type: ELEMENT_COLUMN,
          width: '50%',
          children: [{ type: ELEMENT_DEFAULT, children: [{ text: '' }] }],
        },
        {
          type: ELEMENT_COLUMN,
          width: '50%',
          children: [{ type: ELEMENT_DEFAULT, children: [{ text: '' }] }],
        },
      ],
    });
  });
};
