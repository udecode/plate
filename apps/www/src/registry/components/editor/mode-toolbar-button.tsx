'use client';

import {
  CheckIcon,
  EyeIcon,
  PencilLineIcon,
  PenIcon,
  XIcon,
} from 'lucide-react';
import { setEditorReadOnly } from 'platejs';
import { type AuthoredChange, AuthoredPlugin } from 'platejs/authored';
import {
  useEditor,
  useEditorSelector,
  useEditorViewState,
} from 'platejs/react';
import { SuggestionPlugin, useSuggestionMode } from 'platejs/suggestion/react';
import * as React from 'react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
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
  const suggestionsAvailable = useEditorSelector(
    (editor) => editor.plugin(SuggestionPlugin).installed
  );

  return suggestionsAvailable ? (
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
        <ToolbarButton
          aria-label={`Editing mode: ${MODE_ITEMS[value].label}`}
          pressed={open}
          tooltip="Editing mode"
          isDropdown
        >
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
            if (newValue === 'suggestion') {
              const suggestions = editor.plugin(SuggestionPlugin);

              suggestions.api.setMode('suggesting');
              // A refused switch keeps the mode, and Viewing stays read-only
              // rather than becoming Editing.
              if (suggestions.read.mode() === 'suggesting') {
                setEditorReadOnly(editor, false);
              }

              return;
            }
            setEditorReadOnly(editor, false);
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

        {suggestionsInstalled && <DecideAllItems readOnly={readOnly} />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DecideAllItems({ readOnly }: { readOnly: boolean }) {
  const editor = useEditor();
  const pending = useEditorSelector(
    (current) =>
      current.plugin(AuthoredPlugin).read.changes({ limit: 1 }).items.length > 0
  );
  const decideAll = (action: 'accept' | 'reject') => {
    const authored = editor.plugin(AuthoredPlugin);
    const changes: AuthoredChange[] = [];

    for (let cursor: string | undefined; ;) {
      const page = authored.read.changes({ cursor, limit: 200 });

      changes.push(...page.items);
      if (!page.cursor) break;
      ({ cursor } = page);
    }

    // Deciding every pending change together is never blocked.
    if (authored.update.decide({ action, changes }).status === 'invalid') {
      toast.error(
        `${action === 'accept' ? 'Accepting' : 'Rejecting'} every suggestion would leave the document invalid, so nothing changed.`
      );
    }
  };

  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem
          className="*:[svg]:text-muted-foreground"
          disabled={readOnly || !pending}
          finalFocus={() => editor.api.dom.focus()}
          onSelect={() => decideAll('accept')}
        >
          <CheckIcon />
          Accept all suggestions
        </DropdownMenuItem>
        <DropdownMenuItem
          className="*:[svg]:text-muted-foreground"
          disabled={readOnly || !pending}
          finalFocus={() => editor.api.dom.focus()}
          onSelect={() => decideAll('reject')}
        >
          <XIcon />
          Reject all suggestions
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  );
}
