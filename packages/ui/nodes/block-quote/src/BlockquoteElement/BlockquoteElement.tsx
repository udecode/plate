import React from 'react';
import {
  cn,
  PlateElement,
  PlateElementProps,
} from '@udecode/plate-styled-components';

export const BlockquoteElement = ({
  className,
  ...props
}: PlateElementProps) => {
  return (
    <PlateElement
      as="blockquote"
      className={cn(
        'my-2 mx-0 border-l-2 py-2.5 pl-4 pr-5',
        'border-[#ddd] text-[#aaa]',
        className
      )}
      {...props}
    />
  );
};
