import React from 'react';
import { PlateElement } from '@udecode/plate';
import { PlateElementProps } from '@udecode/plate-common';
import { cva, VariantProps } from 'class-variance-authority';

const headingVariants = cva('', {
  variants: {
    variant: {
      h1: 'mx-0 mb-1 mt-[2em] text-[1.875em] font-medium leading-[1.3]',
      h2: 'mx-0 mb-px mt-[1.4em] text-[1.5em] font-medium leading-[1.3]',
      h3: 'mx-0 mb-px mt-[1em] text-[1.25em] font-medium leading-[1.3] text-[#434343]',
      h4: 'mx-0 mb-0 mt-[0.75em] text-[1.1em] font-medium leading-[1.3] text-[#666666]',
      h5: 'mx-0 mb-0 mt-[0.75em] text-[1.1em] font-medium leading-[1.3] text-[#666666]',
      h6: 'mx-0 mb-0 mt-[0.75em] text-[1.1em] font-medium leading-[1.3] text-[#666666]',
    },
    isFirstBlock: {
      true: 'mt-0',
      false: '',
    },
  },
});

export function HeadingElement({
  className,
  variant = 'h1',
  isFirstBlock,
  ...props
}: PlateElementProps & VariantProps<typeof headingVariants>) {
  const { element, editor } = props;

  return (
    <PlateElement
      as={variant}
      className={headingVariants({
        variant,
        className,
        isFirstBlock: element === editor.children[0],
      })}
      {...props}
    />
  );
}
