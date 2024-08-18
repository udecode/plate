import { useEditorRef } from '@udecode/plate-common/react';

import {
  toggleIds,
  useToggleControllerStore,
} from '../toggle-controller-store';

export const useToggleButtonState = (toggleId: string) => {
  const [openIds] = useToggleControllerStore().use.openIds();

  return {
    open: openIds.has(toggleId),
    toggleId,
  };
};

export const useToggleButton = (
  state: ReturnType<typeof useToggleButtonState>
) => {
  const editor = useEditorRef();

  return {
    ...state,
    buttonProps: {
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        toggleIds(editor, [state.toggleId]);
      },
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
      },
    },
  };
};
