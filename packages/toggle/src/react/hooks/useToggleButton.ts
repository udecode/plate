import { useEditorPlugin } from '@udecode/plate-common/react';

import { TogglePlugin } from '../../lib';

export const useToggleButtonState = (toggleId: string) => {
  const { useOption } = useEditorPlugin(TogglePlugin);
  const openIds = useOption('openIds')!;

  return {
    open: openIds.has(toggleId),
    toggleId,
  };
};

export const useToggleButton = (
  state: ReturnType<typeof useToggleButtonState>
) => {
  const { api } = useEditorPlugin(TogglePlugin);

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
