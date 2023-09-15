import React from 'react';
import { focusEditor, useEditorRef } from '@udecode/plate-common';

export const useCommentsShowResolvedButton = () => {
  const editor = useEditorRef();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const isActive = Boolean(anchorEl);

  return {
    props: {
      pressed: isActive,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        setAnchorEl(e.currentTarget);

        focusEditor(editor);
      },
    },
  };
};
