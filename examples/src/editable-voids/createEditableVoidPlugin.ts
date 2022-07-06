import { createPluginFactory } from '@udecode/plate';

export const EDITABLE_VOID = 'editable-void';

export const createEditableVoidPlugin = createPluginFactory({
  key: EDITABLE_VOID,
  isElement: true,
  isVoid: true,
});
