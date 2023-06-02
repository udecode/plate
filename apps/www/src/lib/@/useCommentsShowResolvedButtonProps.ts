import React from 'react';
import { focusEditor, usePlateEditorRef } from '@udecode/plate-common';

export const useCommentsShowResolvedButtonProps = () => {
  const editor = usePlateEditorRef();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const isActive = Boolean(anchorEl);

  return {
    pressed: isActive,
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setAnchorEl(e.currentTarget);

      focusEditor(editor);
    },
  };
};
