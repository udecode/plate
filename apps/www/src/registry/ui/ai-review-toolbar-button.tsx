'use client';

import * as React from 'react';

import { AIChatPlugin, AIReviewPlugin } from '@platejs/ai/react';
import { useEditorPlugin, usePluginOption } from 'platejs/react';

import { ToolbarButton } from './toolbar';
import { useCompletion } from '@ai-sdk/react';

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
