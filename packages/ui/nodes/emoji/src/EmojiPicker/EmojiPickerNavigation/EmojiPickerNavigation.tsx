import React from 'react';
import { EmojiCategoryList, IEmojiFloatingLibrary } from '@udecode/plate-emoji';
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
    width = 100 / emojiLibrary.getGrid().size;
    position = focusedCategory
      ? emojiLibrary.indexOf(focusedCategory) * 100
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
        <span style={{ width: '20px', height: '20px' }}>
          {icons.categories[categoryId].outline}
        </span>
      </button>
    );
  };

  return (
    <nav id="emoji-nav" css={root.css}>
      <div className="relative flex">
        {emojiLibrary
          .getGrid()
          .sections()
          .map(({ id }) => (
            <CategoryButton categoryId={id} key={id} />
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
