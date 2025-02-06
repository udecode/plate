import React from 'react';

import type { WritableAtom } from 'jotai/vanilla/atom';

import { focusAtom } from 'jotai-optics';
import { type JotaiStore, useAtomStoreSet, useAtomStoreValue } from 'jotai-x';

import { useFocused } from '../slate-react';
import {
  plateControllerStore,
  useEditorId,
  usePlateControllerLocalStore,
  usePlateStore,
} from '../stores';

export interface PlateControllerEffectProps {
  id?: string;
}

export const PlateControllerEffect = ({
  id: idProp,
}: PlateControllerEffectProps) => {
  const idFromStore = useEditorId();
  const id = idProp ?? idFromStore;

  const currentStoreAtom = React.useMemo(
    () =>
      focusAtom(
        plateControllerStore.atom.editorStores as WritableAtom<
          Record<string, JotaiStore | null>,
          any,
          any
        >,
        (optic) => optic.prop(id)
      ),
    [id]
  );
  const setCurrentStore =
    usePlateControllerLocalStore().setAtom(currentStoreAtom);
  const store = usePlateStore(id);

  const primary = useAtomStoreValue(store, 'primary');
  const setPrimaryEditorIds = useAtomStoreSet(
    usePlateControllerLocalStore(),
    'primaryEditorIds'
  );

  const focused = useFocused();
  const setActiveId = useAtomStoreSet(
    usePlateControllerLocalStore(),
    'activeId'
  );

  React.useEffect(() => {
    setCurrentStore((store as any) ?? null);

    return () => {
      setCurrentStore(null);
      setActiveId((activeId) => (activeId === id ? null : activeId));
    };
  }, [store, setCurrentStore, setActiveId, id]);

  React.useEffect(() => {
    if (primary) {
      setPrimaryEditorIds((ids) => [...ids, id]);

      return () => {
        setPrimaryEditorIds((ids) => ids.filter((i) => i !== id));
      };
    }
  }, [id, primary, setPrimaryEditorIds]);

  React.useEffect(() => {
    if (id && focused) {
      setActiveId(id);
    }
  }, [id, focused, setActiveId]);

  return null;
};
