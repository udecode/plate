import React from 'react';
import { gray } from '@radix-ui/colors';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { styled } from '@stitches/react';
import { CommentEdit } from '@styled-icons/boxicons-regular/CommentEdit';
import { ModeEdit } from '@styled-icons/material';
import { Button, ChevronDownIcon, cn } from '@udecode/plate';
import {
  useSetIsSuggesting,
  useSuggestionSelectors,
} from '@udecode/plate-suggestion';

const DropdownMenuContent = styled(DropdownMenu.Content, {
  zIndex: 1001,
  minWidth: 220,
  backgroundColor: 'white',
  borderRadius: 6,
  padding: '5px 0',
  boxShadow:
    '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
});

const DropdownMenuRadioItem = styled(DropdownMenu.RadioItem, {
  all: 'unset',
  fontSize: 13,
  lineHeight: 1,
  borderRadius: 3,
  display: 'flex',
  alignItems: 'center',
  height: 25,
  padding: '4px 10px',
  position: 'relative',
  userSelect: 'none',
  cursor: 'pointer',

  '&[data-disabled]': {
    pointerEvents: 'none',
  },

  '&[data-highlighted]': {
    backgroundColor: gray.gray2,
  },
});

export function PlateSuggestionToolbarDropdown() {
  const setIsSuggesting = useSetIsSuggesting();
  const isSuggesting = useSuggestionSelectors().isSuggesting();

  const EditIcon = (
    <div className="flex items-center">
      <ModeEdit className="mr-1 h-5 w-5" />
      Editing
    </div>
  );

  const SuggestingIcon = (
    <div className="flex items-center">
      <CommentEdit className="mr-1 h-5 w-5" />
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
        <DropdownMenuContent align="start">
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
            <DropdownMenuRadioItem value="editing">
              <div className={cn(!isSuggesting && 'text-blue-500')}>
                {EditIcon}
              </div>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="suggesting">
              <div className={cn(isSuggesting && 'text-blue-500')}>
                {SuggestingIcon}
              </div>
            </DropdownMenuRadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
