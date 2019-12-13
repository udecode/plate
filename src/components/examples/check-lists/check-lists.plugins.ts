import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { createEditorPlugins } from 'plugins/common/helpers/createEditorPlugins';
import { withFormat } from '../richtext/FormatPlugin';
import { CheckListPlugin } from './CheckListPlugin';

export const plugins = [CheckListPlugin()];

export const editorPlugins = createEditorPlugins(
  [withFormat, withReact, withHistory],
  plugins
);
