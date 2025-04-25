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
          // api.aiChat.show();
          editor.api.scroll.withScroll(() => {
            editor.tf.insertNode(
              {
                children: [{ text: 'Hello' }],
                type: 'p',
              },
              { at: [10] }
            );
          });
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
