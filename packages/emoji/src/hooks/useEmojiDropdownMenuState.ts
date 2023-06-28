import { usePlateEditorState, useStableMemo } from '@udecode/plate-common';
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

  const [emojiLibrary, indexSearch] = useStableMemo(() => {
    const frequentEmojiStorage = new FrequentEmojiStorage({
      limit: settings.showFrequent.limit,
    });

    const emojiLibrary = EmojiFloatingLibrary.getInstance(
      settings,
      frequentEmojiStorage
    );

    const indexSearch = EmojiFloatingIndexSearch.getInstance(emojiLibrary);

    return [emojiLibrary, indexSearch] as const;
  }, [settings]);

  const { isOpen, setIsOpen, ...emojiPickerState } = useEmojiPicker({
    closeOnSelect,
    editor,
    emojiLibrary,
    indexSearch,
  });

  return {
    isOpen,
    setIsOpen,
    emojiPickerState,
  };
}
