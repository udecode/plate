import React from 'react';
import { Clear } from '@styled-icons/material/Clear';
import { Search } from '@styled-icons/material/Search';
import tw from 'twin.macro';
import { getEmojiPickerSearchBarStyles } from './EmojiPickerSearchBar.styles';
import { EmojiPickerSearchBarProps } from './EmojiPickerSearchBar.types';

export const EmojiPickerSearchBar = ({
  i18n,
  searchValue,
  setSearch,
  clearSearch,
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
          aria-label="search"
          css={styles.input?.css}
          onChange={(event) => setSearch(event.target.value)}
          value={searchValue}
        />
        <span css={styles.loupeIcon?.css}>
          <Search />
        </span>
        {searchValue && (
          <button
            title={i18n.clear}
            aria-label="Clear"
            type="button"
            css={styles.button?.css}
            onClick={clearSearch}
          >
            <Clear
              css={{
                width: '100%',
                height: ' 100%',
              }}
            />
          </button>
        )}
      </div>
    </div>
  );
};
