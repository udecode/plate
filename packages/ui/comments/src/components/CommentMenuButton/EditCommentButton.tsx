import React from 'react';
import { PlateButton, PlateButtonProps } from '@udecode/plate-ui-button';
import { useCommentActions } from '../CommentProvider';

export const useEditCommentButton = (
  props: PlateButtonProps
): PlateButtonProps => {
  const setIsMenuOpen = useCommentActions().isMenuOpen();

  return {
    onClick: () => {
      setIsMenuOpen(false);
    },
    ...props,
  };
};

export const EditCommentButton = (props: PlateButtonProps) => {
  const htmlProps = useEditCommentButton(props);

  return <PlateButton {...htmlProps} />;
};
