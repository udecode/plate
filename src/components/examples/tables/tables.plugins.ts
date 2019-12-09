import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { createEditorPlugins } from 'plugins/common/helpers/createEditorPlugins';
import { TablePlugin } from './TablePlugin';

export const plugins = [TablePlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);
