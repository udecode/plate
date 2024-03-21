import React from 'react';
import { withRef } from '@udecode/cn';
import {
  useIndentTodoToolbarButton,
  useIndentTodoToolbarButtonState,
} from '@udecode/plate-indent-todo';

import { Icons } from '@/components/icons';

import { ToolbarButton } from './toolbar';

export const IndentTodoToolbarButton = withRef<typeof ToolbarButton>(
  (rest, ref) => {
    const state = useIndentTodoToolbarButtonState();
    const { props } = useIndentTodoToolbarButton(state);

    return (
      <ToolbarButton ref={ref} tooltip="Toggle" {...props} {...rest}>
        <Icons.todo />
      </ToolbarButton>
    );
  }
);
