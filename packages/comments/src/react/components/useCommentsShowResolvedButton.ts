import React from 'react';

export const useCommentsShowResolvedButton = () => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const isActive = Boolean(anchorEl);

  return {
    props: {
      pressed: isActive,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(e.currentTarget);
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
