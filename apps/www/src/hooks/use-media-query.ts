import * as React from 'react';

const getServerSnapshot = () => false;

export function useMediaQuery(query: string) {
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const result = matchMedia(query);
      result.addEventListener('change', onStoreChange);

      return () => result.removeEventListener('change', onStoreChange);
    },
    [query]
  );

  const getSnapshot = React.useCallback(() => {
    const result = matchMedia(query);

    return result.matches;
  }, [query]);

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
