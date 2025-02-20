import { usePluginOption, useStableMemo } from '@udecode/plate/react';

import {
  type EmojiSettingsType,
  EmojiFloatingIndexSearch,
  EmojiSettings,
} from '../../lib';
import { EmojiPlugin } from '../EmojiPlugin';
import { FrequentEmojiStorage } from '../storage';
import { EmojiFloatingLibrary } from '../utils';
import { useEmojiPicker } from './useEmojiPicker';

export type EmojiDropdownMenuOptions = {
  closeOnSelect?: boolean;
  settings?: EmojiSettingsType;
};

export function useEmojiDropdownMenuState({
  closeOnSelect = true,
  settings = EmojiSettings,
}: EmojiDropdownMenuOptions = {}) {
  const data = usePluginOption(EmojiPlugin, 'data')!;

  const [emojiLibrary, indexSearch] = useStableMemo(() => {
    const frequentEmojiStorage = new FrequentEmojiStorage({
      limit: settings.showFrequent.limit,
    });

    const emojiLibrary = EmojiFloatingLibrary.getInstance(
      settings,
      frequentEmojiStorage,
      data
    );

    const indexSearch = EmojiFloatingIndexSearch.getInstance(emojiLibrary);

    return [emojiLibrary, indexSearch] as const;
  }, [settings]);

  const { isOpen, setIsOpen, ...emojiPickerState } = useEmojiPicker({
    closeOnSelect,
    emojiLibrary,
    indexSearch,
  });

  return {
    emojiPickerState,
    isOpen,
    setIsOpen,
  };
}
