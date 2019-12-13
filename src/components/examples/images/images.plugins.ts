import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { createEditorPlugins } from 'plugins/common/helpers/createEditorPlugins';
import { ImagePlugin } from './ImagePlugin';

export const plugins = [ImagePlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);
