import React, { memo, useMemo } from 'react';
import { Emoji } from '@udecode/plate-emoji';
import { getEmojiPickerContentStyles } from './EmojiPickerContent.styles';
import {
  ButtonProps,
  EmojiPickerContentProps,
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

export const EmojiPickerContent = ({
  i18n,
  setEmoji,
  selectEmoji,
  emojiLibrary,
  isSearching = false,
  searchResult,
  ...props
}: EmojiPickerContentProps) => {
  const styles = getEmojiPickerContentStyles({ ...props });

  const EmojiList = useMemo(
    () =>
      emojiLibrary.getCategories().map((category) => (
        <div key={category.id} data-id={category.id}>
          <div css={styles.sticky?.css}>{i18n.categories[category.id]}</div>
          <div css={styles.category?.css}>
            {category.emojis.map((emojiId: string, index: any) => (
              <Button
                key={emojiId}
                index={index}
                emoji={emojiLibrary.getEmoji(emojiId)}
                onClick={selectEmoji}
                onMouseHandler={setEmoji}
              />
            ))}
          </div>
        </div>
      )),
    [emojiLibrary, i18n.categories, selectEmoji, setEmoji, styles]
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
    <div css={styles.root.css}>
      <div css={styles.content?.css}>
        {isSearching ? SearchList : EmojiList}
      </div>
    </div>
  );
};
