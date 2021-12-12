import { useEffect, useRef } from 'react';
import { createEditor, Editor } from 'slate';
import { withPlate } from '../../plugins/withPlate';
import {
  getPlateActions,
  platesActions,
  usePlateSelectors,
} from '../../stores/plate/platesStore';
import { usePlateEditorRef } from '../../stores/plate/selectors/usePlateEditorRef';
import { PlateEditor } from '../../types/PlateEditor';
import { PlatePlugin } from '../../types/plugins/PlatePlugin';
import { UsePlateEffectsOptions } from '../../types/UsePlateEffectsOptions';
import { setPlatePlugins } from '../../utils/setPlatePlugins';

/**
 * Effects to update the plate store from the options.
 * Dynamically updating the options will update the store state.
 */
export const usePlateEffects = <T = {}>({
  id = 'main',
  value: valueProp,
  editor: editorProp,
  enabled: enabledProp = true,
  initialValue,
  normalizeInitialValue,
  plugins,
  disableCorePlugins,
}: UsePlateEffectsOptions<T>) => {
  const plateActions = getPlateActions(id);
  const enabled = usePlateSelectors(id).enabled();
  const editor = usePlateEditorRef<T>(id);
  const prevPlugins = useRef(plugins);

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

  // Slate.value
  useEffect(() => {
    valueProp && plateActions.value(valueProp);
  }, [plateActions, valueProp]);

  // Dynamic enabled
  useEffect(() => {
    plateActions.enabled(enabledProp);
  }, [enabledProp, plateActions]);

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
            plugins: plugins as PlatePlugin[],
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
  ]);

  // Dynamic plugins
  useEffect(() => {
    if (editor && prevPlugins.current !== plugins) {
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
};
