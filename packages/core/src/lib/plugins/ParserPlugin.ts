import { createEditorPlugin } from '../plugin';

export const ParserPlugin = Object.assign(
  createEditorPlugin({
    key: 'parser',
  }),
  { runtimeParser: true }
);
