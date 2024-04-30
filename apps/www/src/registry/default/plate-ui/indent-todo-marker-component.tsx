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
        onMouseDown={(e: any) => {
          /**
           * click the checkbox should not losing the focus.
           */
          e.preventDefault();
          const checked = e.target.getAttribute('aria-checked') !== 'true';
          onChange(checked);
        }}
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
