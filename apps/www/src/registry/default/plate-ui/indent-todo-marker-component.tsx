import { cn } from '@udecode/cn';
import { LiFC, MarkerFC } from '@udecode/plate-indent-list';
import { setNodes } from '@udecode/slate';
import { findNodePath } from '@udecode/slate-react';

import { Checkbox } from './checkbox';

export const TodoMarker: MarkerFC = (props) => {
  const { editor, element } = props;

  const onChange = (v: boolean) => {
    const path = findNodePath(editor, element);
    setNodes(editor, { checked: v }, { at: path });
  };

  return (
    <div contentEditable={false}>
      <Checkbox
        style={{ left: -24, top: 4, position: 'absolute' }}
        checked={element.checked as boolean}
        onCheckedChange={onChange}
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
