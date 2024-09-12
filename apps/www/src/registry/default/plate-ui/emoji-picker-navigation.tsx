import React from 'react';

import type { EmojiCategoryList } from '@udecode/plate-emoji';
import type {
  IEmojiFloatingLibrary,
  UseEmojiPickerType,
} from '@udecode/plate-emoji/react';

import { cn } from '@udecode/cn';

import { Button } from './button';

export type EmojiPickerNavigationProps = {
  onClick: (id: EmojiCategoryList) => void;
} & Pick<
  UseEmojiPickerType,
  'emojiLibrary' | 'focusedCategory' | 'i18n' | 'icons'
>;

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

  return { position, width };
};

export function EmojiPickerNavigation({
  emojiLibrary,
  focusedCategory,
  i18n,
  icons,
  onClick,
}: EmojiPickerNavigationProps) {
  const { position, width } = getBarProperty(emojiLibrary, focusedCategory);

  return (
    <nav
      id="emoji-nav"
      className="mb-2.5 border-0 border-b border-solid border-b-border p-3"
    >
      <div className="relative flex items-center">
        {emojiLibrary
          .getGrid()
          .sections()
          .map(({ id }) => (
            <Button
              key={id}
              size="icon"
              variant="ghost"
              className={cn(
                'size-6 grow fill-current text-muted-foreground hover:bg-transparent hover:text-foreground',
                id === focusedCategory &&
                  'pointer-events-none fill-current text-primary'
              )}
              onClick={() => onClick(id)}
              title={i18n.categories[id]}
              aria-label={i18n.categories[id]}
              type="button"
            >
              <span className="size-5">{icons.categories[id].outline}</span>
            </Button>
          ))}
        <div
          className="absolute -bottom-3 left-0 h-0.5 w-full rounded-t-lg bg-primary opacity-100 transition-transform duration-200"
          style={{
            transform: `translateX(${position}%)`,
            visibility: `${focusedCategory ? 'visible' : 'hidden'}`,
            width: `${width}%`,
          }}
        />
      </div>
    </nav>
  );
}
