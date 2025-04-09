'use client';

import React from 'react';

import { withRef } from '@udecode/cn';
import { AIChatPlugin } from '@udecode/plate-ai/react';
import { useEditorPlugin, useEditorRef } from '@udecode/plate/react';

import { ToolbarButton } from './toolbar';

export const AIToolbarButton = withRef<typeof ToolbarButton>(
  ({ children, ...rest }, ref) => {
    const editor = useEditorRef();

    const { api } = useEditorPlugin(AIChatPlugin);

    return (
      <ToolbarButton
        ref={ref}
        {...rest}
        onClick={() => {
          editor.tf.insertNodes(
            {
              children: [{ text: 'anchor' }],
              type: 'p',
            },
            {
              at: [0],
              nextBlock: true,
            }
          );
          // api.aiChat.show();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
      >
        {children}
      </ToolbarButton>
    );
  }
);
