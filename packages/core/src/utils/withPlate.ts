import { createHistoryPlugin } from '../plugins/createHistoryPlugin';
import { withInlineVoid } from '../plugins/createInlineVoidPlugin';
import { createReactPlugin } from '../plugins/createReactPlugin';
import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';
import { WithOverride } from '../types/PlatePlugin/WithOverride';
import {
  PlatePluginComponent,
  PlatePluginOptions,
  PluginKey,
} from '../types/PlatePluginOptions/PlateOptions';
import { SPEditor } from '../types/SPEditor';
import { TEditor } from '../types/TEditor';
import { flatMapByKey } from './flatMapByKey';
import { pipe } from './pipe';

export interface WithPlateOptions<T extends SPEditor = SPEditor> {
  id?: string | null;
  plugins?: PlatePlugin<T>[];
  options?: Record<PluginKey, Partial<PlatePluginOptions>>;
  components?: Record<string, PlatePluginComponent>;
}

/**
 * Apply `withInlineVoid` and all plate plugins `withOverrides`.
 * Overrides:
 * - `id`: id of the editor.
 * - `key`: random key for the <Slate> component so each time the editor is created, the component resets.
 * - `options`: Plate options
 */
export const withPlate = <T extends SPEditor = SPEditor>({
  id = 'main',
  plugins = [createReactPlugin(), createHistoryPlugin()],
  options = {},
  components = {},
}: WithPlateOptions<T> = {}): WithOverride<TEditor, T> => (e) => {
  let editor = e as typeof e & T;
  editor.id = id as string;

  if (components) {
    // Merge components into options
    Object.keys(components).forEach((key) => {
      options[key] = {
        component: components[key],
        ...(options[key] as any),
      };
    });
  }

  // Default option type is the plugin key
  Object.keys(options).forEach((key) => {
    if (options[key]!.type === undefined) options[key]!.type = key;
  });
  editor.options = options;

  if (!editor.key) {
    editor.key = Math.random();
  }

  const _plugins: PlatePlugin<T>[] = [
    ...plugins,
    {
      withOverrides: withInlineVoid({ plugins }),
    },
  ];

  // Plugins withOverrides
  const withOverrides = flatMapByKey(_plugins, 'withOverrides');
  editor = pipe(editor, ...withOverrides);

  return editor;
};
