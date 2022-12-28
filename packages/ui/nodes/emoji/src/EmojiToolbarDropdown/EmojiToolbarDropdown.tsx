import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEventPlateId, usePlateEditorState } from '@udecode/plate-core';
import {
  EmojiFloatingIndexSearch,
  EmojiFloatingLibrary,
  EmojiSettings,
  EmojiSettingsType,
  FrequentEmojiStorage,
  useEmojiPicker,
  UseEmojiPickerType,
} from '@udecode/plate-emoji';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';
import { EmojiPicker } from '../EmojiPicker';
import icons from '../icons';
import { ToolbarDropdown } from './ToolbarDropdown';

type EmojiToolbarDropdownProps = {
  pluginKey: string;
  settings?: EmojiSettingsType;
  EmojiPickerComponent?: (props: UseEmojiPickerType) => JSX.Element;
} & ToolbarButtonProps;

export const EmojiToolbarDropdown = ({
  id,
  icon,
  EmojiPickerComponent = EmojiPicker,
  pluginKey,
  settings = EmojiSettings,
  ...rest
}: EmojiToolbarDropdownProps) => {
  id = useEventPlateId(id);
  const editor = usePlateEditorState(id);
  const [isOpen, setIsOpen] = useState(false);
  const emojiFloatingLibraryRef = useRef<EmojiFloatingLibrary>();
  const emojiFloatingIndexSearchRef = useRef<EmojiFloatingIndexSearch>();

  const onToggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const emojiPickerState = useEmojiPicker({
    isOpen,
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
    <ToolbarDropdown
      control={<ToolbarButton active={isOpen} icon={icon} {...rest} />}
      open={isOpen}
      onOpen={onToggle}
      onClose={onToggle}
    >
      <EmojiPickerComponent
        {...emojiPickerState}
        icons={icons}
        settings={settings}
      />
    </ToolbarDropdown>
  );
};
