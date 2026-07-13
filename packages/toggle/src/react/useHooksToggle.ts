import { useEffect } from 'react';

import type { PlatePluginContext } from '@platejs/core/react';

import type { ToggleConfig } from './TogglePlugin';

import { useToggleIndex } from './toggleIndexAtom';

export const useHooksToggle = (
  setOption: PlatePluginContext<ToggleConfig>['setOption']
) => {
  const toggleIndex = useToggleIndex();

  useEffect(() => {
    setOption('toggleIndex', toggleIndex);
  }, [setOption, toggleIndex]);
};
