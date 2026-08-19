'use client';

import * as React from 'react';

import {
  formatDateValue,
  getDateDisplayLabel,
  parseCanonicalDateValue,
} from '@platejs/date';
import { DatePlugin } from '@platejs/date/react';
import {
  type PlateElementProps,
  PlateElement,
  useEditorReadOnly,
} from 'platejs/react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { inlineSuggestionVariants } from '@/registry/lib/suggestion';

export function DateElement(props: PlateElementProps<typeof DatePlugin>) {
  const { editor, element } = props;
  const readOnly = useEditorReadOnly();

  const trigger = (
    <button
      className={cn(
        'w-fit cursor-pointer rounded-sm bg-muted px-1 text-muted-foreground',
        inlineSuggestionVariants()
      )}
      contentEditable={false}
      draggable
      type="button"
    >
      {getDateDisplayLabel(element.value)}
    </button>
  );

  return (
    <PlateElement
      {...props}
      className="inline-block"
      attributes={{
        ...props.attributes,
        contentEditable: false,
      }}
    >
      {readOnly ? (
        trigger
      ) : (
        <Popover>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              selected={parseCanonicalDateValue(element.value)}
              onSelect={(date) => {
                if (!date) return;

                editor.update.nodes.set(
                  { value: formatDateValue(date) },
                  { at: element }
                );
              }}
              mode="single"
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}
      {props.children}
    </PlateElement>
  );
}

export const DateKit = [DatePlugin.configure({ component: DateElement })];
