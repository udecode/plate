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

export function DateElement(props: PlateElementProps<TDateElement>) {
  const { editor, element } = props;

  const readOnly = useReadOnly();

  const trigger = (
    <span
      className={cn(
        'w-fit cursor-pointer rounded-sm bg-muted px-1 text-muted-foreground'
      )}
      contentEditable={false}
      draggable
    >
      {element.date || element.rawDate ? (
        getDateDisplayLabel(element)
      ) : (
        <span>Pick a date</span>
      )}
    </span>
  );

  if (readOnly) {
    return trigger;
  }

  return (
    <PlateElement
      {...props}
      className="inline-block"
      attributes={{
        ...props.attributes,
        contentEditable: false,
      }}
    >
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
      {props.children}
    </PlateElement>
  );
}
