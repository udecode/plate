import { createStyles } from '@udecode/slate-plugins-ui';
import { css } from 'styled-components';
import { TodoListElementStyleProps } from './TodoListElement.types';

export const getTodoListElementStyles = (props: TodoListElementStyleProps) => {
  return createStyles(
    { prefixClassNames: 'TodoListElement', ...props },
    {
      root: [
        {
          display: 'flex',
          flexDirection: 'row',
          padding: '3px 0',
        },
      ],
      ...(props.checked && { rootChecked: {} }),
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
      text: [
        {
          flex: 1,
          opacity: props.checked ? 0.666 : 1,
          textDecoration: props.checked ? 'line-through' : 'none',
        },
        css`
          :focus {
            outline: none;
          }
        `,
      ],
    }
  );
};
