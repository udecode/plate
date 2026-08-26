'use client';

import { SmileIcon } from 'lucide-react';
import * as React from 'react';

import { ToolbarButton } from '@/registry/components/editor/toolbar';

import {
  EmojiPicker,
  type EmojiPickerOptions,
  EmojiPickerTrigger,
} from './emoji-picker';

export function EmojiToolbarButton({
  closeOnSelect,
  data,
  onSelectEmoji,
  settings,
  ...props
}: EmojiPickerOptions & React.ComponentPropsWithoutRef<typeof ToolbarButton>) {
  return (
    <EmojiPicker
      closeOnSelect={closeOnSelect}
      data={data}
      onSelectEmoji={onSelectEmoji}
      settings={settings}
    >
      <EmojiPickerTrigger>
        <ToolbarButton tooltip="Emoji" isDropdown {...props}>
          <SmileIcon />
        </ToolbarButton>
      </EmojiPickerTrigger>
    </EmojiPicker>
  );
}
