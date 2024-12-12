import React from 'react';

import type { PlateRenderElementProps } from '@udecode/plate-common/react';

import { cn } from '@udecode/cn';

import { StaticCheckbox } from './checkbox';

export const TodoMarker = ({
  element,
}: Omit<PlateRenderElementProps, 'children'>) => {
  return (
    <div contentEditable={false}>
      <StaticCheckbox
        style={{ left: -24, position: 'absolute', top: 4 }}
        checked={element.checked as boolean}
      />
    </div>
  );
};

export const TodoLi = (props: PlateRenderElementProps) => {
  const { children, element } = props;

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
