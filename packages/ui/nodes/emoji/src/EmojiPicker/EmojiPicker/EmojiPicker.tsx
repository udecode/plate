import React from 'react';
import { UseEmojiPickerType } from '@udecode/plate-emoji';
import { EmojiPickerContent } from '../EmojiPickerContent';
import { EmojiPickerNavigation } from '../EmojiPickerNavigation';
import { EmojiPickerPreview } from '../EmojiPickerPreview';
import { EmojiPickerSearchBar } from '../EmojiPickerSearchBar';
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
  setEmoji,
  selectEmoji,
  emojiLibrary,
  icons,
  handleCategoryClick,
  focusedCategory,
  visibleCategories,
  scrollRef,
}: UseEmojiPickerType) => {
  const { root } = getEmojiPickerStyles();

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
        clearSearch={clearSearch}
        searchValue={searchValue}
      />
      <EmojiPickerContent
        i18n={i18n}
        setEmoji={setEmoji}
        emojiLibrary={emojiLibrary}
        isSearching={isSearching}
        searchResult={searchResult}
        visibleCategories={visibleCategories}
        selectEmoji={selectEmoji}
        scrollRef={scrollRef}
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
