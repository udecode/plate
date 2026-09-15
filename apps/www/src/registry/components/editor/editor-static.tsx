import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import {
  type EditorStaticProps,
  EditorStatic as EditorStaticPrimitive,
} from 'platejs/static';
import * as React from 'react';

import { cn } from '@/lib/utils';

export const editorVariants = cva(
  cn(
    'group/editor',
    'relative w-full cursor-text select-text overflow-x-hidden whitespace-break-spaces break-words',
    'rounded-md ring-offset-background focus-visible:outline-none',
    'placeholder:text-muted-foreground/80 **:data-editor-placeholder:top-[auto_!important] **:data-editor-placeholder:text-muted-foreground/80 **:data-editor-placeholder:opacity-100!',
    '[&_strong]:font-bold'
  ),
  {
    defaultVariants: {
      variant: 'none',
    },
    variants: {
      disabled: {
        true: 'cursor-not-allowed opacity-50',
      },
      focused: {
        true: 'ring-2 ring-ring ring-offset-2',
      },
      variant: {
        ai: 'w-full px-0 text-base md:text-sm',
        aiChat:
          'max-h-[min(70vh,320px)] w-full overflow-y-auto px-5 py-3 text-base md:text-sm',
        default:
          'size-full px-16 pt-4 pb-72 text-base sm:px-[max(64px,calc(50%-350px))]',
        demo: 'size-full px-16 pt-4 pb-72 text-base sm:px-[max(64px,calc(50%-350px))]',
        fullWidth: 'size-full px-16 pt-4 pb-72 text-base sm:px-24',
        none: '',
        select: 'px-3 py-2 text-base data-readonly:w-fit',
      },
    },
  }
);

export function EditorStatic({
  className,
  variant,
  ...props
}: EditorStaticProps & VariantProps<typeof editorVariants>) {
  return (
    <EditorStaticPrimitive
      className={cn(editorVariants({ variant }), className)}
      {...props}
    />
  );
}
