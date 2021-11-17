import { useEffect, useRef } from 'react';
import { createEditor, Editor } from 'slate';
import { usePlateActions } from '../../stores/plate/plate.actions';
import { usePlateEditorRef } from '../../stores/plate/selectors/usePlateEditorRef';
import { usePlateEnabled } from '../../stores/plate/selectors/usePlateEnabled';
import { PlatePlugin } from '../../types/plugins/PlatePlugin';
import { UsePlateEffectsOptions } from '../../types/UsePlateEffectsOptions';
import { setPlatePlugins } from '../../utils/setPlatePlugins';
import { withPlate } from '../../utils/withPlate';

/**
 * Effects to update the plate store from the options.
 * Dynamically updating the options will update the store state.
 */
export const usePlateEffects = <T = {}>({
  id = 'main',
  value,
  editor: editorProp,
  enabled: enabledProp = true,
  initialValue,
  normalizeInitialValue,
  plugins,
}: UsePlateEffectsOptions<T>) => {
  const {
    setInitialState,
    setValue,
    setEditor,
    setEnabled,
    clearState,
  } = usePlateActions(id);
  const enabled = usePlateEnabled(id);
  const editor = usePlateEditorRef<T>(id);
  const prevEditorRef = useRef(editor);

  // Clear the state on unmount.
  useEffect(
    () => () => {
      clearState();
    },
    [clearState, id]
  );

  // Set initial state on mount
  useEffect(() => {
    setInitialState({
      enabled: true,
      value: [],
    });
  }, [id, setInitialState]);

  // Set initialValue once
  useEffect(() => {
    initialValue && setValue(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue]);

  // Slate.value
  useEffect(() => {
    value && setValue(value);

    !initialValue && !value && setValue([{ children: [{ text: '' }] }]);
  }, [initialValue, setValue, value]);

  // Dynamic enabled
  useEffect(() => {
    setEnabled(enabledProp);
  }, [enabledProp, setEnabled]);

  // Unset the editor if enabled gets false
  useEffect(() => {
    if (editor && !enabled) {
      setEditor(undefined);
    }
  }, [enabled, editor, setEditor]);

  // Set the editor if enabled and editor are defined
  useEffect(() => {
    if (!editor && enabled && plugins) {
      const baseEditor = editorProp ?? createEditor();

      setEditor(
        withPlate(baseEditor as any, {
          id,
          plugins: plugins as PlatePlugin[],
        })
      );
    }
  }, [editorProp, id, plugins, setEditor, editor, enabled]);

  // Dynamic plugins, no called when setting the editor
  useEffect(() => {
    const hasEditorUpdated = prevEditorRef.current === editor;
    if (editor && hasEditorUpdated && plugins) {
      setPlatePlugins(editor, plugins);
    }
  }, [plugins, editor]);

  // Force editor normalization
  useEffect(() => {
    if (editor && normalizeInitialValue) {
      Editor.normalize(editor, { force: true });
    }
  }, [editor, normalizeInitialValue]);

  // Store previous editor
  useEffect(() => {
    prevEditorRef.current = editor;
  }, [editor]);
};
