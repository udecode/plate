import React from 'react';

import type { WritableAtom } from 'jotai/vanilla/atom';

import { useStableFn } from '@udecode/react-utils';
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

  // Atom to set the store for the editor's ID
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

  const setCurrentStore = useStableFn(
    usePlateControllerLocalStore().setAtom(currentStoreAtom),
    [currentStoreAtom]
  );

  const setPrimaryEditorIds = useStableFn(
    useAtomStoreSet(usePlateControllerLocalStore(), 'primaryEditorIds')
  );

  const setActiveId = useStableFn(
    useAtomStoreSet(usePlateControllerLocalStore(), 'activeId')
  );

  const store = usePlateStore(id);
  const primary = useAtomStoreValue(store, 'primary');
  const focused = useFocused();

  // Keep the store up to date for the editor's ID
  React.useEffect(() => {
    setCurrentStore((store as any) ?? null);

    /**
     * On unmount or when the ID changes, unset the store for the old ID. If the
     * old ID was active, set the active ID to null. It is a bug if this code
     * runs at any other time, so the dependency array must be stable.
     */
    return () => {
      setCurrentStore(null);
      setActiveId((activeId) => (activeId === id ? null : activeId));
    };
  }, [store, setCurrentStore, setActiveId, id]);

  // If the editor is primary, register it in the list of primary editors
  React.useEffect(() => {
    if (primary) {
      setPrimaryEditorIds((ids) => [...ids, id]);

      return () => {
        setPrimaryEditorIds((ids) => ids.filter((i) => i !== id));
      };
    }
  }, [id, primary, setPrimaryEditorIds]);

  // Set the editor as active when it becomes focused
  React.useEffect(() => {
    if (id && focused) {
      setActiveId(id);
    }
  }, [id, focused, setActiveId]);

  return null;
};
