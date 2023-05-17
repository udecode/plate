import React from 'react';
import { CommentNewSubmitButton } from '@udecode/plate-comments';
import { buttonVariants } from '@udecode/plate-ui-button';

export const PlateCommentNewSubmitButton = () => {
  return (
    <CommentNewSubmitButton
      className={buttonVariants({ variant: 'primary' })}
    />
  );
};
