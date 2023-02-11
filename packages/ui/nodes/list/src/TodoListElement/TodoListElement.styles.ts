import { Value } from '@udecode/plate-core';
import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { TodoListElementStyleProps } from './TodoListElement.types';

export const getTodoListElementStyles = <V extends Value>(
  props: TodoListElementStyleProps<V>
) => {
  return createStyles(
    { prefixClassNames: 'TodoListElement', ...props },
    {
      root: tw`flex flex-row py-1`,
      ...(props.checked && { rootChecked: {} }),
      checkboxWrapper: tw`flex items-center justify-center select-none mr-1.5`,
      checkbox: tw`w-4 h-4 m-0`,
      text: [
        tw`flex-1 focus:outline-none`,
        props.checked && tw`line-through opacity-[0.666]`,
      ],
    }
  );
};
