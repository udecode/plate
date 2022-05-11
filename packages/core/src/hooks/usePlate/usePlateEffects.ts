import { useEffect, useRef } from 'react';
import { PlateProps } from '../../components/Plate';
import { withPlate } from '../../plugins/withPlate';
import { normalizeEditor } from '../../slate/editor/normalizeEditor';
import { Value } from '../../slate/editor/TEditor';
import {
  getPlateActions,
  usePlateSelectors,
} from '../../stores/plate/platesStore';
import { usePlateEditorRef } from '../../stores/plate/selectors/usePlateEditorRef';
import { PlateEditor } from '../../types/PlateEditor';
import { createTEditor } from '../../utils/createTEditor';
import { setPlatePlugins } from '../../utils/setPlatePlugins';
import { usePlateStoreEffects } from './usePlateStoreEffects';

/**
 * Effects to update the plate store from the options.
 * Dynamically updating the options will update the store state.
 */
export const usePlateEffects = <
  V extends Value,
  E extends PlateEditor<V> = PlateEditor<V>
>({
  id = 'main',
  editor: editorProp,
  initialValue,
  normalizeInitialValue,
  plugins: pluginsProp,
  disableCorePlugins,
  editableProps,
  onChange,
  value,
  enabled: enabledProp,
}: PlateProps<V, E>) => {
  const editor = usePlateEditorRef<V, E>(id);
  const enabled = usePlateSelectors(id).enabled();
  const plugins = usePlateSelectors<V>(id).plugins();

  const prevEditor = useRef(editor);
  const prevPlugins = useRef(plugins);

  const plateActions = getPlateActions<V, E>(id);

  // Set initialValue once
  useEffect(() => {
    initialValue && plateActions.value(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plateActions]);

  usePlateStoreEffects({
    editableProps,
    onChange,
    id,
    value,
    enabled: enabledProp,
    plugins: pluginsProp,
  });

  // Unset the editor if enabled gets false
  useEffect(() => {
    if (editor && !enabled) {
      plateActions.editor(null);
    }
  }, [enabled, editor, plateActions]);

  // Set the editor if enabled and editor are defined
  useEffect(() => {
    if (!editor && enabled) {
      plateActions.editor(
        editorProp ??
          withPlate(createTEditor() as E, {
            id,
            plugins: pluginsProp,
            disableCorePlugins,
          })
      );
    }
  }, [
    editorProp,
    id,
    plugins,
    editor,
    enabled,
    disableCorePlugins,
    plateActions,
    pluginsProp,
  ]);

  // Dynamic plugins
  useEffect(() => {
    if (
      editor &&
      prevEditor.current === editor &&
      prevPlugins.current !== plugins
    ) {
      setPlatePlugins<V>(editor, { plugins, disableCorePlugins });
      prevPlugins.current = plugins;
    }
  }, [plugins, editor, disableCorePlugins]);

  // Force editor normalization
  useEffect(() => {
    if (editor && normalizeInitialValue) {
      normalizeEditor(editor, { force: true });
    }
  }, [editor, normalizeInitialValue]);

  useEffect(() => {
    prevEditor.current = editor;
  }, [editor]);
};
