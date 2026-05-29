import * as React from 'react';

const getServerSnapshot = () => false;

export function useMediaQuery(query: string) {
  const subscribe = (onStoreChange: () => void) => {
    const result = matchMedia(query);
    result.addEventListener('change', onStoreChange);

    return () => result.removeEventListener('change', onStoreChange);
  };

  const getSnapshot = () => {
    const result = matchMedia(query);

    return result.matches;
  };

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
