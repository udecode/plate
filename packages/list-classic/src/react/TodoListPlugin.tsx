import { toPlatePlugin } from '@platejs/core/react';

import { BaseTodoListPlugin } from '../lib/BaseTodoListPlugin';

export const TodoListPlugin = toPlatePlugin(BaseTodoListPlugin);
