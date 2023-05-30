import {
  focusEditor,
  isMarkActive,
  toggleMark,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-common';

export const useMarkToolbarButtonProps = ({
  id,
  clear,
  nodeType,
}: {
  nodeType: string;
  id?: string;
  clear?: string | string[];
}) => {
  const editor = usePlateEditorState(useEventPlateId(id));
  const pressed = !!editor?.selection && isMarkActive(editor, nodeType);

  return {
    onClick: (e) => {
      e.preventDefault();
      e.stopPropagation();

      toggleMark(editor, { key: nodeType, clear });
      focusEditor(editor);
    },
    pressed,
  };
};
