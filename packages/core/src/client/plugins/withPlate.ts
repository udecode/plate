import { TEditor, Value } from '@udecode/slate';

import { resetEditor } from '../../shared/transforms';
import { PlateEditor } from '../../shared/types/PlateEditor';
import { setPlatePlugins } from '../utils/setPlatePlugins';

import type { PlateProps } from '../components';

const shouldHaveBeenOverridden = (fnName: string) => () => {
  console.warn(
    `editor.${fnName} should have been overriden but was not. Please report this issue here: https://github.com/udecode/plate/issues`
  );
};

export interface WithPlateOptions<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> extends Pick<
    PlateProps<V, E>,
    'disableCorePlugins' | 'plugins' | 'maxLength'
  > {
  id?: any;
}

/**
 * Apply `withInlineVoid` and all plate plugins `withOverrides`.
 * Overrides:
 * - `id`: id of the editor.
 * - `key`: random key for the <Slate> component so each time the editor is created, the component resets.
 * - `options`: Plate options
 */
export const withPlate = <
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>,
>(
  e: E,
  {
    id,
    plugins = [],
    disableCorePlugins,
    maxLength,
  }: WithPlateOptions<V, E & PlateEditor<V>> = {}
): E & PlateEditor<V> => {
  let editor = e as any as E & PlateEditor<V>;

  // Override incremental id generated by slate
  editor.id = id ?? editor.id;
  editor.prevSelection = null;
  editor.isFallback = false;
  editor.currentKeyboardEvent = null;

  // Editor methods
  editor.reset = () => resetEditor(editor);
  editor.redecorate = () => shouldHaveBeenOverridden('redecorate');
  editor.plate = {
    get set() {
      shouldHaveBeenOverridden('plate.set');
      return null as any;
    },
  };

  if (!editor.key) {
    editor.key = Math.random();
  }

  setPlatePlugins<V>(editor, {
    plugins: plugins as any,
    maxLength,
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