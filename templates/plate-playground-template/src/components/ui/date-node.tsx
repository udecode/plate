'use client';

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
      {element.date ? (
        (() => {
          const today = new Date();
          const elementDate = new Date(element.date);
          const isToday =
            elementDate.getDate() === today.getDate() &&
            elementDate.getMonth() === today.getMonth() &&
            elementDate.getFullYear() === today.getFullYear();

          const isYesterday =
            new Date(today.setDate(today.getDate() - 1)).toDateString() ===
            elementDate.toDateString();
          const isTomorrow =
            new Date(today.setDate(today.getDate() + 2)).toDateString() ===
            elementDate.toDateString();

          if (isToday) return 'Today';
          if (isYesterday) return 'Yesterday';
          if (isTomorrow) return 'Tomorrow';

          return elementDate.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
        })()
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
      attributes={{
        ...props.attributes,
        contentEditable: false,
      }}
      className="inline-block"
    >
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            initialFocus
            mode="single"
            onSelect={(date) => {
              if (!date) return;

              editor.tf.setNodes(
                { date: date.toDateString() },
                { at: element }
              );
            }}
            selected={new Date(element.date as string)}
          />
        </PopoverContent>
      </Popover>
      {props.children}
    </PlateElement>
  );
}
