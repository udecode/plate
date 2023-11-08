import React from 'react';
import { useEditorRef } from '@udecode/plate-common';

export const useCommentsShowResolvedButton = () => {
  const editor = useEditorRef();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const isActive = Boolean(anchorEl);

  return {
    props: {
      pressed: isActive,
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(e.currentTarget);
      },
    },
  };
};
