import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { createEditorPlugins } from 'plugins/common/helpers/createEditorPlugins';
import { MarkdownShortcutsPlugin } from './MarkdownShortcutsPlugin';

export const plugins = [MarkdownShortcutsPlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);
