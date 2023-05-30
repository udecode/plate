import React from 'react';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import {
  useEventPlateId,
  usePlateReadOnly,
  usePlateStore,
  useResetPlateEditor,
} from '@udecode/plate';
import { focusEditor } from '@udecode/plate-common';
import {
  useSetIsSuggesting,
  useSuggestionSelectors,
} from '@udecode/plate-suggestion';

import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useMyPlateEditorState } from '@/plate/demo/plate.types';

export function ModeDropdownMenu(props: DropdownMenuProps) {
  const editor = useMyPlateEditorState(useEventPlateId());
  const setReadOnly = usePlateStore().set.readOnly();
  const readOnly = usePlateReadOnly();
  const reset = useResetPlateEditor();
  const setIsSuggesting = useSetIsSuggesting();
  const isSuggesting = useSuggestionSelectors().isSuggesting();
  const openState = useOpenState();

  let value = 'editing';
  if (readOnly) value = 'viewing';
  if (isSuggesting) value = 'suggesting';

  const item = {
    editing: (
      <>
        <Icons.editing className="mr-2 h-5 w-5" />
        Editing
      </>
    ),
    suggesting: (
      <>
        <Icons.suggesting className="mr-2 h-5 w-5" />
        Suggesting
      </>
    ),
    viewing: (
      <>
        <Icons.viewing className="mr-2 h-5 w-5" />
        Viewing
      </>
    ),
  };

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          pressed={openState.open}
          tooltip="Editing mode"
          isDropdown
          className="min-w-[140px]"
        >
          {item[value]}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[180px]">
        <DropdownMenuRadioGroup
          className="flex flex-col gap-0.5"
          value={value}
          onValueChange={(newValue) => {
            reset();

            if (newValue !== 'viewing') {
              setReadOnly(false);
            }
            if (newValue !== 'suggesting') {
              setIsSuggesting(false);
            }

            if (newValue === 'viewing') {
              setReadOnly(true);
              return;
            }

            if (newValue === 'editing') {
              focusEditor(editor);
              return;
            }

            if (newValue === 'suggesting') {
              setIsSuggesting(true);
              focusEditor(editor);
            }
          }}
        >
          <DropdownMenuRadioItem value="editing">
            {item.editing}
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem value="suggesting">
            {item.suggesting}
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem value="viewing">
            {item.viewing}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
