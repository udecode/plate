import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { createEditorPlugins } from 'plugins/common/helpers/createEditorPlugins';
import { HighlightPlugin } from './HighlightPlugin';

export const plugins = [HighlightPlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);
