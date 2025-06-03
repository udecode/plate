import React from 'react';

export const useStableMemo = <T>(
  producer: () => T,
  deps?: React.DependencyList
): T => {
  const [value, setValue] = React.useState(producer);

  React.useLayoutEffect(() => {
    setValue(producer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
};
