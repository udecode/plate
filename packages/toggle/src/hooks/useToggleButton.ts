import { useEditorRef } from '@udecode/plate-common';

import {
  toggleIds,
  useToggleControllerStore,
} from '../toggle-controller-store';

export const useToggleButtonState = (toggleId: string) => {
  const [openIds] = useToggleControllerStore().use.openIds();
  return {
    toggleId,
    open: openIds.has(toggleId),
  };
};

export const useToggleButton = (
  state: ReturnType<typeof useToggleButtonState>
) => {
  const editor = useEditorRef();
  return {
    ...state,
    buttonProps: {
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
      },
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        toggleIds(editor, [state.toggleId]);
      },
    },
  };
};
