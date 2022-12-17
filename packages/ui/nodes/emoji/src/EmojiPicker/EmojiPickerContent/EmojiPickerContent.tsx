import React, { memo, useCallback } from 'react';
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
      {row.elements.map((emojiId, index) => (
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
  refs,
  settings,
  ...props
}: EmojiPickerContentProps) => {
  const styles = getEmojiPickerContentStyles({ ...props });
  const getRowWidth = settings.perLine.value * settings.buttonSize.value;

  const isCategoryVisible = useCallback(
    (categoryId: any) => {
      return visibleCategories.has(categoryId)
        ? visibleCategories.get(categoryId)! > 0
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
            <div css={styles.sticky?.css}>{i18n.categories[categoryId]}</div>
            <div
              css={styles.category?.css}
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
                      selectEmoji={selectEmoji}
                      setEmoji={setEmoji}
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
    selectEmoji,
    setEmoji,
    settings,
    styles,
  ]);

  const SearchList = useCallback(() => {
    return (
      <div data-id="search" style={{ width: getRowWidth }}>
        <div css={styles.sticky?.css}>{i18n.searchResult}</div>
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
    );
  }, [
    emojiLibrary,
    getRowWidth,
    i18n.searchResult,
    searchResult,
    selectEmoji,
    setEmoji,
    styles,
  ]);

  return (
    <div css={styles.root.css} data-id="scroll" ref={refs.current.contentRoot}>
      <div css={styles.content?.css} ref={refs.current.content}>
        {isSearching ? SearchList() : EmojiList()}
      </div>
    </div>
  );
};
