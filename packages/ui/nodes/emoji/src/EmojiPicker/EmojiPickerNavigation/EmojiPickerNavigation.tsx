import React from 'react';
import tw from 'twin.macro';
import { getEmojiPickerNavigationStyles } from './EmojiPickerNavigation.styles';
import { EmojiPickerNavigationProps } from './EmojiPickerNavigation.types';

export const EmojiPickerNavigation = ({
  i18n,
  icons,
  emojiLibrary,
  onClick,
  ...props
}: EmojiPickerNavigationProps) => {
  const { root, button } = getEmojiPickerNavigationStyles({ ...props });

  return (
    <nav id="emoji-nav" css={root.css}>
      <div css={tw`relative flex`}>
        {emojiLibrary.getCategories().map((category) => (
          <button
            key={category.id}
            aria-label={i18n.categories[category.id]}
            title={i18n.categories[category.id]}
            type="button"
            css={button?.css}
            onClick={() => onClick(category.id)}
          >
            {icons.categories[category.id].outline}
          </button>
        ))}
      </div>
    </nav>
  );
};
