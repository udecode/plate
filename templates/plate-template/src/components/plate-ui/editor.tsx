'use client';

import React from 'react';

import type { PlateContentProps } from '@udecode/plate-common/react';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '@udecode/cn';
import { PlateContent } from '@udecode/plate-common/react';
import { cva } from 'class-variance-authority';

const editorContainerVariants = cva('relative flex cursor-text', {
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      default: 'w-full',
      demo: 'h-[500px] overflow-y-auto',
    },
  },
});

export const EditorContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> &
    VariantProps<typeof editorContainerVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'ignore-click-outside/toolbar',
        editorContainerVariants({ variant }),
        className
      )}
      role="button"
      {...props}
    />
  );
});

EditorContainer.displayName = 'EditorContainer';

const editorVariants = cva(
  cn(
    'group/editor',
    'relative w-full whitespace-pre-wrap break-words',
    'rounded-md ring-offset-background placeholder:text-muted-foreground/80 focus-visible:outline-none',
    '[&_[data-slate-placeholder]]:text-muted-foreground/80 [&_[data-slate-placeholder]]:!opacity-100',
    '[&_[data-slate-placeholder]]:top-[auto_!important]',
    '[&_strong]:font-bold'
  ),
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      disabled: {
        true: 'cursor-not-allowed opacity-50',
      },
      focused: {
        true: 'ring-2 ring-ring ring-offset-2',
      },
      variant: {
        ai: 'w-full px-0 text-sm',
        aiChat:
          'max-h-[min(70vh,320px)] w-full max-w-[700px] overflow-y-auto px-3 py-2 text-sm',
        default:
          'min-h-full w-full px-16 pb-72 text-base sm:px-[max(64px,calc(50%-350px))]',
        demo: 'min-h-full w-full px-16 pb-72 pt-4 text-base sm:px-[max(64px,calc(50%-350px))]',
        fullWidth: 'min-h-full w-full px-16 pb-72 text-base sm:px-24',
        update: 'w-full px-0 text-sm',
      },
    },
  }
);

export type EditorProps = PlateContentProps &
  VariantProps<typeof editorVariants>;

export const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
  ({ className, disabled, focused, variant, ...props }, ref) => {
    return (
      <PlateContent
        ref={ref}
        className={cn(
          editorVariants({
            disabled,
            focused,
            variant,
          }),
          className
        )}
        disableDefaultStyles
        {...props}
      />
    );
  }
);

Editor.displayName = 'Editor';
