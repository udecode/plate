import { createPluginFactory } from '@udecode/plate-core';

export const EDITABLE_VOID = 'editable-void';

export const createEditableVoidPlugin = createPluginFactory({
  key: EDITABLE_VOID,
  isElement: true,
  isVoid: true,
});
