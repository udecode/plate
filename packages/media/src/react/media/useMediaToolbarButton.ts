import { useEditor } from '@platejs/core/react';

import { insertMedia } from '../../lib/media/insertMedia';

export const useMediaToolbarButton = ({
  nodeType,
}: {
  nodeType?: string;
} = {}) => {
  const editor = useEditor();

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
