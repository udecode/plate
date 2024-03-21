import { TElement } from '@udecode/plate-common';

export const ELEMENT_INDENT_TODO = 'todo';

export interface TIndentTodoListItemElement extends TElement {
  checked: boolean;
  indent?: number;
}
