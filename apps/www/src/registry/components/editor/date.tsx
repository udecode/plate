'use client';

import { formatDateValue, parseCanonicalDateValue } from 'platejs/date';
import { DatePlugin } from 'platejs/date/react';
import {
  type EditorElementProps,
  EditorElement,
  useEditorReadOnly,
} from 'platejs/react';
import * as React from 'react';

import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { inlineSuggestionVariants } from '@/registry/lib/inline-suggestion';

const DAY_MS = 86_400_000;
const RELATIVE_DAYS: Partial<Record<number, string>> = {
  [-1]: 'Yesterday',
  0: 'Today',
  1: 'Tomorrow',
};
const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeZone: 'UTC',
});

const getDateLabel = (value: string) => {
  if (!parseCanonicalDateValue(value)) return value;

  const day = Date.parse(value);
  const today = Date.parse(formatDateValue(new Date()));

  return RELATIVE_DAYS[(day - today) / DAY_MS] ?? dateFormat.format(day);
};

export function DateElement(props: EditorElementProps<typeof DatePlugin>) {
  const { editor, element } = props;
  const readOnly = useEditorReadOnly();
  const openRef = React.useRef(false);
  const openAtPointerDownRef = React.useRef(false);
  const [open, setOpen] = React.useState(false);
  const setOpenState = React.useCallback((nextOpen: boolean) => {
    openRef.current = nextOpen;
    setOpen(nextOpen);
  }, []);

  const trigger = (
    <button
      className={cn(
        'w-fit cursor-pointer rounded-sm bg-muted px-1 text-muted-foreground',
        inlineSuggestionVariants({ on: 'parent' })
      )}
      contentEditable={false}
      draggable
      onClick={(event) => {
        const beganOpen =
          event.detail === 0 ? openRef.current : openAtPointerDownRef.current;

        if (readOnly || beganOpen) return;

        event.preventDefault();
        setOpenState(true);
      }}
      onPointerDown={() => {
        openAtPointerDownRef.current = openRef.current;
      }}
      type="button"
    >
      {getDateLabel(element.value)}
    </button>
  );

  return (
    <EditorElement
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
        <Popover open={open} onOpenChange={setOpenState}>
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
              autoFocus
            />
          </PopoverContent>
        </Popover>
      )}
      {props.children}
    </EditorElement>
  );
}

export const DateKit = [DatePlugin.configure({ component: DateElement })];
