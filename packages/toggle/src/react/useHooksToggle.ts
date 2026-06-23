import { useEffect } from 'react';

import { useToggleIndex } from './toggleIndexAtom';

type ToggleHooksContext = {
  setOption: (
    key: 'toggleIndex',
    value: ReturnType<typeof useToggleIndex>
  ) => void;
};

export const useHooksToggle = ({ setOption }: ToggleHooksContext) => {
  const toggleIndex = useToggleIndex();

  useEffect(() => {
    setOption('toggleIndex', toggleIndex);
  }, [setOption, toggleIndex]);
};
