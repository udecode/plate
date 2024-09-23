import {
  useIndentTodoToolBarButton,
  useIndentTodoToolBarButtonState,
} from '@udecode/plate-indent-list/react';
import { withRef } from '@udecode/react-utils';

import { Icons } from '@/components/icons';

import { ToolbarButton } from './toolbar';

export const IndentTodoToolbarButton = withRef<typeof ToolbarButton>(
  (rest, ref) => {
    const state = useIndentTodoToolBarButtonState({ nodeType: 'todo' });
    const { props } = useIndentTodoToolBarButton(state);

    return (
      <ToolbarButton ref={ref} tooltip="Todo" {...props} {...rest}>
        <Icons.todo />
      </ToolbarButton>
    );
  }
);
