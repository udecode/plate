import React from 'react';
import { UseEmojiPickerType } from '@udecode/plate-emoji';
import { EmojiPickerContent } from '../EmojiPickerContent';
import { EmojiPickerNavigation } from '../EmojiPickerNavigation';
import { EmojiPickerPreview } from '../EmojiPickerPreview';
import {
  EmojiPickerSearchAndClear,
  EmojiPickerSearchBar,
} from '../EmojiPickerSearchBar';
import { getEmojiPickerStyles } from './EmojiPicker.styles';

export const EmojiPicker = ({
  i18n,
  searchValue,
  setSearch,
  clearSearch,
  isSearching,
  hasFound,
  searchResult,
  emoji,
  onSelectEmoji,
  onMouseOver,
  emojiLibrary,
  icons,
  handleCategoryClick,
  focusedCategory,
  visibleCategories,
  refs,
  settings,
  ...props
}: UseEmojiPickerType) => {
  const { root } = getEmojiPickerStyles(props);

  return (
    <div css={root.css}>
      <EmojiPickerNavigation
        i18n={i18n}
        emojiLibrary={emojiLibrary}
        icons={icons}
        focusedCategory={focusedCategory}
        onClick={handleCategoryClick}
      />
      <EmojiPickerSearchBar
        i18n={i18n}
        setSearch={setSearch}
        searchValue={searchValue}
      >
        <EmojiPickerSearchAndClear
          i18n={i18n}
          clearSearch={clearSearch}
          searchValue={searchValue}
        />
      </EmojiPickerSearchBar>
      <EmojiPickerContent
        i18n={i18n}
        emojiLibrary={emojiLibrary}
        isSearching={isSearching}
        searchResult={searchResult}
        visibleCategories={visibleCategories}
        settings={settings}
        onSelectEmoji={onSelectEmoji}
        onMouseOver={onMouseOver}
        refs={refs}
      />
      <EmojiPickerPreview
        i18n={i18n}
        emoji={emoji}
        hasFound={hasFound}
        isSearching={isSearching}
      />
    </div>
  );
};
