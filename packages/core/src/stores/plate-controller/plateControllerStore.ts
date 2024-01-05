import React from 'react';
import { atom, Atom } from 'jotai';
import { JotaiStore } from 'jotai-x';

import { createAtomStore } from '../../libs/jotai';
import { PlateId } from '../plate';

export const {
  plateControllerStore,
  usePlateControllerStore,
  PlateControllerProvider: PlateController,
} = createAtomStore(
  {
    activeId: atom(null as PlateId | null),
    primaryEditorIds: atom([] as PlateId[]),
    editorStores: atom({} as Record<PlateId, JotaiStore | null>),
  },
  {
    name: 'plateController',
  }
);

export const usePlateControllerSelectors = () => usePlateControllerStore().get;
export const usePlateControllerActions = () => usePlateControllerStore().set;
export const usePlateControllerStates = () => usePlateControllerStore().use;
export const usePlateControllerExists = () =>
  !!usePlateControllerStore().store({ warnIfNoStore: false });

/**
 * Retrieve from PlateController the JotaiStore for the editor with a given
 * ID, or the active editor if no ID is provided, or the first primary editor
 * if no editor is active, or null.
 */
export const usePlateControllerEditorStore = (
  idProp?: PlateId
): JotaiStore | null => {
  const storeAtom: Atom<JotaiStore | null> = React.useMemo(
    () =>
      atom((get) => {
        const editorStores = get(plateControllerStore.atom.editorStores);

        const forId = (id: PlateId | null): JotaiStore | null => {
          if (!id) return null;
          return editorStores[id] ?? null;
        };

        if (idProp) return forId(idProp);

        const lookupOrder = [
          get(plateControllerStore.atom.activeId),
          ...get(plateControllerStore.atom.primaryEditorIds),
        ];

        for (const id of lookupOrder) {
          const store = forId(id);
          if (store) return store;
        }

        return null;
      }),
    [idProp]
  );

  return usePlateControllerSelectors().atom(storeAtom);
};
