import { PlateEditor, useEditorRef } from '@udecode/plate-common';
import { Value } from '@udecode/slate';

import { toggleToggleId } from '../store';
import { ToggleEditor } from '../types';

type ToggleButtonState = {
  toggleId: string;
  open: boolean;
  openIds: Set<string>;
};

const useToggleStore = () =>
  useEditorRef<Value, PlateEditor & ToggleEditor>().toggleStore;

export const useToggleButtonState = (toggleId: string): ToggleButtonState => {
  const store = useToggleStore();
  const openIds = store.use.openIds();
  const open = openIds.has(toggleId);
  return {
    toggleId,
    open,
    openIds,
  };
};

export const useToggleButton = (state: ToggleButtonState) => {
  const store = useToggleStore();
  return {
    ...state,
    buttonProps: {
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        store.set.openIds(toggleToggleId(state));
      },
    },
  };
};
