import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { createEditorPlugins } from 'plugins/common/helpers/createEditorPlugins';
import { FormatPlugin } from '../richtext/FormatPlugin';
import { ForcedLayoutPlugin } from './ForcedLayoutPlugin';

export const plugins = [ForcedLayoutPlugin(), FormatPlugin()];

export const editorPlugins = createEditorPlugins(
  [withReact, withHistory],
  plugins
);
