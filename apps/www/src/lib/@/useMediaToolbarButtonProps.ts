import { focusEditor, usePlateEditorRef } from '@udecode/plate-common';
import { insertMedia } from './insertMedia';

export const useMediaToolbarButtonProps = ({
  nodeType,
}: { nodeType?: string } = {}) => {
  const editor = usePlateEditorRef();

  return {
    onClick: async () => {
      await insertMedia(editor, { type: nodeType });
      focusEditor(editor);
    },
  };
};
