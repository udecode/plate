import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { createEditorPlugins } from 'plugins/common/helpers/createEditorPlugins';
import { FormatPlugin } from '../richtext/FormatPlugin';

export const plugins = [FormatPlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);
