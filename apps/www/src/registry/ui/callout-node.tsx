'use client';

import * as React from 'react';

import {
  type CalloutPlugin,
  useCalloutEmojiPicker,
} from '@platejs/callout/react';
import { useEmojiDropdownMenuState } from '@platejs/emoji/react';
import { type PlateElementProps, PlateElement } from 'platejs/react';

import { Button } from '@/components/ui/button';

import { EmojiPicker, EmojiPopover } from './emoji-toolbar-button';

export function CalloutElement(props: PlateElementProps<typeof CalloutPlugin>) {
  const { emojiPickerState, isOpen, setIsOpen } = useEmojiDropdownMenuState({
    closeOnSelect: true,
  });

  const { emojiToolbarDropdownProps, props: calloutProps } =
    useCalloutEmojiPicker({
      isOpen,
      setIsOpen,
    });

  return (
    <PlateElement
      {...props}
      className="my-1 flex rounded-sm bg-muted p-4 pl-3"
      style={{
        backgroundColor: props.element.backgroundColor,
      }}
      attributes={{
        ...props.attributes,
        'data-plate-open-context-menu': true,
      }}
    >
      <div className="flex w-full gap-2 rounded-md">
        <EmojiPopover
          {...emojiToolbarDropdownProps}
          control={
            <Button
              variant="ghost"
              className="size-6 select-none p-1 text-[18px] hover:bg-muted-foreground/15"
              style={{
                fontFamily:
                  '"Apple Color Emoji", "Segoe UI Emoji", NotoColorEmoji, "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", EmojiSymbols',
              }}
              contentEditable={false}
            >
              {props.element.icon || '💡'}
            </Button>
          }
        >
          <EmojiPicker {...emojiPickerState} {...calloutProps} />
        </EmojiPopover>
        <div className="w-full">{props.children}</div>
      </div>
    </PlateElement>
  );
}
