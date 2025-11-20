import React from 'react';

declare global {
  // biome-ignore lint/style/useConsistentTypeDefinitions: Global augmentation must be an interface per TypeScript specification
  interface Global {
    __PLATE_INSTANCES__?: number;
  }
}

function checkPlateInstances() {
  (globalThis as any).__PLATE_INSTANCES__ =
    ((globalThis as any).__PLATE_INSTANCES__ || 0) + 1;
}

checkPlateInstances();

export function usePlateInstancesWarn(disabled?: boolean) {
  React.useEffect(() => {
    if (
      !disabled &&
      (globalThis as any).__PLATE_INSTANCES__ &&
      (globalThis as any).__PLATE_INSTANCES__ > 1
    ) {
      console.warn('Detected multiple @platejs/core instances!');
    }
  }, [disabled]);
}
