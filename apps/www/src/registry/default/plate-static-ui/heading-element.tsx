import type { StaticElementProps } from '@udecode/plate-core';

import { cva } from 'class-variance-authority';

interface HeadingElementViewProps extends StaticElementProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const headingVariants = cva('relative mb-1', {
  variants: {
    variant: {
      h1: 'mt-[1.6em] pb-1 font-heading text-4xl font-bold',
      h2: 'mt-[1.4em] pb-px font-heading text-2xl font-semibold tracking-tight',
      h3: 'mt-[1em] pb-px font-heading text-xl font-semibold tracking-tight',
      h4: 'mt-[0.75em] font-heading text-lg font-semibold tracking-tight',
      h5: 'mt-[0.75em] text-lg font-semibold tracking-tight',
      h6: 'mt-[0.75em] text-base font-semibold tracking-tight',
    },
  },
});

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
