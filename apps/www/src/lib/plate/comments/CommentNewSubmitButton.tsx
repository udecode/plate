import React from 'react';
import { CommentNewSubmitButton as CommentNewSubmitButtonPrimitive } from '@udecode/plate-comments';

import { buttonVariants } from '@/components/ui/button';

export function CommentNewSubmitButton() {
  return <CommentNewSubmitButtonPrimitive className={buttonVariants()} />;
}
