'use client';

import {
  CheckIcon,
  EyeIcon,
  PencilLineIcon,
  PenIcon,
  XIcon,
} from 'lucide-react';
import { setEditorViewing } from 'platejs';
import {
  type AuthoredChange,
  AuthoredPlugin,
  type AuthoredView,
} from 'platejs/authored';
import { BaseLockPlugin } from 'platejs/lock';
import { useEditor, useEditorSelector } from 'platejs/react';
import { SuggestionPlugin } from 'platejs/suggestion/react';
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

const proposes = (view: AuthoredView) =>
  'intent' in view && view.intent === 'propose';

export function ModeToolbarButton() {
  const suggestionsAvailable = useEditorSelector(
    (editor) => editor.plugin(SuggestionPlugin).installed
  );

  return suggestionsAvailable ? (
    <SuggestionModeToolbarButton />
  ) : (
    <ModeToolbarButtonContent isSuggesting={null} />
  );
}

function SuggestionModeToolbarButton() {
  const isSuggesting = useEditorSelector(
    (current) => proposes(current.plugin(AuthoredPlugin).read.view()),
    { dependsOn: 'authored' }
  );

  return <ModeToolbarButtonContent isSuggesting={isSuggesting} />;
}

function ModeToolbarButtonContent({
  isSuggesting,
}: {
  isSuggesting: boolean | null;
}) {
  const editor = useEditor();
  const viewing = useEditorSelector(
    (current) => current.read.view.isViewing(),
    { dependsOn: 'readOnly' }
  );
  const readOnly = useEditorSelector(
    (current) => current.read.view.isReadOnly(),
    { dependsOn: 'readOnly' }
  );
  const [open, setOpen] = React.useState(false);
  const suggestionsInstalled = isSuggesting !== null;
  const value = viewing ? 'viewing' : isSuggesting ? 'suggestion' : 'editing';

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
              setEditorViewing(editor, true);

              return;
            }
            if (newValue === 'suggestion') {
              const authored = editor.plugin(AuthoredPlugin);

              authored.api.setView({ intent: 'propose' });
              if (proposes(authored.read.view())) {
                setEditorViewing(editor, false);
              }

              return;
            }
            setEditorViewing(editor, false);
            if (suggestionsInstalled) {
              editor.plugin(AuthoredPlugin).api.setView({ intent: 'edit' });
            }
          }}
          value={value}
        >
          <DropdownMenuRadioItem
            className="*:[svg]:text-muted-foreground"
            finalFocus={() => editor.api.dom.focus()}
            value="editing"
          >
            {MODE_ITEMS.editing.icon}
            {MODE_ITEMS.editing.label}
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem
            className="*:[svg]:text-muted-foreground"
            value="viewing"
          >
            {MODE_ITEMS.viewing.icon}
            {MODE_ITEMS.viewing.label}
          </DropdownMenuRadioItem>

          {suggestionsInstalled && (
            <DropdownMenuRadioItem
              className="*:[svg]:text-muted-foreground"
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

    const lock = editor.plugin(BaseLockPlugin);
    const decidable = lock.installed
      ? changes.filter(
          (change) => !change.ranges.some((range) => lock.read.isLocked(range))
        )
      : changes;
    const skipped = changes.length - decidable.length;
    const verb = action === 'accept' ? 'Accepting' : 'Rejecting';

    if (decidable.length === 0) {
      toast.info(
        'Every suggestion is inside a locked block. Unlock the blocks to accept or reject them.'
      );

      return;
    }
    const { status } = authored.update.decide({ action, changes: decidable });

    if (status === 'invalid') {
      toast.error(
        `${verb} every suggestion would leave the document invalid, so nothing changed.`
      );

      return;
    }
    // Deciding every pending change together is never blocked, so only the
    // locked changes left out can block the rest.
    if (status === 'blocked') {
      toast.info(
        'The unlocked suggestions depend on suggestions inside locked blocks, so nothing changed.'
      );

      return;
    }
    if (skipped > 0) {
      toast.info(
        `Skipped ${skipped} suggestion${skipped === 1 ? '' : 's'} inside locked blocks.`
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
