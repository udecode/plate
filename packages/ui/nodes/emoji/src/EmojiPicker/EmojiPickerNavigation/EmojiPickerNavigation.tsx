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
        {emojiLibrary.getCategories().map((categoryId) => (
          <button
            key={categoryId}
            aria-label={i18n.categories[categoryId]}
            title={i18n.categories[categoryId]}
            type="button"
            css={button?.css}
            onClick={() => onClick(categoryId)}
          >
            {icons.categories[categoryId].outline}
          </button>
        ))}
      </div>
    </nav>
  );
};
