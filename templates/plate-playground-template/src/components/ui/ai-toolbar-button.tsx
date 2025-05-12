'use client';

import * as React from 'react';

import { AIChatPlugin } from '@udecode/plate-ai/react';
import { useEditorPlugin } from '@udecode/plate/react';

import { ToolbarButton } from './toolbar';

export function AIToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const { api } = useEditorPlugin(AIChatPlugin);

  return (
    <ToolbarButton
      {...props}
      onClick={() => {
        api.aiChat.show();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    />
  );
}
