import React from 'react';
import { Clear } from '@styled-icons/material/Clear';
import { Search } from '@styled-icons/material/Search';
import { getEmojiPickerSearchAndClearStyles } from './EmojiPickerSearchAndClear.styles';
import { EmojiPickerSearchAndClearProps } from './EmojiPickerSearchAndClear.types';

export const EmojiPickerSearchAndClear = ({
  i18n,
  searchValue,
  clearSearch,
  ...props
}: EmojiPickerSearchAndClearProps) => {
  const styles = getEmojiPickerSearchAndClearStyles({ ...props });

  return (
    <>
      <span css={styles.loupeIcon?.css}>
        <Search />
      </span>
      {searchValue && (
        <button
          title={i18n.clear}
          aria-label="Clear"
          type="button"
          css={styles.clearIcon?.css}
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
    </>
  );
};
