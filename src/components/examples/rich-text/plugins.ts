import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { BlockPlugin } from 'plugins/common/element/ElementPlugin';
import { createEditorPlugins } from 'plugins/common/helpers/createEditorPlugins';
import { MarkPlugin } from 'plugins/common/mark/MarkPlugin';

export const plugins = [BlockPlugin(), MarkPlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);
