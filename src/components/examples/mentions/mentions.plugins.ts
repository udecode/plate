import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { createEditorPlugins } from 'plugins/common/helpers/createEditorPlugins';
import { MentionPlugin } from './MentionPlugin';

export const plugins = [MentionPlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);
