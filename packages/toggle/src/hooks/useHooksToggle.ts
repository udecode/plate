import { useEffect } from 'react';
import { getPluginOptions, PlateEditor, Value } from '@udecode/plate-common';

import { useToggleControllerStore } from '../store';
import { ELEMENT_TOGGLE, TogglePlugin } from '../types';

export const useHooksToggle = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
) => {
  const [openIds, setOpenIds] = useToggleControllerStore().use.openIds();

  useEffect(() => {
    const options = getPluginOptions<TogglePlugin, V, E>(
      editor,
      ELEMENT_TOGGLE
    );
    options.openIds = openIds;
    options.setOpenIds = setOpenIds;
  }, [openIds, setOpenIds]);
};
