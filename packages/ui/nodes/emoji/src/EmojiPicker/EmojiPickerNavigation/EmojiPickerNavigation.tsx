import React from 'react';
import { EmojiCategoryList, IEmojiFloatingLibrary } from '@udecode/plate-emoji';
import tw from 'twin.macro';
import { getEmojiPickerNavigationStyles } from './EmojiPickerNavigation.styles';
import {
  CategoryButtonProps,
  EmojiPickerNavigationProps,
} from './EmojiPickerNavigation.types';

const getBarProperty = (
  emojiLibrary: IEmojiFloatingLibrary,
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

  const CategoryButton = ({ categoryId }: CategoryButtonProps) => {
    return (
      <button
        key={categoryId}
        aria-label={i18n.categories[categoryId]}
        title={i18n.categories[categoryId]}
        type="button"
        css={`
          ${button?.css} ${categoryId === focusedCategory ? selected?.css : ''}
        `}
        onClick={() => onClick(categoryId)}
      >
        {icons.categories[categoryId].outline}
      </button>
    );
  };

  return (
    <nav id="emoji-nav" css={root.css}>
      <div css={tw`relative flex`}>
        {emojiLibrary.getCategories().map((categoryId) => (
          <CategoryButton categoryId={categoryId} key={categoryId} />
        ))}
        <div
          css={bar?.css}
          style={{
            visibility: `${focusedCategory ? 'visible' : 'hidden'}`,
            width: `${width}%`,
            transform: `translateX(${position}%)`,
          }}
        />
      </div>
    </nav>
  );
};
