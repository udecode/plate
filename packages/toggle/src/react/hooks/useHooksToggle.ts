import { useEffect } from 'react';

import type { UseHooks } from '@udecode/plate-common/react';

import type { ToggleConfig } from '../TogglePlugin';

import {
  useToggleControllerStore,
  useToggleIndex,
} from '../toggle-controller-store';

export const useHooksToggle: UseHooks<ToggleConfig> = ({
  editor,
  getOptions,
}) => {
  const [openIds, setOpenIds] = useToggleControllerStore().use.openIds();
  const toggleIndex = useToggleIndex();

  // This is hacky
  // TODO a JOTAI layer in plate-core instead of relying on plugin options
  useEffect(() => {
    getOptions().openIds = openIds;
    getOptions().setOpenIds = setOpenIds;
    getOptions().toggleIndex = toggleIndex;
  }, [editor, openIds, getOptions, setOpenIds, toggleIndex]);
};
