import type { SlateEditor } from '@udecode/plate-common';

import {
  BaseBulletedListPlugin,
  BaseNumberedListPlugin,
} from '../BaseListPlugin';

export const getListTypes = (editor: SlateEditor) => {
  return [
    editor.getType(BaseNumberedListPlugin),
    editor.getType(BaseBulletedListPlugin),
  ];
};
