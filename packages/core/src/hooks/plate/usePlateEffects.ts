import { useEffect, useRef } from 'react';
import { Value } from '../../slate/index';
import { usePlateSelectors, useUpdatePlateKey } from '../../stores/index';
import { usePlateEditorRef } from '../../stores/plate/selectors/usePlateEditorRef';
import { PlateEditor } from '../../types/index';
import { setPlatePlugins } from '../../utils/plate/setPlatePlugins';
import {
  usePlateStoreEffects,
  UsePlateStoreEffectsProps,
} from './usePlateStoreEffects';

export interface UsePlateEffectsProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> extends UsePlateStoreEffectsProps<V, E> {
  /**
   * If `true`, disable all the core plugins.
   * If an object, disable the core plugin properties that are `true` in the object.
   */
  disableCorePlugins?:
    | {
        deserializeAst?: boolean;
        deserializeHtml?: boolean;
        eventEditor?: boolean;
        inlineVoid?: boolean;
        insertData?: boolean;
        history?: boolean;
        react?: boolean;
        selection?: boolean;
      }
    | boolean;
}

/**
 * Effects to update the plate store from the options.
 * Dynamically updating the options will update the store state.
 */
export const usePlateEffects = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>({
  disableCorePlugins,
  ...storeProps
}: UsePlateEffectsProps<V, E>) => {
  const { id } = storeProps;

  const editor = usePlateEditorRef(id);
  const plugins = usePlateSelectors(id).plugins();
  const updateKeyPlugins = useUpdatePlateKey('keyPlugins', id);

  const prevEditor = useRef(editor);
  const prevPlugins = useRef(plugins);

  usePlateStoreEffects(storeProps);

  // Dynamic plugins
  useEffect(() => {
    if (
      editor &&
      prevEditor.current === editor &&
      prevPlugins.current !== plugins
    ) {
      setPlatePlugins(editor, { plugins, disableCorePlugins });
      updateKeyPlugins();
      prevPlugins.current = plugins;
    }
  }, [plugins, editor, disableCorePlugins, updateKeyPlugins]);

  useEffect(() => {
    prevEditor.current = editor;
  }, [editor]);
};
