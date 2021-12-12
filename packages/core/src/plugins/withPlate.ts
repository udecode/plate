import { PlateEditor } from '../types/PlateEditor';
import { TEditor } from '../types/slate/TEditor';
import {
  setPlatePlugins,
  SetPlatePluginsOptions,
} from '../utils/setPlatePlugins';

export interface WithPlateOptions<T = {}> extends SetPlatePluginsOptions<T> {
  /**
   * A unique id used to store the editor state by id.
   * Required if rendering multiple `Plate`. Optional otherwise.
   * Default is `'main'`.
   */
  id?: string;
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
  { id = 'main', plugins = [], disableCorePlugins }: WithPlateOptions<T> = {}
): PlateEditor<T> => {
  let editor = (e as any) as PlateEditor<T>;

  editor.id = id as string;

  if (!editor.key) {
    editor.key = Math.random();
  }

  setPlatePlugins(editor, {
    plugins,
    disableCorePlugins,
  });

  // withOverrides
  editor.plugins.forEach((plugin) => {
    if (plugin.withOverrides) {
      editor = plugin.withOverrides(editor, plugin);
    }
  });

  return editor;
};
