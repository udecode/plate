import React from 'react';

import type { PlateRenderElementStaticProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';

import { CheckboxStatic } from './checkbox-static';

export const TodoMarkerStatic = ({
  element,
}: Omit<PlateRenderElementStaticProps, 'children'>) => {
  return (
    <div contentEditable={false}>
      <CheckboxStatic
        style={{ left: -24, position: 'absolute', top: 4 }}
        checked={element.checked as boolean}
      />
    </div>
  );
};

export const TodoLiStatic = (props: PlateRenderElementStaticProps) => {
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
