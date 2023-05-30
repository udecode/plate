import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  useCurrentSuggestionUser,
  usePlateEditorRef,
  useResetPlateEditor,
  useSuggestionActions,
} from '@udecode/plate';
import {
  MARK_SUGGESTION,
  SuggestionPlugin,
  useSetIsSuggesting,
  useSuggestionSelectors,
} from '@udecode/plate-suggestion';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenuContent,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function SuggestionToolbarDropdown() {
  const reset = useResetPlateEditor();
  const setIsSuggesting = useSetIsSuggesting();
  const isSuggesting = useSuggestionSelectors().isSuggesting();

  const EditIcon = (
    <div tw="flex items-center">
      {/* <ModeEdit tw="h-5 w-5 mr-1" /> */}
      Editing
    </div>
  );

  const SuggestingIcon = (
    <div tw="flex items-center">
      {/* <CommentEdit tw="h-5 w-5 mr-1" /> */}
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
              <Icons.arrowDown className="h-4 w-4" />
            </div>
          </Button>
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenuContent
          align="start"
          className={
            cn()
            // 'z-1000 min-w-[220px] bg-popover'
            //   borderRadius: 6,
            //   padding: '5px 0',
            //   boxShadow:
            //     '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
          }
        >
          <DropdownMenu.RadioGroup
            value="editing"
            onValueChange={(value) => {
              if (value === 'editing') {
                reset();
                setIsSuggesting(false);
              } else {
                reset();
                setIsSuggesting(true);
              }
            }}
          >
            <DropdownMenuRadioItem value="editing">
              <div
                className={cn(
                  !isSuggesting && 'text-blue-500'
                  // all: 'unset',
                  //   fontSize: 13,
                  //   lineHeight: 1,
                  //   borderRadius: 3,
                  //   display: 'flex',
                  //   alignItems: 'center',
                  //   height: 25,
                  //   padding: '4px 10px',
                  //   position: 'relative',
                  //   userSelect: 'none',
                  //   cursor: 'pointer',
                  //
                  //   '&[data-disabled]': {
                  //     pointerEvents: 'none',
                  //   },
                  //
                  //   '&[data-highlighted]': {
                  //     backgroundColor: gray.gray2,
                  //   },
                )}
              >
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

export function UserToolbarDropdown() {
  const reset = useResetPlateEditor();
  const editor = usePlateEditorRef();
  const users = useSuggestionSelectors().users();
  const isSuggesting = useSuggestionSelectors().isSuggesting();
  const currentUser = useCurrentSuggestionUser();
  const setCurrentUserId = useSuggestionActions().currentUserId();

  if (!isSuggesting) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div>
          <Button tw="ml-2 min-w-[140px] flex justify-between items-center text-blue-500 bg-blue-50">
            {currentUser?.name}
            {currentUser?.isOwner && ' (owner)'}
            <div>
              <Icons.arrowDown tw="h-4 w-4" />
            </div>
          </Button>
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenuContent align="start">
          <DropdownMenu.RadioGroup
            value="editing"
            onValueChange={(value) => {
              reset();
              setCurrentUserId(value);
              (
                editor.pluginsByKey[MARK_SUGGESTION].options as SuggestionPlugin
              ).currentUserId = value;
            }}
          >
            {Object.keys(users).map((key) => {
              const user = users[key];

              return (
                <DropdownMenuRadioItem key={user.id} value={user.id}>
                  <>
                    {user.name}
                    {user.isOwner && ' (owner)'}
                  </>
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenu.RadioGroup>
        </DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
