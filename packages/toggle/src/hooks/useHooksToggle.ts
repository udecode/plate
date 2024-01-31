import { useEffect } from 'react';
import { getPluginOptions, PlateEditor, Value } from '@udecode/plate-common';

import {
  useToggleControllerStore,
  useToggleIndex,
} from '../toggle-controller-store';
import { ELEMENT_TOGGLE, TogglePlugin } from '../types';

export const useHooksToggle = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
) => {
  const [openIds, setOpenIds] = useToggleControllerStore().use.openIds();
  const toggleIndex = useToggleIndex();

  // This is hacky
  // TODO a JOTAI layer in plate-core instead of relying on plugin options
  useEffect(() => {
    const options = getPluginOptions<TogglePlugin, V, E>(
      editor,
      ELEMENT_TOGGLE
    );
    options.openIds = openIds;
    options.setOpenIds = setOpenIds;
    options.toggleIndex = toggleIndex;
  }, [editor, openIds, setOpenIds, toggleIndex]);
};
