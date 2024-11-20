import React from 'react';

declare global {
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
      console.warn(
        'Detected multiple @udecode/plate-core instances!\n' +
          'Choose only one of these packages in your dependencies:\n' +
          '- @udecode/plate\n' +
          '- @udecode/plate-core\n' +
          '- @udecode/plate-common\n\n'
      );
    }
  }, [disabled]);
}
