import { useEffect, useMemo } from 'react';
import { useEditorRef } from '../hooks';
import {
  PlateId,
  usePlateStore,
  useRedecorate,
  useResetPlateEditor,
} from '../stores';
import { EXPOSED_STORE_KEYS } from '../types/PlateStore';

export const EditorMethodsEffect = ({ id }: { id?: PlateId }) => {
  const editor = useEditorRef();
  const resetEditor = useResetPlateEditor(id);
  const redecorate = useRedecorate(id);

  const plateStore = usePlateStore(id);

  // Must be in a scope where hooks can be called.
  const storeSetters = Object.fromEntries(
    EXPOSED_STORE_KEYS.map((key) => [key, plateStore.set[key]()])
  ) as any;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memorizedStoreSetters = useMemo(() => storeSetters, []);

  useEffect(() => {
    editor.reset = resetEditor;
    editor.redecorate = redecorate;
    editor.plate = {
      set: memorizedStoreSetters,
    };
  }, [editor, resetEditor, redecorate, memorizedStoreSetters]);

  return null;
};
