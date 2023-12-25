import {
  Caption as CaptionPrimitive,
  CaptionTextarea as CaptionTextareaPrimitive,
} from '@udecode/plate-caption';
import { cva } from 'class-variance-authority';

import { cn, withCn, withVariants } from '@/lib/utils';

const captionVariants = cva('max-w-full', {
  variants: {
    align: {
      left: 'mr-auto',
      center: 'mx-auto',
      right: 'ml-auto',
    },
  },
  defaultVariants: {
    align: 'center',
  },
});

export const Caption = withVariants(CaptionPrimitive, captionVariants, [
  'align',
]);

export const CaptionTextarea = withCn(
  CaptionTextareaPrimitive,
  cn(
    'mt-2 w-full resize-none border-none bg-inherit p-0 font-[inherit] text-inherit',
    'focus:outline-none focus:[&::placeholder]:opacity-0',
    'text-center print:placeholder:text-transparent'
  )
);
