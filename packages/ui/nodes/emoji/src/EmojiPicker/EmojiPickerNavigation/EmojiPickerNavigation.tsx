import React from 'react';
import { EmojiCategoryList, IEmojiFlyoutLibrary } from '@udecode/plate-emoji';
import tw from 'twin.macro';
import { getEmojiPickerNavigationStyles } from './EmojiPickerNavigation.styles';
import { EmojiPickerNavigationProps } from './EmojiPickerNavigation.types';

const getBarProperty = (
  emojiLibrary: IEmojiFlyoutLibrary,
  focusedCategory?: EmojiCategoryList
) => {
  let width = 0;
  let position = 0;
  if (focusedCategory) {
    width = 100 / emojiLibrary.getCategories().length;
    position = focusedCategory
      ? emojiLibrary.getCategories().indexOf(focusedCategory) * 100
      : 0;
  }

  return { width, position };
};

export const EmojiPickerNavigation = ({
  i18n,
  icons,
  emojiLibrary,
  focusedCategory,
  onClick,
  ...props
}: EmojiPickerNavigationProps) => {
  const { root, button, selected, bar } = getEmojiPickerNavigationStyles({
    ...props,
  });
  const { width, position } = getBarProperty(emojiLibrary, focusedCategory);

  return (
    <nav id="emoji-nav" css={root.css}>
      <div css={tw`relative flex`}>
        {emojiLibrary.getCategories().map((categoryId) => {
          return (
            <button
              key={categoryId}
              aria-label={i18n.categories[categoryId]}
              title={i18n.categories[categoryId]}
              type="button"
              css={`
                ${button?.css} ${categoryId === focusedCategory
                  ? selected?.css
                  : ''}
              `}
              onClick={() => onClick(categoryId)}
            >
              {icons.categories[categoryId].outline}
            </button>
          );
        })}
        {focusedCategory && (
          <div
            css={bar?.css}
            style={{
              width: `${width}%`,
              transform: `translateX(${position}%)`,
            }}
          />
        )}
      </div>
    </nav>
  );
};
