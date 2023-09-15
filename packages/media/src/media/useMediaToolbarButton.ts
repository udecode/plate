import { focusEditor, useEditorRef } from '@udecode/plate-common';

import { insertMedia } from './insertMedia';

export const useMediaToolbarButton = ({
  nodeType,
}: { nodeType?: string } = {}) => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: async () => {
        await insertMedia(editor, { type: nodeType });
        focusEditor(editor);
      },
    },
  };
};
