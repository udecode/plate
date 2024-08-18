import { useEffect } from 'react';

import type { PlatePluginUseHooks } from '@udecode/plate-common/react';

import type { ToggleConfig } from '../TogglePlugin';

import {
  useToggleControllerStore,
  useToggleIndex,
} from '../toggle-controller-store';

export const useHooksToggle: PlatePluginUseHooks<ToggleConfig> = ({
  editor,
  options,
}) => {
  const [openIds, setOpenIds] = useToggleControllerStore().use.openIds();
  const toggleIndex = useToggleIndex();

  // This is hacky
  // TODO a JOTAI layer in plate-core instead of relying on plugin options
  useEffect(() => {
    options.openIds = openIds;
    options.setOpenIds = setOpenIds;
    options.toggleIndex = toggleIndex;
  }, [editor, openIds, options, setOpenIds, toggleIndex]);
};
