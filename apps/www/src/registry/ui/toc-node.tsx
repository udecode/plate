'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { useTocElement, useTocElementState } from '@platejs/toc/react';
import { cva } from 'class-variance-authority';
import { PlateElement } from 'platejs/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getElementSuggestionData } from '@/registry/ui/suggestion-node';
import { voidRemoveSuggestionClass } from '@/registry/ui/suggestion-node-static';

const headingItemVariants = cva(
  'block h-auto w-full cursor-pointer truncate rounded-none px-0.5 py-1.5 text-left font-medium text-muted-foreground underline decoration-[0.5px] underline-offset-4 hover:bg-accent hover:text-muted-foreground',
  {
    variants: {
      depth: {
        1: 'pl-0.5',
        2: 'pl-[26px]',
        3: 'pl-[50px]',
      },
    },
  }
);

export function TocElement(props: PlateElementProps) {
  const state = useTocElementState();
  const { props: btnProps } = useTocElement(state);
  const { headingList } = state;
  const isRemoveSuggestion =
    getElementSuggestionData(props.editor, props.element)?.type === 'remove';

  return (
    <PlateElement {...props} className="mb-1 p-0">
      <div
        className={cn(
          isRemoveSuggestion && 'rounded-sm',
          isRemoveSuggestion && voidRemoveSuggestionClass
        )}
        contentEditable={false}
      >
        {headingList.length > 0 ? (
          headingList.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={headingItemVariants({
                depth: item.depth as 1 | 2 | 3,
              })}
              onClick={(e) => btnProps.onClick(e, item, 'smooth')}
              aria-current
            >
              {item.title}
            </Button>
          ))
        ) : (
          <div className="text-gray-500 text-sm">
            Create a heading to display the table of contents.
          </div>
        )}
      </div>
      {props.children}
    </PlateElement>
  );
}
