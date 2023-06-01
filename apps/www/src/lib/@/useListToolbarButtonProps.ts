import { ELEMENT_UL } from '@udecode/plate';
import {
  focusEditor,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-common';
import { toggleList } from '@udecode/plate-list';

import { someList } from '@/lib/@/someList';

export const useListToolbarButtonProps = ({
  nodeType = ELEMENT_UL,
}: { nodeType?: string } = {}) => {
  const editor = usePlateEditorState(useEventPlateId());

  return {
    pressed: someList(editor, nodeType),
    onClick: (e: any) => {
      e.preventDefault();
      e.stopPropagation();

      toggleList(editor, { type: nodeType });
      focusEditor(editor);
    },
  };
};
