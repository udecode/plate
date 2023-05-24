import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  useSetIsSuggesting,
  useSuggestionSelectors,
} from '@udecode/plate-suggestion';
import { cn, cva } from '@udecode/plate-tailwind';
import { Edit2, Lightbulb } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from '@/plate/icon/ChevronDownIcon';

const radioItemVariants = cva(
  '&[data-disabled]:pointer-events-none &[data-highlighted]:bg-gray-200 relative flex h-[25px] cursor-pointer select-none items-center rounded-[3px] px-2.5 py-1 text-[13px] leading-[1] [all:unset]'
);

export function PlateSuggestionToolbarDropdown() {
  const setIsSuggesting = useSetIsSuggesting();
  const isSuggesting = useSuggestionSelectors().isSuggesting();

  const EditIcon = (
    <div className="flex items-center">
      <Edit2 className="mr-1 h-5 w-5" />
      Editing
    </div>
  );

  const SuggestingIcon = (
    <div className="flex items-center">
      <Lightbulb className="mr-1 h-5 w-5" />
      Suggesting
    </div>
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div>
          <Button className="flex min-w-[140px] items-center justify-between bg-blue-50 text-blue-500">
            {isSuggesting ? SuggestingIcon : EditIcon}
            <div>
              <ChevronDownIcon className="h-4 w-4" />
            </div>
          </Button>
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          className="z-[1001] min-w-[220px] rounded-[6px] bg-white px-0 py-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
        >
          <DropdownMenu.RadioGroup
            value="editing"
            onValueChange={(value) => {
              if (value === 'editing') {
                setIsSuggesting(false);
              } else {
                setIsSuggesting(true);
              }
            }}
          >
            <DropdownMenu.RadioItem
              value="editing"
              className={radioItemVariants()}
            >
              <div className={cn(!isSuggesting && 'text-blue-500')}>
                {EditIcon}
              </div>
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem
              value="suggesting"
              className={radioItemVariants()}
            >
              <div className={cn(isSuggesting && 'text-blue-500')}>
                {SuggestingIcon}
              </div>
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
