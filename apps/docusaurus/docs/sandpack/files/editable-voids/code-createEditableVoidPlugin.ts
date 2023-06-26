export const createEditableVoidPluginCode = `import { createPluginFactory } from '@udecode/plate';

export const EDITABLE_VOID = 'editable-void';

export const createEditableVoidPlugin = createPluginFactory({
  key: EDITABLE_VOID,
  isElement: true,
  isVoid: true,
});
`;

export const createEditableVoidPluginFile = {
  '/editable-voids/createEditableVoidPlugin.ts': createEditableVoidPluginCode,
};
