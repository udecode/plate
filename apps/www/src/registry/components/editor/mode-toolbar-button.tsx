'use client';

import { SuggestionPlugin } from '@platejs/suggestion/react';
import {
  type DropdownMenuProps,
  DropdownMenuItemIndicator,
} from '@radix-ui/react-dropdown-menu';
import { CheckIcon, EyeIcon, PencilLineIcon, PenIcon } from 'lucide-react';
import { setEditorReadOnly } from 'platejs';
import { useEditor, useEditorViewState, usePluginStore } from 'platejs/react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ToolbarButton } from './toolbar';

const MODE_ITEMS = {
  editing: {
    icon: <PenIcon />,
    label: 'Editing',
  },
  suggestion: {
    icon: <PencilLineIcon />,
    label: 'Suggestion',
  },
  viewing: {
    icon: <EyeIcon />,
    label: 'Viewing',
  },
} satisfies Record<string, { icon: React.ReactNode; label: string }>;

export function ModeToolbarButton(props: DropdownMenuProps) {
  const editor = useEditor();
  const readOnly = useEditorViewState(editor, (view) => view.isReadOnly());
  const [open, setOpen] = React.useState(false);

  const isSuggesting = usePluginStore(SuggestionPlugin, 'isSuggesting');

  let value: keyof typeof MODE_ITEMS = 'editing';

  if (readOnly) value = 'viewing';

  if (isSuggesting) value = 'suggestion';

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Editing mode" isDropdown>
          {MODE_ITEMS[value].icon}
          <span className="hidden lg:inline">{MODE_ITEMS[value].label}</span>
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[180px]">
        <DropdownMenuRadioGroup
          onValueChange={(newValue) => {
            if (newValue === 'viewing') {
              setEditorReadOnly(editor, true);

              return;
            }
            setEditorReadOnly(editor, false);

            if (newValue === 'suggestion') {
              editor.plugin(SuggestionPlugin).store.set({ isSuggesting: true });

              return;
            }
            editor.plugin(SuggestionPlugin).store.set({ isSuggesting: false });

            if (newValue === 'editing') {
              editor.api.dom.focus();
            }
          }}
          value={value}
        >
          <DropdownMenuRadioItem
            className="pl-2 *:first:[span]:hidden *:[svg]:text-muted-foreground"
            value="editing"
          >
            <Indicator />
            {MODE_ITEMS.editing.icon}
            {MODE_ITEMS.editing.label}
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem
            className="pl-2 *:first:[span]:hidden *:[svg]:text-muted-foreground"
            value="viewing"
          >
            <Indicator />
            {MODE_ITEMS.viewing.icon}
            {MODE_ITEMS.viewing.label}
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem
            className="pl-2 *:first:[span]:hidden *:[svg]:text-muted-foreground"
            value="suggestion"
          >
            <Indicator />
            {MODE_ITEMS.suggestion.icon}
            {MODE_ITEMS.suggestion.label}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Indicator() {
  return (
    <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
      <DropdownMenuItemIndicator>
        <CheckIcon />
      </DropdownMenuItemIndicator>
    </span>
  );
}
