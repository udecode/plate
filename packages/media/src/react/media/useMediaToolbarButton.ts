import { useEditorRef } from '@platejs/core/react';

import { insertMedia } from '../../lib/media/insertMedia';

export const useMediaToolbarButton = ({
  nodeType,
}: {
  nodeType?: string;
} = {}) => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: async () => {
        await insertMedia(editor, { type: nodeType });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
