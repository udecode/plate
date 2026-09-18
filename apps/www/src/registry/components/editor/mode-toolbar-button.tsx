'use client';

import { EyeIcon, PencilLineIcon, PenIcon } from 'lucide-react';
import { setEditorReadOnly } from 'platejs';
import {
  useEditor,
  useEditorSelector,
  useEditorViewState,
} from 'platejs/react';
import { SuggestionPlugin, useSuggestionMode } from 'platejs/suggestion/react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

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

export function ModeToolbarButton() {
  const suggestionsInstalled = useEditorSelector(
    (editor) => editor.plugin(SuggestionPlugin).installed
  );

  return suggestionsInstalled ? (
    <SuggestionModeToolbarButton />
  ) : (
    <ModeToolbarButtonContent suggestionMode={null} />
  );
}

function SuggestionModeToolbarButton() {
  const suggestionMode = useSuggestionMode();

  return <ModeToolbarButtonContent suggestionMode={suggestionMode} />;
}

function ModeToolbarButtonContent({
  suggestionMode,
}: {
  suggestionMode: 'editing' | 'suggesting' | null;
}) {
  const editor = useEditor();
  const readOnly = useEditorViewState(editor, (view) => view.isReadOnly());
  const [open, setOpen] = React.useState(false);
  const suggestionsInstalled = suggestionMode !== null;
  const isSuggesting = suggestionMode === 'suggesting';
  const value = readOnly ? 'viewing' : isSuggesting ? 'suggestion' : 'editing';

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger>
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
              editor.plugin(SuggestionPlugin).api.setMode('suggesting');

              return;
            }
            if (suggestionsInstalled) {
              editor.plugin(SuggestionPlugin).api.setMode('editing');
            }
          }}
          value={value}
        >
          <DropdownMenuRadioItem
            className="pl-2 *:first:[span]:hidden *:[svg]:text-muted-foreground"
            finalFocus={() => editor.api.dom.focus()}
            value="editing"
          >
            {MODE_ITEMS.editing.icon}
            {MODE_ITEMS.editing.label}
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem
            className="pl-2 *:first:[span]:hidden *:[svg]:text-muted-foreground"
            value="viewing"
          >
            {MODE_ITEMS.viewing.icon}
            {MODE_ITEMS.viewing.label}
          </DropdownMenuRadioItem>

          {suggestionsInstalled && (
            <DropdownMenuRadioItem
              className="pl-2 *:first:[span]:hidden *:[svg]:text-muted-foreground"
              value="suggestion"
            >
              {MODE_ITEMS.suggestion.icon}
              {MODE_ITEMS.suggestion.label}
            </DropdownMenuRadioItem>
          )}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
