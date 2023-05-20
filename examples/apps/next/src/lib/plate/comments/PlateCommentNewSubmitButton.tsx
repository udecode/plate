import React from 'react';
import { CommentNewSubmitButton } from '@udecode/plate-comments';
import { buttonVariants } from '../button/PlateButton';

export function PlateCommentNewSubmitButton() {
  return (
    <CommentNewSubmitButton
      className={buttonVariants({ variant: 'primary' })}
    />
  );
}
