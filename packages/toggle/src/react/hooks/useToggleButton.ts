import { useEditorPlugin, usePluginOption } from '@udecode/plate/react';

import { BaseTogglePlugin } from '../../lib';

export const useToggleButtonState = (toggleId: string) => {
  const openIds = usePluginOption(BaseTogglePlugin, 'openIds')!;

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
