export const plateSuggestionToolbarDropdownCode = `import React from 'react';
import { gray } from '@radix-ui/colors';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { styled } from '@stitches/react';
import { CommentEdit } from '@styled-icons/boxicons-regular/CommentEdit';
import { ModeEdit } from '@styled-icons/material';
import { ChevronDownIcon, PlateButton } from '@udecode/plate';
import {
  useSetIsSuggesting,
  useSuggestionSelectors,
} from '@udecode/plate-suggestion';
import tw from 'twin.macro';

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

export const PlateSuggestionToolbarDropdown = () => {
  const setIsSuggesting = useSetIsSuggesting();
  const isSuggesting = useSuggestionSelectors().isSuggesting();

  const EditIcon = (
    <div tw="flex items-center">
      <ModeEdit tw="h-5 w-5 mr-1" />
      Editing
    </div>
  );

  const SuggestingIcon = (
    <div tw="flex items-center">
      <CommentEdit tw="h-5 w-5 mr-1" />
      Suggesting
    </div>
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div>
          <PlateButton tw="min-w-[140px] flex justify-between items-center text-blue-500 bg-blue-50">
            {isSuggesting ? SuggestingIcon : EditIcon}
            <div>
              <ChevronDownIcon tw="h-4 w-4" />
            </div>
          </PlateButton>
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
              <div css={[!isSuggesting && tw\`text-blue-500\`]}>{EditIcon}</div>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="suggesting">
              <div css={[isSuggesting && tw\`text-blue-500\`]}>
                {SuggestingIcon}
              </div>
            </DropdownMenuRadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
`;

export const plateSuggestionToolbarDropdownFile = {
  '/suggestion/PlateSuggestionToolbarDropdown.tsx': plateSuggestionToolbarDropdownCode,
};
