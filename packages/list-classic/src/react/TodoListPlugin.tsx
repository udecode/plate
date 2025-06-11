import { toPlatePlugin } from 'platejs/react';

import { BaseTodoListPlugin } from '../lib/BaseTodoListPlugin';

export const TodoListPlugin = toPlatePlugin(BaseTodoListPlugin);
