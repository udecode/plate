import React, { useEffect, useRef } from 'react';
import { useEventPlateId, usePlateEditorState } from '@udecode/plate-common';
import {
  EmojiFloatingIndexSearch,
  EmojiFloatingLibrary,
  EmojiSettings,
  EmojiSettingsType,
  FrequentEmojiStorage,
  useEmojiPicker,
  UseEmojiPickerType,
} from '@udecode/plate-emoji';
import { EmojiPicker } from './EmojiPicker';
import { EmojiToolbarDropdownRoot } from './EmojiToolbarDropdownRoot';
import { emojiCategoryIcons, emojiSearchIcons } from './icons';

import { Icons } from '@/components/icons';
import {
  ToolbarButton,
  ToolbarButtonProps,
} from '@/components/ui/toolbar-button';

type EmojiDropdownMenuProps = {
  settings?: EmojiSettingsType;
  EmojiPickerComponent?: (props: UseEmojiPickerType) => JSX.Element;
  closeOnSelect?: boolean;
} & ToolbarButtonProps;

export function EmojiDropdownMenu({
  id,
  EmojiPickerComponent = EmojiPicker,
  settings = EmojiSettings,
  closeOnSelect = true,
  ...props
}: EmojiDropdownMenuProps) {
  const editorId = useEventPlateId(id);
  const editor = usePlateEditorState(editorId);
  const emojiFloatingLibraryRef = useRef<EmojiFloatingLibrary>();
  const emojiFloatingIndexSearchRef = useRef<EmojiFloatingIndexSearch>();

  const { onToggle, isOpen, ...emojiPickerState } = useEmojiPicker({
    closeOnSelect,
    editor,
    emojiLibrary: emojiFloatingLibraryRef.current!,
    indexSearch: emojiFloatingIndexSearchRef.current!,
  });

  useEffect(() => {
    const frequentEmojiStorage = new FrequentEmojiStorage({
      limit: settings.showFrequent.limit,
    });
    emojiFloatingLibraryRef.current = EmojiFloatingLibrary.getInstance(
      settings,
      frequentEmojiStorage
    );

    emojiFloatingIndexSearchRef.current = EmojiFloatingIndexSearch.getInstance(
      emojiFloatingLibraryRef.current
    );
  }, [settings]);

  return (
    <EmojiToolbarDropdownRoot
      control={
        <ToolbarButton pressed={isOpen} isDropdown tooltip="Emoji" {...props}>
          <Icons.emoji />
        </ToolbarButton>
      }
      open={isOpen}
      onOpen={onToggle}
      onClose={onToggle}
    >
      <EmojiPickerComponent
        {...emojiPickerState}
        isOpen={isOpen}
        onToggle={onToggle}
        icons={{
          categories: emojiCategoryIcons,
          search: emojiSearchIcons,
        }}
        settings={settings}
      />
    </EmojiToolbarDropdownRoot>
  );
}
