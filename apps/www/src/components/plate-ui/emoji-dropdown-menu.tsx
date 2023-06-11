import React from 'react';
import {
  EmojiDropdownMenuOptions,
  useEmojiDropdownMenuState,
} from '@udecode/plate-emoji';
import { emojiCategoryIcons, emojiSearchIcons } from './emoji-icons';
import { EmojiPicker } from './emoji-picker';
import { EmojiToolbarDropdown } from './emoji-toolbar-dropdown';

import { Icons } from '@/components/icons';
import { ToolbarButton, ToolbarButtonProps } from '@/components/ui/toolbar';

type EmojiDropdownMenuProps = {
  options?: EmojiDropdownMenuOptions;
} & ToolbarButtonProps;

export function EmojiDropdownMenu({
  options,
  ...props
}: EmojiDropdownMenuProps) {
  const { isOpen, onToggle, emojiPickerState } =
    useEmojiDropdownMenuState(options);

  return (
    <EmojiToolbarDropdown
      control={
        <ToolbarButton pressed={isOpen} isDropdown tooltip="Emoji" {...props}>
          <Icons.emoji />
        </ToolbarButton>
      }
      open={isOpen}
      onOpen={onToggle}
      onClose={onToggle}
    >
      <EmojiPicker
        {...emojiPickerState}
        isOpen={isOpen}
        onToggle={onToggle}
        icons={{
          categories: emojiCategoryIcons,
          search: emojiSearchIcons,
        }}
        settings={options?.settings}
      />
    </EmojiToolbarDropdown>
  );
}
