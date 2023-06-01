import React from 'react';
import {
  useCurrentSuggestionUser,
  usePlateEditorRef,
  useResetPlateEditor,
  useSuggestionActions,
} from '@udecode/plate';
import {
  MARK_SUGGESTION,
  SuggestionPlugin,
  useSuggestionSelectors,
} from '@udecode/plate-suggestion';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from '@/components/ui/toolbar-button';

export function UserToolbarDropdown() {
  const reset = useResetPlateEditor();
  const editor = usePlateEditorRef();
  const users = useSuggestionSelectors().users();
  const isSuggesting = useSuggestionSelectors().isSuggesting();
  const currentUser = useCurrentSuggestionUser();
  const setCurrentUserId = useSuggestionActions().currentUserId();

  if (!isSuggesting || !users.length || !currentUser) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          // pressed={open}
          tooltip="Switch user"
          isDropdown
          className="min-w-[140px]"
        >
          <>
            {currentUser?.name}
            {currentUser?.isOwner && ' (owner)'}
          </>
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[180px]">
        <DropdownMenuRadioGroup
          // value={value}
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
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
