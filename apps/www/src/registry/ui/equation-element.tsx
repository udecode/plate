'use client';

import React, { useRef, useState } from 'react';

import type { TEquationElement } from '@udecode/plate-math';

import { cn, withRef } from '@udecode/cn';
import { useEquationElement } from '@udecode/plate-math/react';
import { PlateElement, useElement, useSelected } from '@udecode/plate/react';
import { RadicalIcon } from 'lucide-react';

import { EquationPopoverContent } from './equation-popover';
import { Popover, PopoverTrigger } from './popover';

export const EquationElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const element = useElement<TEquationElement>();

    const selected = useSelected();
    const [open, setOpen] = useState(selected);
    const katexRef = useRef<HTMLDivElement | null>(null);

    useEquationElement({
      element,
      katexRef: katexRef,
      options: {
        displayMode: true,
        errorColor: '#cc0000',
        fleqn: false,
        leqno: false,
        macros: { '\\f': '#1f(#2)' },
        output: 'htmlAndMathml',
        strict: 'warn',
        throwOnError: false,
        trust: false,
      },
    });

    return (
      <PlateElement ref={ref} className={cn('my-1', className)} {...props}>
        <Popover open={open} onOpenChange={setOpen} modal={false}>
          <PopoverTrigger asChild>
            <div
              className={cn(
                'group flex cursor-pointer items-center justify-center rounded-sm select-none hover:bg-primary/10 data-[selected=true]:bg-primary/10',
                element.texExpression.length === 0
                  ? 'bg-muted p-3 pr-9'
                  : 'px-2 py-1'
              )}
              data-selected={selected}
              contentEditable={false}
              role="button"
            >
              {element.texExpression.length > 0 ? (
                <span ref={katexRef} />
              ) : (
                <div className="flex h-7 w-full items-center gap-2 text-sm whitespace-nowrap text-muted-foreground">
                  <RadicalIcon className="size-6 text-muted-foreground/80" />
                  <div>Add a Tex equation</div>
                </div>
              )}
            </div>
          </PopoverTrigger>

          <EquationPopoverContent
            open={open}
            placeholder={`f(x) = \\begin{cases}\n  x^2, &\\quad x > 0 \\\\\n  0, &\\quad x = 0 \\\\\n  -x^2, &\\quad x < 0\n\\end{cases}`}
            isInline={false}
            setOpen={setOpen}
          />
        </Popover>

        {children}
      </PlateElement>
    );
  }
);
