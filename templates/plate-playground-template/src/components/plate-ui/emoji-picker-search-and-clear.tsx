import { cn } from '@udecode/cn';
import { DeleteIcon, SearchIcon } from 'lucide-react';

import { Button } from './button';

import type { UseEmojiPickerType } from '@udecode/plate-emoji/react';

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
    <div className="flex items-center">
      <div
        className={cn(
          'absolute left-3 top-1/2 z-10 flex size-5 -translate-y-1/2 items-center justify-center'
        )}
      >
        <SearchIcon className="size-4" />
      </div>
      {searchValue && (
        <Button
          aria-label="Clear"
          className={cn(
            'absolute right-1 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center border-none bg-transparent'
          )}
          onClick={clearSearch}
          size="icon"
          title={i18n.clear}
          type="button"
          variant="ghost"
        >
          <DeleteIcon className="size-4" />
        </Button>
      )}
    </div>
  );
}
