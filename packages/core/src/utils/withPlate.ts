import { createHistoryPlugin } from '../plugins/createHistoryPlugin';
import { createInlineVoidPlugin } from '../plugins/createInlineVoidPlugin';
import { createReactPlugin } from '../plugins/createReactPlugin';
import { setEventEditorId } from '../stores/event-editor/actions/setEventEditorId';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { TEditor } from '../types/slate/TEditor';
import { setPlatePlugins } from './setPlatePlugins';

export interface WithPlateOptions<T = {}> {
  id?: string | null;
  plugins?: PlatePlugin<T>[];
}

/**
 * Apply `withInlineVoid` and all plate plugins `withOverrides`.
 * Overrides:
 * - `id`: id of the editor.
 * - `key`: random key for the <Slate> component so each time the editor is created, the component resets.
 * - `options`: Plate options
 */
export const withPlate = <T = {}>(
  e: TEditor,
  {
    id = 'main',
    plugins = [createReactPlugin(), createHistoryPlugin()],
  }: WithPlateOptions<T> = {}
): PlateEditor<T> => {
  let editor = (e as any) as PlateEditor<T>;

  editor.id = id as string;

  if (!editor.key) {
    editor.key = Math.random();
  }

  setPlatePlugins(editor, [
    createInlineVoidPlugin(),
    {
      key: 'event-editor',
      onFocus: () => () => {
        setEventEditorId('focus', id);
      },
      onBlur: () => () => {
        setEventEditorId('blur', id);
      },
    },
    ...plugins,
  ]);

  // withOverrides
  editor.plugins.forEach((plugin) => {
    if (plugin.withOverrides) {
      editor = plugin.withOverrides(editor, plugin);
    }
  });

  return editor;
};
