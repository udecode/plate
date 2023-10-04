import { useEditorRef } from '@udecode/plate-common';

import { indent } from '../index';

export const useIndentButton = () => {
  const editor = useEditorRef();

  return {
    props: {
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
      onClick: () => {
        indent(editor);
      },
    },
  };
};
