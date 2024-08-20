import React from 'react';

import type { UseEmojiPickerType } from '@udecode/plate-emoji/react';

import { cn } from '@udecode/cn';

import { Icons } from '@/components/icons';

export type EmojiPickerSearchAndClearProps = Pick<
  UseEmojiPickerType,
  'clearSearch' | 'i18n' | 'searchValue'
>;

export function EmojiPickerSearchAndClear({
  clearSearch,
  i18n,
  searchValue,
}: EmojiPickerSearchAndClearProps) {
  return (
    <>
      <span
        className={cn(
          'absolute left-2 top-1/2 z-10 flex size-5 -translate-y-1/2'
        )}
      >
        <Icons.search />
      </span>
      {searchValue && (
        <button
          aria-label="Clear"
          className={cn(
            'absolute right-0 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer border-none bg-transparent'
          )}
          onClick={clearSearch}
          title={i18n.clear}
          type="button"
        >
          <Icons.clear className="size-full" />
        </button>
      )}
    </>
  );
}
