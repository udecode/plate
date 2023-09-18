import React from 'react';
import { PlateContent } from '@udecode/plate-common';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import type { PlateContentProps } from '@udecode/plate-common';
import type { VariantProps } from 'class-variance-authority';

const editorVariants = cva(
  cn(
    'relative whitespace-pre-wrap break-words',
    'min-h-[80px] w-full rounded-md bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    '[&_[data-slate-placeholder]]:text-muted-foreground [&_[data-slate-placeholder]]:!opacity-100',
    '[&_[data-slate-placeholder]]:top-[auto_!important]',
    '[&_strong]:font-bold'
  ),
  {
    variants: {
      variant: {
        outline: 'border border-input',
        ghost: '',
      },
      focused: {
        true: 'ring-2 ring-ring ring-offset-2',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  }
);

export type EditorProps = PlateContentProps &
  VariantProps<typeof editorVariants>;

const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
  ({ variant, disabled, focused, readOnly, className, ...props }, ref) => {
    return (
      <div ref={ref} className="relative w-full">
        <PlateContent
          className={cn(
            editorVariants({ variant, focused, disabled }),
            className
          )}
          disableDefaultStyles
          readOnly={disabled ?? readOnly}
          aria-disabled={disabled}
          {...props}
        />
      </div>
    );
  }
);
Editor.displayName = 'Editor';

export { Editor };
