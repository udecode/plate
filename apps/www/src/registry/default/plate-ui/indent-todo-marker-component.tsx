import { cn } from '@udecode/cn';
import { setNodes } from '@udecode/slate';
import { findNodePath } from '@udecode/slate-react';

import { Checkbox } from './checkbox';

export const TodoMarker = (props: any) => {
  const { editor, element } = props;

  const onChange = (v: boolean) => {
    const path = findNodePath(editor, element);
    setNodes(editor, { checked: v }, { at: path });
  };

  return (
    <div contentEditable={false}>
      <Checkbox
        style={{ left: -24, top: 4, position: 'absolute' }}
        checked={element.checked}
        onCheckedChange={onChange}
      />
    </div>
  );
};

export const IndentTodoLiComponent = (props: any) => {
  const { element, children } = props;
  return (
    <span
      className={cn(element.checked && 'text-muted-foreground line-through')}
    >
      {children}
    </span>
  );
};
