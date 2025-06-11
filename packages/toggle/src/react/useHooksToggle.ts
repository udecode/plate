import { useEffect } from 'react';

import type { UseHooks } from 'platejs/react';

import type { ToggleConfig } from './TogglePlugin';

import { useToggleIndex } from './toggleIndexAtom';

export const useHooksToggle: UseHooks<ToggleConfig> = ({
  editor,
  setOption,
}) => {
  const toggleIndex = useToggleIndex();

  useEffect(() => {
    setOption('toggleIndex', toggleIndex);
  }, [editor, setOption, toggleIndex]);
};
