import {
  focusEditor,
  usePlateEditorRef,
  usePlateEditorState,
} from '@udecode/plate-common';
import { ListStyleType, toggleIndentList } from '../index';
import { someIndentList } from './someIndentList';

export const useIndentListToolbarButtonState = ({
  nodeType = ListStyleType.Disc,
}: { nodeType?: string } = {}) => {
  const editor = usePlateEditorState();

  return {
    pressed: someIndentList(editor, nodeType),
    nodeType,
  };
};

export const useIndentListToolbarButton = ({
  nodeType,
  pressed,
}: ReturnType<typeof useIndentListToolbarButtonState>) => {
  const editor = usePlateEditorRef();

  return {
    props: {
      pressed,
      onClick: (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        toggleIndentList(editor, {
          listStyleType: nodeType,
        });
        focusEditor(editor);
      },
    },
  };
};
