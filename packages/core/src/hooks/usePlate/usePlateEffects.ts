import { useEffect, useRef } from 'react';
import { createEditor, Editor } from 'slate';
import { PlateProps } from '../../components/Plate';
import { withPlate } from '../../plugins/withPlate';
import {
  getPlateActions,
  platesActions,
  usePlateSelectors,
} from '../../stores/plate/platesStore';
import { usePlateEditorRef } from '../../stores/plate/selectors/usePlateEditorRef';
import { PlateEditor } from '../../types/PlateEditor';
import { PlatePlugin } from '../../types/plugins/PlatePlugin';
import { setPlatePlugins } from '../../utils/setPlatePlugins';
import { usePlateStoreEffects } from './usePlateStoreEffects';

/**
 * Effects to update the plate store from the options.
 * Dynamically updating the options will update the store state.
 */
export const usePlateEffects = <T = {}>({
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
}: PlateProps<T>) => {
  const editor = usePlateEditorRef<T>(id);
  const enabled = usePlateSelectors(id).enabled();
  const plugins = usePlateSelectors(id).plugins() as PlatePlugin<T>[];

  const prevEditor = useRef(editor);
  const prevPlugins = useRef(plugins);

  const plateActions = getPlateActions(id);

  // Clear the state on unmount.
  useEffect(
    () => () => {
      platesActions.unset(id);
    },
    [id]
  );

  // Set initial state on mount
  useEffect(() => {
    platesActions.set(id);
  }, [id]);

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
        (editorProp as PlateEditor) ??
          withPlate(createEditor(), {
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
      setPlatePlugins(editor, { plugins, disableCorePlugins });
      prevPlugins.current = plugins;
    }
  }, [plugins, editor, disableCorePlugins]);

  // Force editor normalization
  useEffect(() => {
    if (editor && normalizeInitialValue) {
      Editor.normalize(editor, { force: true });
    }
  }, [editor, normalizeInitialValue]);

  useEffect(() => {
    prevEditor.current = editor;
  }, [editor]);
};
