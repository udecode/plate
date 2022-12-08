import React, { memo, useCallback, useMemo } from 'react';
import { Emoji, GridRow } from '@udecode/plate-emoji';
import { getEmojiPickerContentStyles } from './EmojiPickerContent.styles';
import {
  ButtonProps,
  EmojiPickerContentProps,
  RowOfButtonsProps,
} from './EmojiPickerContent.types';

const Button = memo(
  ({ index, emoji, onClick, onMouseHandler, ...props }: ButtonProps) => {
    const { button, buttonBg } = getEmojiPickerContentStyles({ ...props });

    return (
      <button
        type="button"
        aria-label={emoji.skins[0].native}
        tabIndex={-1}
        css={button?.css}
        data-index={index}
        onClick={() => onClick(emoji)}
        onMouseEnter={() => onMouseHandler(emoji)}
        onMouseLeave={() => onMouseHandler(undefined)}
        className="group"
      >
        <div aria-hidden="true" css={buttonBg!.css} />
        <span data-emoji-set="native" css={{ position: 'relative' }}>
          {emoji.skins[0].native}
        </span>
      </button>
    );
  }
);

const RowOfButtons = memo(
  ({ row, emojiLibrary, setEmoji, selectEmoji }: RowOfButtonsProps) => (
    <div
      key={row.id}
      data-index={row.id}
      css={{ display: 'flex', 'flex-direction': 'row' }}
    >
      {row.emojis.map((emojiId, index) => (
        <Button
          key={emojiId}
          index={index}
          emoji={emojiLibrary.getEmoji(emojiId)}
          onClick={selectEmoji}
          onMouseHandler={setEmoji}
        />
      ))}
    </div>
  )
);

export const EmojiPickerContent = ({
  i18n,
  setEmoji,
  selectEmoji,
  emojiLibrary,
  isSearching = false,
  searchResult,
  visibleCategories,
  scrollRef,
  ...props
}: EmojiPickerContentProps) => {
  const styles = getEmojiPickerContentStyles({ ...props });

  const isCategoryVisible = useCallback(
    (categoryId: any) => {
      return visibleCategories.has(categoryId)
        ? visibleCategories.get(categoryId)! > 0
        : false;
    },
    [visibleCategories]
  );

  const EmojiList = useMemo(
    () =>
      emojiLibrary.getCategories().map((categoryId) => {
        const { root, rows } = emojiLibrary.getGrid().section(categoryId);

        return (
          <div key={categoryId} data-id={categoryId} ref={root}>
            <div css={styles.sticky?.css}>{i18n.categories[categoryId]}</div>
            <div
              css={styles.category?.css}
              style={{
                height: rows.length * 36,
              }}
            >
              {isCategoryVisible(categoryId) &&
                rows.map((row: GridRow, index) => (
                  <RowOfButtons
                    key={index}
                    emojiLibrary={emojiLibrary}
                    row={row}
                    selectEmoji={selectEmoji}
                    setEmoji={setEmoji}
                  />
                ))}
            </div>
          </div>
        );
      }),
    [
      emojiLibrary,
      i18n.categories,
      isCategoryVisible,
      selectEmoji,
      setEmoji,
      styles,
    ]
  );

  const SearchList = useMemo(
    () => (
      <div data-id="search">
        <div css={styles.sticky?.css}>{i18n.categories.search}</div>
        <div css={styles.category?.css}>
          {searchResult.map((emoji: Emoji, index: number) => (
            <Button
              key={emoji.id}
              index={index}
              emoji={emojiLibrary.getEmoji(emoji.id)}
              onClick={selectEmoji}
              onMouseHandler={setEmoji}
            />
          ))}
        </div>
      </div>
    ),
    [
      emojiLibrary,
      i18n.categories.search,
      searchResult,
      selectEmoji,
      setEmoji,
      styles,
    ]
  );

  return (
    <div css={styles.root.css} data-id="scroll" ref={scrollRef}>
      <div css={styles.content?.css}>
        {isSearching ? SearchList : EmojiList}
      </div>
    </div>
  );
};
