import {
  ParagraphPlugin,
  type PlateEditor,
  insertNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { TColumnGroupElement } from '../types';

import { ColumnItemPlugin, ColumnPlugin } from '../ColumnPlugin';

export const insertColumnGroup = (editor: PlateEditor) => {
  withoutNormalizing(editor, () => {
    insertNodes<TColumnGroupElement>(editor, {
      children: [
        {
          children: [{ children: [{ text: '' }], type: ParagraphPlugin.key }],
          type: ColumnItemPlugin.key,
          width: '50%',
        },
        {
          children: [{ children: [{ text: '' }], type: ParagraphPlugin.key }],
          type: ColumnItemPlugin.key,
          width: '50%',
        },
      ],
      layout: [50, 50],
      type: ColumnPlugin.key,
    });
  });
};
