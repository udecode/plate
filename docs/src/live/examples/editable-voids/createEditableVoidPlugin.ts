import { createPlugin } from '@udecode/plate-core';

export const EDITABLE_VOID = 'editable-void';

export const createEditableVoidPlugin = createPlugin({
  key: EDITABLE_VOID,
  isElement: true,
  isVoid: true,
});
