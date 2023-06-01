import { ListStyleType, toggleIndentList } from '@udecode/plate';
import {
  focusEditor,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-common';

import { someIndentList } from '@/lib/@/someIndentList';

export const useIndentListToolbarButtonProps = ({
  nodeType = ListStyleType.Disc,
}: { nodeType?: string } = {}) => {
  const editor = usePlateEditorState(useEventPlateId());

  return {
    pressed: someIndentList(editor, nodeType),
    onClick: (e: any) => {
      e.preventDefault();
      e.stopPropagation();

      toggleIndentList(editor, {
        listStyleType: nodeType,
      });
      focusEditor(editor);
    },
  };
};
