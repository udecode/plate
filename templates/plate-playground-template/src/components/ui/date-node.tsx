'use client';

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
import { inlineSuggestionVariants } from '@/lib/suggestion';
import { cn } from '@/lib/utils';

export function DateElement(props: PlateElementProps<TDateElement>) {
  const { editor, element } = props;
  const readOnly = useReadOnly();

  const trigger = (
    <span
      className={cn(
        'w-fit cursor-pointer rounded-sm bg-muted px-1 text-muted-foreground',
        inlineSuggestionVariants()
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

  return (
    <PlateElement
      {...props}
      attributes={{
        ...props.attributes,
        contentEditable: false,
      }}
      className="inline-block"
    >
      {readOnly ? (
        trigger
      ) : (
        <Popover>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              initialFocus
              mode="single"
              onSelect={(date) => {
                if (!date) return;

                editor.tf.setNodes(
                  { date: formatDateValue(date), rawDate: undefined },
                  { at: element }
                );
              }}
              selected={parseCanonicalDateValue(element.date ?? '')}
            />
          </PopoverContent>
        </Popover>
      )}
      {props.children}
    </PlateElement>
  );
}
