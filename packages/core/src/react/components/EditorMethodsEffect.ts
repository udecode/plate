import React from 'react';

import { EXPOSED_STORE_KEYS } from '../../lib/types/PlateStore';
import {
  type PlateId,
  useEditorRef,
  usePlateStore,
  useRedecorate,
} from '../stores';

export const EditorMethodsEffect = ({ id }: { id?: PlateId }) => {
  const editor = useEditorRef(id);
  const redecorate = useRedecorate(id);

  const plateStore = usePlateStore(id);

  // Mu st be in a scope where hooks can be called.
  const storeSetters = Object.fromEntries(
    EXPOSED_STORE_KEYS.map((key) => [key, plateStore.set[key]()])
  ) as any;

  // es lint-disable-next-line react-hooks/exhaustive-deps
  const memorizedStoreSetters = React.useMemo(() => storeSetters, []);

  React.useEffect(() => {
    editor.redecorate = redecorate;
    editor.plate = {
      set: memorizedStoreSetters,
    };
  }, [editor, redecorate, memorizedStoreSetters]);

  return null;
};
