import { focusEditor, usePlateEditorRef } from '@udecode/plate-common';
import { insertMedia } from './insertMedia';

export const useMediaToolbarButton = ({
  nodeType,
}: { nodeType?: string } = {}) => {
  const editor = usePlateEditorRef();

  return {
    props: {
      onClick: async () => {
        await insertMedia(editor, { type: nodeType });
        focusEditor(editor);
      },
    },
  };
};
