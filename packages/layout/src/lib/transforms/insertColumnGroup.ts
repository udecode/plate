import {
  BaseParagraphPlugin,
  type SlateEditor,
  insertNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { TColumnGroupElement } from '../types';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';

export const insertColumnGroup = (editor: SlateEditor) => {
  withoutNormalizing(editor, () => {
    insertNodes<TColumnGroupElement>(editor, {
      children: [
        {
          children: [
            { children: [{ text: '' }], type: BaseParagraphPlugin.key },
          ],
          type: BaseColumnItemPlugin.key,
          width: '50%',
        },
        {
          children: [
            { children: [{ text: '' }], type: BaseParagraphPlugin.key },
          ],
          type: BaseColumnItemPlugin.key,
          width: '50%',
        },
      ],
      layout: [50, 50],
      type: BaseColumnPlugin.key,
    });
  });
};
