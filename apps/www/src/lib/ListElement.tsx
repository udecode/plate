import React from 'react';
import {
  cva,
  PlateElement,
  PlateElementProps,
  VariantProps,
} from '@udecode/plate-tailwind';

const listVariants = cva('m-0 ps-6', {
  variants: {
    variant: {
      ul: '',
      ol: '',
    },
  },
});

export function ListElement({
  className,
  variant = 'ul',
  ...props
}: PlateElementProps & VariantProps<typeof listVariants>) {
  return (
    <PlateElement
      as={variant}
      className={listVariants({ variant, className })}
      {...props}
    />
  );
}
