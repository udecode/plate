import type { StaticElementProps } from '@udecode/plate-core';

import { headingVariants } from '../plate-ui/heading-element';

interface HeadingElementViewProps extends StaticElementProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const HeadingStaticElement = ({
  attributes,
  children,
  variant = 'h1',
}: HeadingElementViewProps) => {
  const Component = variant as any;

  return (
    <Component className={headingVariants({ variant })} {...attributes}>
      {children}
    </Component>
  );
};
