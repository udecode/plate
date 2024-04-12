import {
  ELEMENT_DEFAULT,
  insertNodes,
  PlateEditor,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';

import { ELEMENT_LAYOUT, ELEMENT_LAYOUT_CHILD } from '../createLayoutPlugin';
import { TLayoutBlockElement } from '../layout-store';

export const insertLayout = <V extends Value>(editor: PlateEditor<V>) => {
  withoutNormalizing(editor, () => {
    insertNodes<TLayoutBlockElement>(editor, {
      type: ELEMENT_LAYOUT,
      children: [
        {
          type: ELEMENT_LAYOUT_CHILD,
          width: '50%',
          children: [{ type: ELEMENT_DEFAULT, children: [{ text: '' }] }],
        },
        {
          type: ELEMENT_LAYOUT_CHILD,
          width: '50%',
          children: [{ type: ELEMENT_DEFAULT, children: [{ text: '' }] }],
        },
      ],
    });
  });
};
