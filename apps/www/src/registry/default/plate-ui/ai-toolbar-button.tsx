'use client';

import React from 'react';

import { withRef } from '@udecode/cn';
import { AIPlugin } from '@udecode/plate-ai/react';
import { useEditorPlugin } from '@udecode/plate-core/react';
import { getNodeEntries } from '@udecode/slate';
import { toDOMNode } from '@udecode/slate-react';

import { ToolbarButton } from './toolbar';

export const AIToolbarButton = withRef<typeof ToolbarButton>(
  ({ children, ...rest }, ref) => {
    const { api, editor, setOptions } = useEditorPlugin(AIPlugin);
    const onOpenAI: React.MouseEventHandler<HTMLButtonElement> = () => {
      const _nodeEntries = getNodeEntries(editor);
      const nodeEntries = Array.from(_nodeEntries);
      const bottomNode = nodeEntries.at(-1);

      if (bottomNode) {
        const anchorElement = toDOMNode(editor, bottomNode[0])!;
        api.ai.show(editor.id, anchorElement, bottomNode);
        setOptions({
          aiState: 'idle',
          menuType: 'selection',
        });
      }
    };

    return (
      <ToolbarButton
        ref={ref}
        {...rest}
        className=""
        onClick={onOpenAI}
        tooltip="Ask Ai"
      >
        {children}
      </ToolbarButton>
    );
  }
);
