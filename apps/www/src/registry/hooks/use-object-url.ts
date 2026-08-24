'use client';

import * as React from 'react';

const getServerSnapshot = () => null;

function createObjectUrlStore(source: Blob | null) {
  let snapshot: string | null = null;

  return {
    getSnapshot: () => snapshot,
    subscribe: (onStoreChange: () => void) => {
      if (!source) return () => {};

      const url = URL.createObjectURL(source);

      snapshot = url;
      onStoreChange();

      return () => {
        URL.revokeObjectURL(url);

        if (snapshot === url) snapshot = null;
      };
    },
  };
}

export function useObjectUrl(source: Blob | null) {
  const store = React.useMemo(() => createObjectUrlStore(source), [source]);

  return React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    getServerSnapshot
  );
}
