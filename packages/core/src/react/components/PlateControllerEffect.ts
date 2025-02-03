import React from 'react';

import type { JotaiStore } from 'jotai-x';
import type { WritableAtom } from 'jotai/vanilla/atom';

import { focusAtom } from 'jotai-optics';

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

  const primary = usePlateStore(id).usePrimaryValue();
  const setPrimaryEditorIds =
    usePlateControllerLocalStore().useSetPrimaryEditorIds();

  const focused = useFocused();
  const setActiveId = usePlateControllerLocalStore().useSetActiveId();

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
