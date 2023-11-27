import { useEffect, useMemo } from 'react';

import { PlateId, useEditorRef, usePlateStore, useRedecorate } from '../stores';
import { EXPOSED_STORE_KEYS } from '../types/PlateStore';

export const EditorMethodsEffect = ({ id }: { id?: PlateId }) => {
  const editor = useEditorRef(id);
  const redecorate = useRedecorate(id);

  const plateStore = usePlateStore();

  // Must be in a scope where hooks can be called.
  const storeSetters = Object.fromEntries(
    EXPOSED_STORE_KEYS.map((key) => [key, plateStore.set[key]({ scope: id })])
  ) as any;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memorizedStoreSetters = useMemo(() => storeSetters, []);

  useEffect(() => {
    editor.redecorate = redecorate;
    editor.plate = {
      set: memorizedStoreSetters,
    };
  }, [editor, redecorate, memorizedStoreSetters]);

  return null;
};
