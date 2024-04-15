import React from 'react';
import { focusAtom } from 'jotai-optics';
import { useFocused } from 'slate-react';

import {
  plateControllerStore,
  usePlateControllerActions,
  usePlateId,
  usePlateSelectors,
  usePlateStore,
} from '../stores';

export interface PlateControllerEffectProps {
  id?: string;
}

export const PlateControllerEffect = ({
  id: idProp,
}: PlateControllerEffectProps) => {
  const idFromStore = usePlateId();
  const id = idProp ?? idFromStore;

  const currentStoreAtom = React.useMemo(
    () =>
      focusAtom(plateControllerStore.atom.editorStores, (optic) =>
        optic.prop(id)
      ),
    [id]
  );
  const setCurrentStore = usePlateControllerActions().atom(currentStoreAtom, {
    warnIfNoStore: false,
  });
  const store = usePlateStore(id).store();

  const primary = usePlateSelectors(id).primary();
  const setPrimaryEditorIds = usePlateControllerActions().primaryEditorIds({
    warnIfNoStore: false,
  });

  const focused = useFocused();
  const setActiveId = usePlateControllerActions().activeId({
    warnIfNoStore: false,
  });

  React.useEffect(() => {
    setCurrentStore(store ?? null);

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
