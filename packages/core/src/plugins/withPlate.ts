import { PlateProps } from '../components/plate/Plate';
import { TEditor, Value } from '../slate/editor/TEditor';
import { PlateEditor } from '../types/plate/PlateEditor';
import { setPlatePlugins } from '../utils/plate/setPlatePlugins';

export interface WithPlateOptions<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> extends Pick<PlateProps<V, E>, 'id' | 'disableCorePlugins' | 'plugins'> {}

/**
 * Apply `withInlineVoid` and all plate plugins `withOverrides`.
 * Overrides:
 * - `id`: id of the editor.
 * - `key`: random key for the <Slate> component so each time the editor is created, the component resets.
 * - `options`: Plate options
 */
export const withPlate = <
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>
>(
  e: E,
  {
    id = 'main',
    plugins = [],
    disableCorePlugins,
  }: WithPlateOptions<V, E & PlateEditor<V>> = {}
): E & PlateEditor<V> => {
  let editor = (e as any) as E & PlateEditor<V>;

  editor.id = id as string;
  editor.prevSelection = null;
  editor.lastKeyDown = null;

  if (!editor.key) {
    editor.key = Math.random();
  }

  setPlatePlugins(editor, {
    plugins: plugins as any,
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
