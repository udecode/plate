'use client';

import * as React from 'react';

import type { TEquationElement } from '@udecode/plate-math';
import type { PlateElementProps } from '@udecode/plate/react';

import { useEquationElement } from '@udecode/plate-math/react';
import { PlateElement, useSelected } from '@udecode/plate/react';
import { RadicalIcon } from 'lucide-react';

import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { EquationPopoverContent } from './equation-popover';

export function EquationElement(props: PlateElementProps<TEquationElement>) {
  const selected = useSelected();
  const [open, setOpen] = React.useState(selected);
  const katexRef = React.useRef<HTMLDivElement | null>(null);

  useEquationElement({
    element: props.element,
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
    <PlateElement className="my-1" {...props}>
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              'group flex cursor-pointer items-center justify-center rounded-sm select-none hover:bg-primary/10 data-[selected=true]:bg-primary/10',
              props.element.texExpression.length === 0
                ? 'bg-muted p-3 pr-9'
                : 'px-2 py-1'
            )}
            data-selected={selected}
            contentEditable={false}
            role="button"
          >
            {props.element.texExpression.length > 0 ? (
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

      {props.children}
    </PlateElement>
  );
}
