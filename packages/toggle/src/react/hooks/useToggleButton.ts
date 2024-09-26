import { useEditorPlugin } from '@udecode/plate-common/react';

import { BaseTogglePlugin } from '../../lib';

export const useToggleButtonState = (toggleId: string) => {
  const { useOption } = useEditorPlugin(BaseTogglePlugin);
  const openIds = useOption('openIds')!;

  return {
    open: openIds.has(toggleId),
    toggleId,
  };
};

export const useToggleButton = (
  state: ReturnType<typeof useToggleButtonState>
) => {
  const { api } = useEditorPlugin(BaseTogglePlugin);

  return {
    ...state,
    buttonProps: {
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        api.toggle.toggleIds([state.toggleId]);
      },
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
      },
    },
  };
};
