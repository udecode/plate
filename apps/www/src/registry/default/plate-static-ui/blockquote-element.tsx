import type { StaticElementProps } from '@udecode/plate-common';

import { cn } from '../lib/utils';
import { StaticElement } from './paragraph-element';

export const BlockquoteStaticElement = ({
  children,
  className,
  ...props
}: StaticElementProps) => {
  return (
    <StaticElement
      as="blockquote"
      className={cn('my-1 border-l-2 pl-6 italic', className)}
      {...props}
    >
      {children}
    </StaticElement>
  );
};
