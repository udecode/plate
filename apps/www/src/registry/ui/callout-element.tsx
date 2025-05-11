'use client';

import * as React from 'react';

import { cn } from '@udecode/cn';
import { useCalloutEmojiPicker } from '@udecode/plate-callout/react';
import { useEmojiDropdownMenuState } from '@udecode/plate-emoji/react';
import { PlateElement } from '@udecode/plate/react';

import { Button } from '@/components/ui/button';

import { emojiCategoryIcons, emojiSearchIcons } from './emoji-icons';
import { EmojiPicker } from './emoji-picker';
import { EmojiToolbarDropdown } from './emoji-toolbar-dropdown';

export function CalloutElement({
  attributes,
  children,
  className,
  ...props
}: React.ComponentProps<typeof PlateElement>) {
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
      className={cn('my-1 flex rounded-sm bg-muted p-4 pl-3', className)}
      style={{
        backgroundColor: props.element.backgroundColor as any,
      }}
      attributes={{
        ...attributes,
        'data-plate-open-context-menu': true,
      }}
      {...props}
    >
      <div className="flex w-full gap-2 rounded-md">
        <EmojiToolbarDropdown
          {...emojiToolbarDropdownProps}
          control={
            <Button
              variant="ghost"
              className="size-6 p-1 text-[18px] select-none hover:bg-muted-foreground/15"
              style={{
                fontFamily:
                  '"Apple Color Emoji", "Segoe UI Emoji", NotoColorEmoji, "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", EmojiSymbols',
              }}
              contentEditable={false}
            >
              {(props.element.icon as any) || '💡'}
            </Button>
          }
        >
          <EmojiPicker
            {...emojiPickerState}
            {...calloutProps}
            icons={{
              categories: emojiCategoryIcons,
              search: emojiSearchIcons,
            }}
          />
        </EmojiToolbarDropdown>
        <div className="w-full">{children}</div>
      </div>
    </PlateElement>
  );
}
