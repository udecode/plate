import React from 'react';

import type { JotaiStore } from 'jotai-x';

import { type Atom, atom } from 'jotai';

import { createAtomStore, useStoreAtomValue } from '../../libs';

const {
  PlateControllerProvider: PlateController,
  plateControllerStore,
  usePlateControllerStore: _usePlateControllerStore,
} = createAtomStore(
  {
    activeId: atom<string | null>(null),
    editorStores: atom<Record<string, JotaiStore | null>>({}),
    primaryEditorIds: atom<string[]>([]),
  },
  {
    name: 'plateController',
  }
);

export { PlateController, plateControllerStore };

export const usePlateControllerLocalStore: typeof _usePlateControllerStore = (
  options
) =>
  _usePlateControllerStore({
    scope: typeof options === 'string' ? options : undefined,
    warnIfNoStore: false,
    ...(typeof options === 'object' ? options : {}),
  });

// export const usePlateControllerStore = (options?: UsePlateControllerStoreOptions) =>
//   _usePlateControllerStore(options);

export const usePlateControllerExists = () =>
  !!usePlateControllerLocalStore().store;

/**
 * Retrieve from PlateController the JotaiStore for the editor with a given ID,
 * or the active editor if no ID is provided, or the first primary editor if no
 * editor is active, or null.
 */
export const usePlateControllerStore = (idProp?: string): JotaiStore | null => {
  const storeAtom: Atom<JotaiStore | null> = React.useMemo(
    () =>
      atom((get) => {
        const editorStores = get(plateControllerStore.atom.editorStores);

        const forId = (id: string | null): JotaiStore | null => {
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

  return useStoreAtomValue(usePlateControllerLocalStore(), storeAtom);
};
