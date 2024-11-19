import type { EmojiCategoryList } from '@udecode/plate-emoji';
import type { UseEmojiPickerType } from '@udecode/plate-emoji/react';

import { cn } from '@udecode/cn';

import { Button } from './button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

export type EmojiPickerNavigationProps = {
  onClick: (id: EmojiCategoryList) => void;
} & Pick<
  UseEmojiPickerType,
  'emojiLibrary' | 'focusedCategory' | 'i18n' | 'icons'
>;

// KEEP: This is for the animated idicator bar under the icon - Opt in if needed
// const getBarProperty = (
//   emojiLibrary: IEmojiFloatingLibrary,
//   focusedCategory?: EmojiCategoryList
// ) => {
//   let width = 0;
//   let position = 0;

//   if (focusedCategory) {
//     width = 100 / emojiLibrary.getGrid().size;
//     position = focusedCategory
//       ? emojiLibrary.indexOf(focusedCategory) * 100
//       : 0;
//   }

//   return { position, width };
// };

export function EmojiPickerNavigation({
  emojiLibrary,
  focusedCategory,
  i18n,
  icons,
  onClick,
}: EmojiPickerNavigationProps) {
  // KEEP: This is for the animated idicator bar under the icon - Opt in if needed
  // const { position, width } = useMemo(
  //   () => getBarProperty(emojiLibrary, focusedCategory),
  //   [emojiLibrary, focusedCategory]
  // );

  return (
    <TooltipProvider delayDuration={500}>
      <nav
        id="emoji-nav"
        className="border-b-border mb-2.5 border-0 border-b border-solid p-1.5"
      >
        <div className="relative flex items-center justify-evenly">
          {emojiLibrary
            .getGrid()
            .sections()
            .map(({ id }) => (
              <Tooltip key={id}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      'text-muted-foreground hover:bg-muted hover:text-muted-foreground h-fit rounded-full fill-current p-1.5',
                      id === focusedCategory &&
                        'bg-accent text-accent-foreground pointer-events-none fill-current'
                    )}
                    onClick={() => {
                      onClick(id);
                    }}
                    aria-label={i18n.categories[id]}
                    type="button"
                  >
                    <span className="inline-flex size-5 items-center justify-center">
                      {icons.categories[id].outline}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {i18n.categories[id]}
                </TooltipContent>
              </Tooltip>
            ))}

          {/* This is the animated indicator - Opt In if needed */}
          {/* <div
            className={cn(
              'absolute -bottom-1.5 left-0 h-0.5 w-full rounded-t-lg bg-accent opacity-100 transition-transform duration-200'
            )}
            style={{
              transform: `translateX(${position}%)`,
              visibility: `${focusedCategory ? 'visible' : 'hidden'}`,
              width: `${width}%`,
            }}
          /> */}
        </div>
      </nav>
    </TooltipProvider>
  );
}
