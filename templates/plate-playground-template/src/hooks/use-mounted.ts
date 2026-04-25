import * as React from 'react';

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useMounted() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
