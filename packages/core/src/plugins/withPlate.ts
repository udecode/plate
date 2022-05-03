import { PlateProps } from '../components/Plate';
import { TEditor, Value } from '../slate/types/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { setPlatePlugins } from '../utils/setPlatePlugins';

export interface WithPlateOptions<V extends Value, T = {}>
  extends Pick<PlateProps<V, T>, 'id' | 'disableCorePlugins' | 'plugins'> {}

/**
 * Apply `withInlineVoid` and all plate plugins `withOverrides`.
 * Overrides:
 * - `id`: id of the editor.
 * - `key`: random key for the <Slate> component so each time the editor is created, the component resets.
 * - `options`: Plate options
 */
export const withPlate = <V extends Value, T = {}>(
  e: TEditor<V>,
  { id = 'main', plugins = [], disableCorePlugins }: WithPlateOptions<V, T> = {}
): PlateEditor<V, T> => {
  let editor = (e as any) as PlateEditor<V, T>;

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
      editor = plugin.withOverrides(editor, plugin) as any;
    }
  });

  return editor;
};
