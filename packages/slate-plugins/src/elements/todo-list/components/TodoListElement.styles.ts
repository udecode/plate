import { CLASS_TODO_LIST_CHECKED } from '../constants';
import { TodoListElementStyleProps, TodoListElementStyles } from '../types';

export const getTodoListElementStyles = ({
  className,
  checked,
}: TodoListElementStyleProps): TodoListElementStyles => {
  let rootClassName = className;
  if (checked) rootClassName += ` ${CLASS_TODO_LIST_CHECKED}`;

  return {
    root: [
      {
        display: 'flex',
        flexDirection: 'row',
        padding: '3px 0',
      },
      rootClassName,
    ],
    checkboxWrapper: {
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      marginRight: '6px',
    },
    checkbox: {
      width: '16px',
      height: '16px',
      margin: '0',
    },
    text: {
      flex: 1,
      opacity: checked ? 0.666 : 1,
      textDecoration: checked ? 'line-through' : 'none',

      selectors: {
        ':focus': {
          outline: 'none',
        },
      },
    },
  };
};
