import { createEditorPlugin } from '../../../plugin';

export const InputRulesPlugin = Object.assign(
  createEditorPlugin({
    editOnly: true,
    key: 'inputRules',
  }),
  { runtimeInputRules: true }
);
