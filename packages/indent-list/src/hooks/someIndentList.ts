import {
  type PlateEditor,
  type Value,
  someNode,
} from '@udecode/plate-common/server';

import { KEY_LIST_CHECKED, KEY_LIST_STYLE_TYPE, ListStyleType } from '../index';

export const someIndentList = <V extends Value>(
  editor: PlateEditor<V>,
  type: string
) => {
  return (
    !!editor.selection &&
    someNode(editor, {
      match: (n) => {
        const list = n[KEY_LIST_STYLE_TYPE];

        if ((type as any) === ListStyleType.Disc) {
          return list === ListStyleType.Disc;
        }

        const isHasProperty = n.hasOwnProperty(KEY_LIST_CHECKED);

        return !!list && list !== ListStyleType.Disc && !isHasProperty;
      },
    })
  );
};
