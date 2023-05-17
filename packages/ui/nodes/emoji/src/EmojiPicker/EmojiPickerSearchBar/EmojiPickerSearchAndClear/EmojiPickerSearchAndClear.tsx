import React from 'react';
import { Clear } from '@styled-icons/material/Clear';
import { Search } from '@styled-icons/material/Search';
import { UseEmojiPickerType } from '@udecode/plate-emoji';
import { cn } from '@udecode/plate-styled-components';

export type EmojiPickerSearchAndClearProps = Pick<
  UseEmojiPickerType,
  'i18n' | 'searchValue' | 'clearSearch'
>;

export function EmojiPickerSearchAndClear({
  i18n,
  searchValue,
  clearSearch,
}: EmojiPickerSearchAndClearProps) {
  return (
    <>
      <span
        className={cn(
          'absolute left-2 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2'
        )}
      >
        <Search />
      </span>
      {searchValue && (
        <button
          title={i18n.clear}
          aria-label="Clear"
          type="button"
          className={cn(
            'absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer border-none bg-transparent'
          )}
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
}
