import React from 'react';

declare global {
  var __PLATE_INSTANCES__: number | undefined;
}

globalThis.__PLATE_INSTANCES__ = (globalThis.__PLATE_INSTANCES__ ?? 0) + 1;

export function usePlateInstancesWarn(disabled?: boolean) {
  React.useEffect(() => {
    if (
      !disabled &&
      globalThis.__PLATE_INSTANCES__ &&
      globalThis.__PLATE_INSTANCES__ > 1
    ) {
      console.warn('Detected multiple platejs instances!');
    }
  }, [disabled]);
}
