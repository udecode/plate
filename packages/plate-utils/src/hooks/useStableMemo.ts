import { useState, useLayoutEffect, DependencyList } from 'react';

export const useStableMemo = <T>(producer: () => T, deps?: DependencyList): T => {
  const [value, setValue] = useState(producer);

  useLayoutEffect(() => {
    setValue(producer);
  }, deps);

  return value;
};
