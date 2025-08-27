'use client';

import * as React from 'react';

import { AIReviewPlugin } from '@platejs/ai/react';
import { useEditorPlugin } from 'platejs/react';

import { ToolbarButton } from './toolbar';

export function AIReviewToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const { api } = useEditorPlugin(AIReviewPlugin);

  return (
    <ToolbarButton
      {...props}
      onClick={() => {
        api.aiReview.generateComment();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    />
  );
}
