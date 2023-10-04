import { useEditorRef } from '@udecode/plate-common';

import { insertMedia } from './insertMedia';

export const useMediaToolbarButton = ({
  nodeType,
}: { nodeType?: string } = {}) => {
  const editor = useEditorRef();

  return {
    props: {
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
      onClick: async () => {
        await insertMedia(editor, { type: nodeType });
      },
    },
  };
};
