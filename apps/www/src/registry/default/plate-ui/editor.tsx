import React from 'react';

import type { PlateContentProps } from '@udecode/plate-common/react';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '@udecode/cn';
import { PlateContent } from '@udecode/plate-common/react';
import { cva } from 'class-variance-authority';

const editorVariants = cva(
  cn(
    'relative overflow-x-auto whitespace-pre-wrap break-words text-foreground',
    'min-h-[80px] w-full rounded-md bg-background px-6 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none',
    '[&_[data-slate-placeholder]]:text-muted-foreground [&_[data-slate-placeholder]]:!opacity-100',
    '[&_[data-slate-placeholder]]:top-[auto_!important]',
    '[&_strong]:font-bold'
  ),
  {
    defaultVariants: {
      focusRing: true,
      size: 'sm',
      variant: 'outline',
    },
    variants: {
      disabled: {
        true: 'cursor-not-allowed opacity-50',
      },
      focusRing: {
        false: '',
        true: 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      },
      focused: {
        true: 'ring-2 ring-ring ring-offset-2',
      },
      size: {
        md: 'text-base',
        sm: 'text-sm',
      },
      variant: {
        demo: 'max-h-[650px] min-h-full w-full px-16 pb-72 text-base sm:px-[max(64px,calc(50%-350px))]',
        ghost: '',
        outline: 'border border-input',
      },
    },
  }
);

export type EditorProps = PlateContentProps &
  VariantProps<typeof editorVariants>;

const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
  (
    {
      className,
      disabled,
      focusRing,
      focused,
      readOnly,
      size,
      variant,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className="relative w-full">
        <PlateContent
          className={cn(
            editorVariants({
              disabled,
              focusRing,
              focused,
              size,
              variant,
            }),
            className
          )}
          readOnly={disabled ?? readOnly}
          aria-disabled={disabled}
          data-plate-selectable
          disableDefaultStyles
          {...props}
        />
      </div>
    );
  }
);
Editor.displayName = 'Editor';

export { Editor };
