import { cn } from '@udecode/cn';
import {
  LiFC,
  MarkerFC,
  useIndentTodoListElement,
  useIndentTodoListElementState,
} from '@udecode/plate-indent-list';
import { TElement } from '@udecode/slate';

import { Checkbox } from './checkbox';

export const TodoMarker: MarkerFC = ({ element }: { element: TElement }) => {
  const state = useIndentTodoListElementState({ element });
  const { checkboxProps } = useIndentTodoListElement(state);

  return (
    <div contentEditable={false}>
      <Checkbox
        style={{ left: -24, top: 4, position: 'absolute' }}
        {...checkboxProps}
      />
    </div>
  );
};

export const TodoLi: LiFC = (props) => {
  const { element, children } = props;

  return (
    <span
      className={cn(
        (element.checked as boolean) && 'text-muted-foreground line-through'
      )}
    >
      {children}
    </span>
  );
};
