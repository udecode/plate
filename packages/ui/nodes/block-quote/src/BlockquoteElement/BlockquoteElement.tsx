import React from 'react';
import {
  cn,
  PlateElement,
  PlateElementProps,
} from '@udecode/plate-styled-components';

export function BlockquoteElement({ className, ...props }: PlateElementProps) {
  return (
    <PlateElement
      as="blockquote"
      className={cn(
        'mx-0 my-2 border-l-2 py-2.5 pl-4 pr-5',
        'border-[#ddd] text-[#aaa]',
        className
      )}
      {...props}
    />
  );
}
