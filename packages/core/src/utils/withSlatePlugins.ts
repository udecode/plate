import { createHistoryPlugin } from '../plugins/createHistoryPlugin';
import { withInlineVoid } from '../plugins/createInlineVoidPlugin';
import { createReactPlugin } from '../plugins/createReactPlugin';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { WithOverride } from '../types/SlatePlugin/WithOverride';
import {
  SlatePluginComponent,
  SlatePluginsOptions,
} from '../types/SlatePluginOptions/SlatePluginsOptions';
import { SPEditor } from '../types/SPEditor';
import { TEditor } from '../types/TEditor';
import { flatMapByKey } from './flatMapByKey';
import { pipe } from './pipe';

export interface WithSlatePluginsOptions<T extends SPEditor = SPEditor> {
  id?: string | null;
  plugins?: SlatePlugin<T>[];
  options?: SlatePluginsOptions;
  components?: Record<string, SlatePluginComponent>;
}

/**
 * Apply `withInlineVoid` and all slate plugins `withOverrides`.
 * Overrides:
 * - `id`: id of the editor.
 * - `key`: random key for the <Slate> component so each time the editor is created, the component resets.
 * - `options`: {@link SlatePluginsOptions}
 */
export const withSlatePlugins = <T extends SPEditor = SPEditor>({
  id = 'main',
  plugins = [createReactPlugin(), createHistoryPlugin()],
  options = {},
  components = {},
}: WithSlatePluginsOptions<T> = {}): WithOverride<TEditor, T> => (e) => {
  let editor = e as typeof e & T;
  editor.id = id as string;

  if (components) {
    // Merge components into options
    Object.keys(components).forEach((key) => {
      options[key] = {
        component: components[key],
        ...options[key],
      };
    });
  }

  // Default option type is the plugin key
  Object.keys(options).forEach((key) => {
    if (options[key].type === undefined) options[key].type = key;
  });
  editor.options = options;

  if (!editor.key) {
    editor.key = Math.random();
  }

  // Plugins inline and void types
  editor = pipe(editor, withInlineVoid({ plugins }));

  // Plugins withOverrides
  const withOverrides = flatMapByKey(plugins, 'withOverrides');
  editor = pipe(editor, ...withOverrides);

  return editor;
};
