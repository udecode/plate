import React, { memo, useCallback } from 'react';
import { cn } from '@udecode/cn';
import {
  Emoji,
  EmojiSettings,
  GridRow,
  UseEmojiPickerType,
} from '@udecode/plate-emoji';

export type EmojiPickerContentProps = Pick<
  UseEmojiPickerType,
  | 'i18n'
  | 'onMouseOver'
  | 'onSelectEmoji'
  | 'emojiLibrary'
  | 'isSearching'
  | 'searchResult'
  | 'visibleCategories'
  | 'refs'
  | 'settings'
>;

export type EmojiButtonProps = {
  index: number;
  emoji: Emoji;
  onSelect: (emoji: Emoji) => void;
  onMouseOver: (emoji?: Emoji) => void;
};

export type RowOfButtonsProps = Pick<
  UseEmojiPickerType,
  'onMouseOver' | 'onSelectEmoji' | 'emojiLibrary'
> & {
  row: GridRow;
};

const Button = memo(
  ({ index, emoji, onSelect, onMouseOver }: EmojiButtonProps) => {
    return (
      <button
        type="button"
        aria-label={emoji.skins[0].native}
        tabIndex={-1}
        data-index={index}
        onClick={() => onSelect(emoji)}
        onMouseEnter={() => onMouseOver(emoji)}
        onMouseLeave={() => onMouseOver()}
        className="group relative flex size-[36px] cursor-pointer items-center justify-center border-none bg-transparent text-2xl leading-none"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[rgba(0,0,0,0.05)] opacity-0 group-hover:opacity-100"
        />
        <span data-emoji-set="native" style={{ position: 'relative' }}>
          {emoji.skins[0].native}
        </span>
      </button>
    );
  }
);
Button.displayName = 'Button';

const RowOfButtons = memo(
  ({ row, emojiLibrary, onSelectEmoji, onMouseOver }: RowOfButtonsProps) => (
    <div key={row.id} data-index={row.id} className="flex">
      {row.elements.map((emojiId, index) => (
        <Button
          key={emojiId}
          index={index}
          emoji={emojiLibrary.getEmoji(emojiId)}
          onSelect={onSelectEmoji}
          onMouseOver={onMouseOver}
        />
      ))}
    </div>
  )
);
RowOfButtons.displayName = 'RowOfButtons';

export function EmojiPickerContent({
  i18n,
  onSelectEmoji,
  onMouseOver,
  emojiLibrary,
  isSearching = false,
  searchResult,
  visibleCategories,
  refs,
  settings = EmojiSettings,
}: EmojiPickerContentProps) {
  const getRowWidth = settings.perLine.value * settings.buttonSize.value;

  const isCategoryVisible = useCallback(
    (categoryId: any) => {
      return visibleCategories.has(categoryId)
        ? visibleCategories.get(categoryId)
        : false;
    },
    [visibleCategories]
  );

  const EmojiList = useCallback(() => {
    return emojiLibrary
      .getGrid()
      .sections()
      .map(({ id: categoryId }) => {
        const section = emojiLibrary.getGrid().section(categoryId);
        const { buttonSize } = settings;

        return (
          <div
            key={categoryId}
            data-id={categoryId}
            ref={section.root}
            style={{ width: getRowWidth }}
          >
            <div className="sticky -top-px z-[1] bg-background/90 p-1 backdrop-blur-sm">
              {i18n.categories[categoryId]}
            </div>
            <div
              className="relative flex flex-wrap"
              style={{ height: section.getRows().length * buttonSize.value }}
            >
              {isCategoryVisible(categoryId) &&
                section
                  .getRows()
                  .map((row: GridRow, index) => (
                    <RowOfButtons
                      key={index}
                      emojiLibrary={emojiLibrary}
                      row={row}
                      onSelectEmoji={onSelectEmoji}
                      onMouseOver={onMouseOver}
                    />
                  ))}
            </div>
          </div>
        );
      });
  }, [
    emojiLibrary,
    getRowWidth,
    i18n.categories,
    isCategoryVisible,
    onSelectEmoji,
    onMouseOver,
    settings,
  ]);

  const SearchList = useCallback(() => {
    return (
      <div data-id="search" style={{ width: getRowWidth }}>
        <div className="sticky -top-px z-[1] bg-background/90 p-1 backdrop-blur-sm">
          {i18n.searchResult}
        </div>
        <div className="relative flex flex-wrap">
          {searchResult.map((emoji: Emoji, index: number) => (
            <Button
              key={emoji.id}
              index={index}
              emoji={emojiLibrary.getEmoji(emoji.id)}
              onSelect={onSelectEmoji}
              onMouseOver={onMouseOver}
            />
          ))}
        </div>
      </div>
    );
  }, [
    emojiLibrary,
    getRowWidth,
    i18n.searchResult,
    searchResult,
    onSelectEmoji,
    onMouseOver,
  ]);

  return (
    <div
      className={cn(
        'h-full min-h-[50%] overflow-y-auto overflow-x-hidden px-3',
        '[&::-webkit-scrollbar]:w-4',
        '[&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:size-0',
        ':hover:[&::-webkit-scrollbar-thumb]:bg-[#f3f4f6]',
        '[&::-webkit-scrollbar-thumb]:min-h-[65px] [&::-webkit-scrollbar-thumb]:rounded-2xl [&::-webkit-scrollbar-thumb]:border-4 [&::-webkit-scrollbar-thumb]:border-white',
        '[&::-webkit-scrollbar-track]:border-0'
      )}
      data-id="scroll"
      ref={refs.current.contentRoot}
    >
      <div ref={refs.current.content} className="h-full">
        {isSearching ? SearchList() : EmojiList()}
      </div>
    </div>
  );
}
