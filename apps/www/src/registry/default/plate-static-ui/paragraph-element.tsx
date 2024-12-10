import type {
  StaticElementProps,
  StaticLeafProps,
} from '@udecode/plate-common';

import { cn } from '@udecode/cn';

export const ParagraphStaticElement = ({
  children,
  className,
  element,
  ...props
}: StaticElementProps) => {
  return (
    <StaticElement
      className={cn('m-0 px-0 py-1', className)}
      element={element}
      {...props}
    >
      {children}
    </StaticElement>
  );
};

export const StaticElement = ({
  as,
  attributes,
  children,
  element,
  nodeProps,
  ...props
}: StaticElementProps) => {
  const Element = (as ?? 'div') as any;

  return (
    <Element {...attributes} {...props} {...nodeProps}>
      {children}
    </Element>
  );
};

export function PlateStaticLeaf({ as, attributes, children }: StaticLeafProps) {
  const Leaf = (as ?? 'span') as any;

  return <Leaf {...attributes}>{children}</Leaf>;
}
