import { createPlugin } from '@udecode/plate-core';
import { EDITABLE_VOID } from './defaults';

export const createEditableVoidPlugin = createPlugin({
  key: EDITABLE_VOID,
  isElement: true,
  isVoid: true,
});
