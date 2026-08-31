'use client';

import {
  formatDateValue,
  getDateDisplayLabel,
  parseCanonicalDateValue,
} from 'platejs/date';
import { DatePlugin } from 'platejs/date/react';
import {
  type PlateElementProps,
  PlateElement,
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

export function DateElement(props: PlateElementProps<typeof DatePlugin>) {
  const { editor, element } = props;
  const readOnly = useEditorReadOnly();
  // Radix Slot needs one stable child ref, and focus can open before the same
  // trigger click tries to close. Keep both facts stable across that gesture.
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const ignoreCloseFromOpeningGestureRef = React.useRef(false);
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
        inlineSuggestionVariants()
      )}
      contentEditable={false}
      draggable
      onClick={(event) => {
        const beganOpen =
          event.detail === 0 ? openRef.current : openAtPointerDownRef.current;

        if (readOnly || beganOpen) return;

        event.preventDefault();
        ignoreCloseFromOpeningGestureRef.current = true;
        setOpenState(true);
      }}
      onKeyDown={() => {
        ignoreCloseFromOpeningGestureRef.current = false;
      }}
      onPointerDown={() => {
        ignoreCloseFromOpeningGestureRef.current = false;
        openAtPointerDownRef.current = openRef.current;
      }}
      ref={buttonRef}
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
        <Popover
          open={open}
          onOpenChange={(nextOpen) => {
            if (!nextOpen && ignoreCloseFromOpeningGestureRef.current) {
              ignoreCloseFromOpeningGestureRef.current = false;

              return;
            }
            ignoreCloseFromOpeningGestureRef.current = false;
            setOpenState(nextOpen);
          }}
        >
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
