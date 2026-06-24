import React from 'react';

import { usePluginOption } from 'platejs/react';

import { EmojiSettings } from '../../lib/constants';
import type { EmojiSettingsType } from '../../lib/types';
import { EmojiFloatingIndexSearch } from '../../lib/utils/IndexSearch/EmojiFloatingIndexSearch';
import { EmojiPlugin } from '../EmojiPlugin';
import { FrequentEmojiStorage } from '../storage';
import { EmojiFloatingLibrary } from '../utils/EmojiLibrary/EmojiFloatingLibrary';
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

  const [emojiLibrary, indexSearch] = React.useMemo(() => {
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
  }, [data, settings]);

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
