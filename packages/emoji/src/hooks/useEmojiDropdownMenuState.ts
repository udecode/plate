import { useEffect, useRef } from 'react';
import { usePlateEditorState } from '@udecode/plate-common';
import {
  EmojiFloatingIndexSearch,
  EmojiFloatingLibrary,
  EmojiSettings,
  EmojiSettingsType,
  FrequentEmojiStorage,
  useEmojiPicker,
} from '../index';

export type EmojiDropdownMenuOptions = {
  settings?: EmojiSettingsType;
  closeOnSelect?: boolean;
};

export function useEmojiDropdownMenuState({
  settings = EmojiSettings,
  closeOnSelect = true,
}: EmojiDropdownMenuOptions = {}) {
  const editor = usePlateEditorState();
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

  return {
    isOpen,
    onToggle,
    emojiPickerState,
  };
}
