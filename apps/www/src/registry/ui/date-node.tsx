'use client';

import * as React from 'react';

import {
  formatDateValue,
  getDateDisplayLabel,
  parseCanonicalDateValue,
} from '@platejs/date';
import type { TDateElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';

import { PlateElement, useReadOnly } from 'platejs/react';

import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { inlineSuggestionDataClassName } from '@/registry/ui/suggestion-node-static';

export function DateElement({
  attributes,
  children,
  editor,
  element,
  ...props
}: PlateElementProps<TDateElement>) {
  const readOnly = useReadOnly();

  const trigger = (
    <span
      className={cn(
        'w-fit cursor-pointer rounded-sm bg-muted px-1 text-muted-foreground',
        inlineSuggestionDataClassName
      )}
      contentEditable={false}
      data-slot="date-trigger"
      draggable
    >
      {element.date || element.rawDate ? (
        getDateDisplayLabel(element)
      ) : (
        <span>Pick a date</span>
      )}
    </span>
  );

  return (
    <PlateElement
      className="inline-block"
      attributes={{
        ...attributes,
        contentEditable: false,
      }}
      editor={editor}
      element={element}
      {...props}
    >
      {readOnly ? (
        trigger
      ) : (
        <Popover>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              selected={parseCanonicalDateValue(element.date ?? '')}
              onSelect={(date) => {
                if (!date) return;

                editor.tf.setNodes(
                  { date: formatDateValue(date), rawDate: undefined },
                  { at: element }
                );
              }}
              mode="single"
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}
      {children}
    </PlateElement>
  );
}
