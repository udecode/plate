import { DependencyList, useLayoutEffect, useState } from 'react';

export const useStableMemo = <T>(
  producer: () => T,
  deps?: DependencyList
): T => {
  const [value, setValue] = useState(producer);

  useLayoutEffect(() => {
    setValue(producer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
};
