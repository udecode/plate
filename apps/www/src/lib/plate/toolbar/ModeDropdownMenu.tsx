import React, { useCallback, useState } from 'react';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import {
  useEventPlateId,
  usePlateReadOnly,
  usePlateStore,
} from '@udecode/plate';
import { focusEditor } from '@udecode/plate-common';

import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useMyPlateEditorState } from '@/plate/demo/plate.types';

export function ModeDropdownMenu(props: DropdownMenuProps) {
  const editor = useMyPlateEditorState(useEventPlateId());
  const setReadOnly = usePlateStore().set.readOnly();
  const readOnly = usePlateReadOnly();

  let value = 'editing';
  if (readOnly) value = 'viewing';

  const [open, setOpen] = useState(false);
  const onToggle = useCallback(
    (_value = !open) => {
      setOpen(_value);
    },
    [open]
  );

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
        <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground no-underline group-hover:no-underline">
          Soon
        </span>
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
    <DropdownMenu open={open} modal={false} onOpenChange={onToggle} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          pressed={open}
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
            if (newValue === 'viewing') {
              setReadOnly(true);
              return;
            }

            setReadOnly(false);
            focusEditor(editor);
          }}
        >
          <DropdownMenuRadioItem value="editing">
            {item.editing}
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem value="suggesting" disabled>
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
