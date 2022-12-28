import React from 'react';
import tw from 'twin.macro';
import { getEmojiPickerSearchBarStyles } from './EmojiPickerSearchBar.styles';
import { EmojiPickerSearchBarProps } from './EmojiPickerSearchBar.types';

export const EmojiPickerSearchBar = ({
  i18n,
  searchValue,
  setSearch,
  children,
  ...props
}: EmojiPickerSearchBarProps) => {
  const styles = getEmojiPickerSearchBarStyles({ ...props });

  return (
    <div css={styles.root.css}>
      <div css={tw`relative flex flex-grow`}>
        <input
          type="text"
          placeholder={i18n.search}
          autoComplete="off"
          aria-label="Search"
          css={styles.input?.css}
          onChange={(event) => setSearch(event.target.value)}
          value={searchValue}
        />
        {children}
      </div>
    </div>
  );
};
