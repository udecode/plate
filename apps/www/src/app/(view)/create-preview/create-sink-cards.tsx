'use client';

import type { EditorReference } from 'platejs';
import { EditorRoot } from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { useCreatePreviewConfig } from './create-preview-context';
import type { CreateSinkKit } from './create-sink-types';
import {
  AI_QUICK_PROMPTS,
  EDITOR_SHORTCUTS,
  INITIAL_AI_DRAFT,
  PREVIEW_ICONS,
  SELECT_DEFAULT_ITEMS,
  SELECT_LABELS,
  SLASH_COMMANDS,
  TURN_INTO_OPTIONS,
} from './create-sink-values';
import { IconPlaceholder } from './icon-placeholder';

function formatTokenName(value: string) {
  return value
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ');
}

export function TypographySpecimenCard({ kit }: { kit: CreateSinkKit }) {
  const {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Textarea,
  } = kit;
  const config = useCreatePreviewConfig();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [title, setTitle] = React.useState('Q4 Release Spec');
  const [summary, setSummary] = React.useState(
    'Shared document conventions and preset tokens for Plate v2.'
  );

  const headingLabel =
    config.fontHeading && config.fontHeading !== 'inherit'
      ? formatTokenName(config.fontHeading)
      : 'Inherit';
  const bodyLabel = formatTokenName(config.font);

  return (
    <section
      className="cn-card flex flex-col gap-3 bg-card p-4 text-card-foreground"
      data-slot="card"
    >
      <div className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {headingLabel} &middot; {bodyLabel}
      </div>
      <p className="cn-font-heading style-sera:text-lg style-sera:font-semibold style-sera:tracking-wider style-sera:uppercase text-xl font-medium tracking-tight">
        Designing editors with rhythm and hierarchy.
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Readable body copy balances heading weight, inline{' '}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">
          code
        </code>
        , and keyboard hints like{' '}
        <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-xs text-foreground">
          ⌘K
        </kbd>
        .
      </p>

      <Button
        className="mt-1 w-full"
        onClick={() => setDialogOpen(true)}
        size="sm"
        type="button"
        variant="outline"
      >
        <IconPlaceholder
          className="size-3.5"
          hugeicons="SettingsIcon"
          lucide="Settings"
          phosphor="GearIcon"
          remixicon="RiSettingsLine"
          tabler="IconSettings"
        />
        Document properties
      </Button>

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document properties</DialogTitle>
            <DialogDescription>
              Update metadata for this Plate document.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-1">
            <div className="flex flex-col gap-1.5 text-xs font-medium">
              <label htmlFor="sink-doc-title">Title</label>
              <Input
                id="sink-doc-title"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
            </div>
            <div className="flex flex-col gap-1.5 text-xs font-medium">
              <label htmlFor="sink-doc-summary">Summary</label>
              <Textarea
                className="min-h-20 resize-none text-sm"
                id="sink-doc-summary"
                onChange={(event) => setSummary(event.target.value)}
                value={summary}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setDialogOpen(false)}
              size="sm"
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setDialogOpen(false)}
              size="sm"
              type="button"
              variant="default"
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function IconPreviewGridCard() {
  const config = useCreatePreviewConfig();

  return (
    <section
      className="cn-card flex flex-col gap-3 bg-card p-4 text-card-foreground"
      data-slot="card"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">Editor icons</span>
        <span className="font-mono text-xs text-muted-foreground">
          {config.iconLibrary}
        </span>
      </div>
      <div className="grid grid-cols-8 place-items-center gap-2">
        {PREVIEW_ICONS.map((icon) => (
          <div
            key={icon.lucide}
            className="style-sera:rounded-none flex size-8 items-center justify-center rounded-md ring-1 ring-border *:[svg]:size-4"
          >
            <IconPlaceholder
              hugeicons={icon.hugeicons}
              lucide={icon.lucide}
              phosphor={icon.phosphor}
              remixicon={icon.remixicon}
              tabler={icon.tabler}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function SlashCommandCard({
  kit,
  onPickCommand,
}: {
  kit: CreateSinkKit;
  onPickCommand: (label: string) => void;
}) {
  const {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
  } = kit;

  return (
    <div
      className="cn-popover-content cn-menu-target overflow-hidden rounded-xl border bg-popover p-0 text-popover-foreground shadow-sm"
      data-menu-translucent=""
      data-slot="sink-slash-menu"
    >
      <Command className="bg-transparent">
        <CommandInput placeholder="Filter slash commands..." />
        <CommandList className="max-h-none">
          <CommandEmpty>No matching commands.</CommandEmpty>
          <CommandGroup heading="Insert block">
            {SLASH_COMMANDS.map((item) => (
              <CommandItem
                key={item.label}
                onSelect={() => onPickCommand(item.label)}
                value={item.label}
              >
                <span className="flex size-4 shrink-0 items-center justify-center">
                  {item.icon}
                </span>
                <span>{item.label}</span>
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}

export function AIAssistantCard({
  kit,
  onInsert,
}: {
  kit: CreateSinkKit;
  onInsert: (text: string) => void;
}) {
  const { Button, Input } = kit;
  const [prompt, setPrompt] = React.useState('');
  const [draft, setDraft] = React.useState(INITIAL_AI_DRAFT);
  const [status, setStatus] = React.useState<'accepted' | 'ready'>('ready');

  const submitPrompt = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setDraft(trimmed);
    setStatus('ready');
    setPrompt('');
  };

  return (
    <section
      className="cn-card flex flex-col gap-3 bg-card p-4 text-card-foreground"
      data-slot="card"
    >
      <div className="flex items-center gap-2 text-xs font-medium">
        <IconPlaceholder
          className="size-3.5 text-primary"
          hugeicons="SparklesIcon"
          lucide="SparklesIcon"
          phosphor="SparkleIcon"
          remixicon="RiSparklingLine"
          tabler="IconSparkles"
        />
        <span>Rewrite concisely</span>
        <span
          className={cn(
            'cn-badge ms-auto inline-flex items-center',
            status === 'accepted'
              ? 'cn-badge-variant-default'
              : 'cn-badge-variant-secondary'
          )}
        >
          {status === 'accepted' ? 'Applied' : 'Ready'}
        </span>
      </div>

      <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-sm leading-relaxed text-foreground">
        {draft}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {AI_QUICK_PROMPTS.map((preset) => (
          <button
            key={preset.label}
            className="cn-badge cn-badge-variant-outline cursor-pointer hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setDraft(preset.draft);
              setStatus('ready');
            }}
            type="button"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          onClick={() => {
            onInsert(draft);
            setStatus('accepted');
          }}
          size="sm"
          type="button"
          variant="default"
        >
          <IconPlaceholder
            className="size-3.5"
            hugeicons="Tick02Icon"
            lucide="Check"
            phosphor="CheckIcon"
            remixicon="RiCheckLine"
            tabler="IconCheck"
          />
          Accept
        </Button>
        <Button
          onClick={() => onInsert(draft)}
          size="sm"
          type="button"
          variant="outline"
        >
          <IconPlaceholder
            className="size-3.5"
            hugeicons="PencilEdit02Icon"
            lucide="PenLine"
            phosphor="PencilLineIcon"
            remixicon="RiEditLine"
            tabler="IconWriting"
          />
          Insert below
        </Button>
        <Button
          onClick={() => {
            setDraft(INITIAL_AI_DRAFT);
            setStatus('ready');
          }}
          size="sm"
          type="button"
          variant="ghost"
        >
          Discard
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          aria-label="Ask AI prompt"
          className="h-8 text-sm"
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submitPrompt();
            }
          }}
          placeholder="Ask AI anything..."
          type="text"
          value={prompt}
        />
        <Button
          onClick={submitPrompt}
          size="sm"
          type="button"
          variant="default"
        >
          Run
        </Button>
      </div>
    </section>
  );
}

export function UIElementsCard({ kit }: { kit: CreateSinkKit }) {
  const {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
    Checkbox,
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
    Separator,
    Toggle,
  } = kit;
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [findQuery, setFindQuery] = React.useState('');

  return (
    <section
      className="cn-card flex flex-col gap-3.5 bg-card p-4 text-card-foreground"
      data-slot="card"
    >
      <div className="flex flex-wrap gap-1.5">
        <Button size="sm" type="button" variant="default">
          Publish
        </Button>
        <Button size="sm" type="button" variant="secondary">
          Share
        </Button>
        <Button size="sm" type="button" variant="outline">
          Export
        </Button>
        <Button size="sm" type="button" variant="ghost">
          History
        </Button>
      </div>

      <InputGroup>
        <InputGroupInput
          aria-label="Find in document"
          onChange={(event) => setFindQuery(event.target.value)}
          placeholder="Find in document..."
          value={findQuery}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupText>
            <IconPlaceholder
              className="size-3.5"
              hugeicons="SearchIcon"
              lucide="SearchIcon"
              phosphor="MagnifyingGlassIcon"
              remixicon="RiSearchLine"
              tabler="IconSearch"
            />
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Toggle
            aria-label="Toggle bold"
            defaultPressed
            size="sm"
            variant="outline"
          >
            <IconPlaceholder
              className="size-3.5"
              hugeicons="TextBoldIcon"
              lucide="BoldIcon"
              phosphor="TextBIcon"
              remixicon="RiBold"
              tabler="IconBold"
            />
          </Toggle>
          <Toggle aria-label="Toggle italic" size="sm" variant="outline">
            <IconPlaceholder
              className="size-3.5"
              hugeicons="TextItalicIcon"
              lucide="ItalicIcon"
              phosphor="TextItalicIcon"
              remixicon="RiItalic"
              tabler="IconItalic"
            />
          </Toggle>
          <Toggle aria-label="Toggle underline" size="sm" variant="outline">
            <IconPlaceholder
              className="size-3.5"
              hugeicons="TextUnderlineIcon"
              lucide="UnderlineIcon"
              phosphor="TextUnderlineIcon"
              remixicon="RiUnderline"
              tabler="IconUnderline"
            />
          </Toggle>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="cn-badge cn-badge-variant-default">Beta</span>
          <span className="cn-badge cn-badge-variant-secondary">MIT</span>
          <span className="cn-badge cn-badge-variant-outline">v54</span>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Checkbox defaultChecked id="sink-check-md" />
          <label className="cursor-pointer" htmlFor="sink-check-md">
            Markdown autoformat shortcuts
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox defaultChecked id="sink-check-suggest" />
          <label className="cursor-pointer" htmlFor="sink-check-suggest">
            Track suggestions per author
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-0.5">
        <Button
          onClick={() => setAlertOpen(true)}
          size="xs"
          type="button"
          variant="outline"
        >
          Reset draft...
        </Button>
        <Button size="xs" type="button" variant="destructive">
          <IconPlaceholder
            className="size-3"
            hugeicons="Delete02Icon"
            lucide="Trash2Icon"
            phosphor="TrashIcon"
            remixicon="RiDeleteBinLine"
            tabler="IconTrash"
          />
          Clear
        </Button>
      </div>

      <AlertDialog onOpenChange={setAlertOpen} open={alertOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset editor draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This restores the initial Plate Sink document and clears local
              formatting edits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => setAlertOpen(false)}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

export function ColorPaletteCard({ kit }: { kit: CreateSinkKit }) {
  const { defaultColors } = kit;
  const swatches = defaultColors.slice(0, 20);
  const [selectedColor, setSelectedColor] = React.useState(
    swatches[16]?.value ?? '#4A86E8'
  );
  const [selectedName, setSelectedName] = React.useState(
    swatches[16]?.name ?? 'cornflower blue'
  );

  return (
    <section
      className="cn-card flex flex-col gap-3 bg-card p-4 text-card-foreground"
      data-slot="card"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">Color swatches</span>
        <span className="font-mono text-xs text-muted-foreground">
          {selectedName}
        </span>
      </div>

      <div className="grid grid-cols-10 gap-1.5">
        {swatches.map((color) => {
          const active = selectedColor === color.value;

          return (
            <button
              key={color.value}
              aria-label={color.name}
              aria-pressed={active}
              className={cn(
                'flex aspect-square w-full cursor-pointer items-center justify-center rounded-sm border transition-transform hover:scale-105',
                active && 'ring-2 ring-ring ring-offset-1 ring-offset-card'
              )}
              onClick={() => {
                setSelectedColor(color.value);
                setSelectedName(color.name);
              }}
              style={{ backgroundColor: color.value }}
              title={color.name}
              type="button"
            />
          );
        })}
      </div>

      <div className="rounded-lg border bg-muted/40 px-3 py-2 text-xs">
        <span style={{ color: selectedColor }}>Colored text</span>
        <span className="mx-2 text-muted-foreground">&middot;</span>
        <span
          className="rounded-sm px-1.5 py-0.5 text-foreground"
          style={{ backgroundColor: `${selectedColor}33` }}
        >
          Highlight preview
        </span>
      </div>
    </section>
  );
}

export function ShortcutsCard() {
  return (
    <section
      className="cn-card flex flex-col gap-2.5 bg-card p-4 text-card-foreground"
      data-slot="card"
    >
      <div className="text-xs font-medium">Keyboard shortcuts</div>
      <div className="flex flex-col divide-y divide-border/60">
        {EDITOR_SHORTCUTS.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between py-1.5 text-xs first:pt-0 last:pb-0"
          >
            <span className="text-muted-foreground">{item.label}</span>
            <div className="flex items-center gap-1">
              {item.keys.map((key) => (
                <kbd
                  key={key}
                  className="inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1 font-mono text-xs font-medium text-muted-foreground"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BlockMenuCard() {
  const [selectedBlock, setSelectedBlock] = React.useState('Heading 1');

  return (
    <div
      className="grid grid-cols-1 gap-2 sm:grid-cols-[1.05fr_0.95fr]"
      data-slot="sink-block-menu"
    >
      <div
        className="cn-dropdown-menu-content cn-menu-target flex flex-col gap-0.5"
        data-menu-translucent=""
      >
        <div className="cn-dropdown-menu-item flex items-center bg-accent text-accent-foreground">
          <IconPlaceholder
            className="size-4"
            hugeicons="MagicWand01Icon"
            lucide="Wand"
            phosphor="MagicWandIcon"
            remixicon="RiMagicLine"
            tabler="IconWand"
          />
          <span>Ask AI</span>
        </div>
        <div className="cn-dropdown-menu-sub-trigger flex items-center">
          <IconPlaceholder
            className="size-4"
            hugeicons="ParagraphIcon"
            lucide="PilcrowIcon"
            phosphor="ParagraphIcon"
            remixicon="RiParagraph"
            tabler="IconPilcrow"
          />
          <span>Turn into</span>
          <IconPlaceholder
            className="ms-auto size-4 rtl:rotate-180"
            hugeicons="ArrowRight01Icon"
            lucide="ChevronRightIcon"
            phosphor="CaretRightIcon"
            remixicon="RiArrowRightSLine"
            tabler="IconChevronRight"
          />
        </div>
        <div className="cn-dropdown-menu-item flex items-center">
          <IconPlaceholder
            className="size-4"
            hugeicons="PlayListAddIcon"
            lucide="ListPlus"
            phosphor="ListPlusIcon"
            remixicon="RiMenuAddLine"
            tabler="IconPlaylistAdd"
          />
          <span>Duplicate</span>
          <span className="cn-dropdown-menu-shortcut">⌘D</span>
        </div>
        <div className="cn-dropdown-menu-separator" />
        <div
          className="cn-dropdown-menu-item flex items-center text-destructive"
          data-variant="destructive"
        >
          <IconPlaceholder
            className="size-4"
            hugeicons="Cancel01Icon"
            lucide="X"
            phosphor="XIcon"
            remixicon="RiCloseLine"
            tabler="IconX"
          />
          <span>Delete</span>
          <span className="cn-dropdown-menu-shortcut">⌫</span>
        </div>
      </div>

      <div
        className="cn-dropdown-menu-sub-content cn-menu-target flex flex-col gap-0.5 self-start"
        data-menu-translucent=""
      >
        <div className="cn-dropdown-menu-label">Turn into</div>
        {TURN_INTO_OPTIONS.map((option) => {
          const active = selectedBlock === option.label;
          return (
            <button
              key={option.label}
              className={cn(
                'cn-dropdown-menu-item flex w-full items-center text-start',
                active && 'bg-accent text-accent-foreground'
              )}
              onClick={() => setSelectedBlock(option.label)}
              type="button"
            >
              {option.icon}
              <span>{option.label}</span>
              {active && (
                <IconPlaceholder
                  className="ms-auto size-3.5"
                  hugeicons="Tick02Icon"
                  lucide="Check"
                  phosphor="CheckIcon"
                  remixicon="RiCheckLine"
                  tabler="IconCheck"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ReviewCard({
  kit,
  suggestionEditor,
}: {
  kit: CreateSinkKit;
  suggestionEditor: EditorReference;
}) {
  const { Avatar, AvatarFallback, Button, Editor, Input, Separator } = kit;
  const [decision, setDecision] = React.useState<
    'accepted' | 'pending' | 'rejected'
  >('pending');
  const [replyText, setReplyText] = React.useState('');
  const [replies, setReplies] = React.useState<string[]>([]);

  const submitReply = () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;

    setReplies((prev) => [...prev, trimmed]);
    setReplyText('');
  };

  return (
    <section
      className="cn-card flex flex-col gap-3 bg-card p-4 text-card-foreground"
      data-slot="card"
    >
      <EditorRoot editor={suggestionEditor} readOnly>
        <Editor className="min-h-0 px-0 py-0 text-sm" variant="none" />
      </EditorRoot>

      <Separator />

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
              BL
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-medium text-foreground">Bob Lee</span>
              <span className="text-muted-foreground">2m ago</span>
            </div>
          </div>
          {decision === 'pending' ? (
            <div className="flex items-center gap-1">
              <Button
                aria-label="Accept suggestion"
                onClick={() => setDecision('accepted')}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <IconPlaceholder
                  className="size-3.5"
                  hugeicons="Tick02Icon"
                  lucide="Check"
                  phosphor="CheckIcon"
                  remixicon="RiCheckLine"
                  tabler="IconCheck"
                />
              </Button>
              <Button
                aria-label="Reject suggestion"
                onClick={() => setDecision('rejected')}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <IconPlaceholder
                  className="size-3.5"
                  hugeicons="Cancel01Icon"
                  lucide="X"
                  phosphor="XIcon"
                  remixicon="RiCloseLine"
                  tabler="IconX"
                />
              </Button>
            </div>
          ) : (
            <button
              className={cn(
                'cn-badge cursor-pointer',
                decision === 'accepted'
                  ? 'cn-badge-variant-default'
                  : 'cn-badge-variant-secondary'
              )}
              onClick={() => setDecision('pending')}
              type="button"
            >
              {decision === 'accepted' ? 'Accepted' : 'Rejected'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="rounded-sm bg-editor-delete/15 px-1.5 py-0.5 text-editor-delete line-through">
            legacy
          </span>
          <span className="text-muted-foreground">to</span>
          <span className="rounded-sm bg-editor-insert/15 px-1.5 py-0.5 text-editor-insert">
            composable
          </span>
        </div>

        {replies.map((reply, index) => (
          <div
            key={`${reply}-${index}`}
            className="rounded-md bg-muted/50 px-2.5 py-1.5 text-xs text-foreground"
          >
            <span className="font-medium">You: </span>
            {reply}
          </div>
        ))}

        <div className="flex items-center gap-2">
          <Input
            aria-label="Reply to thread"
            className="h-8 text-xs"
            onChange={(event) => setReplyText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submitReply();
              }
            }}
            placeholder="Reply..."
            type="text"
            value={replyText}
          />
          <Button
            onClick={submitReply}
            size="xs"
            type="button"
            variant="default"
          >
            Reply
          </Button>
        </div>
      </div>
    </section>
  );
}

export function CalendarCard({ kit }: { kit: CreateSinkKit }) {
  const { Calendar } = kit;
  const [date, setDate] = React.useState<Date | undefined>(
    () => new Date(2026, 10, 27)
  );

  return (
    <section
      className="cn-card flex flex-col gap-2 bg-card p-3 text-card-foreground"
      data-slot="card"
    >
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="font-medium">Inline date picker</span>
        <span className="font-mono text-xs text-muted-foreground">
          {date
            ? date.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'Pick a date'}
        </span>
      </div>
      <div className="flex justify-center">
        <Calendar
          className="rounded-lg border-0 bg-transparent p-1"
          mode="single"
          onSelect={setDate}
          selected={date}
        />
      </div>
    </section>
  );
}

export function SelectEditorCard({ kit }: { kit: CreateSinkKit }) {
  const { SelectEditor } = kit;

  return (
    <section
      className="cn-card flex flex-col gap-2.5 bg-card p-4 text-card-foreground"
      data-slot="card"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">Document tags</span>
        <span className="text-muted-foreground">SelectEditor</span>
      </div>
      <SelectEditor
        defaultValue={SELECT_DEFAULT_ITEMS}
        items={SELECT_LABELS}
        placeholder="Add tags..."
      />
      <p className="text-xs text-muted-foreground">
        Type to filter tags or press Backspace to remove chips.
      </p>
    </section>
  );
}

const COLLABORATORS = [
  { initials: 'AC', name: 'Alice Chen', role: 'Owner' },
  { initials: 'BL', name: 'Bob Lee', role: 'Can edit' },
  { initials: 'SK', name: 'Sara Kim', role: 'Commenter' },
] as const;

export function CollaboratorsCard({ kit }: { kit: CreateSinkKit }) {
  const { Avatar, AvatarFallback, Button, Input } = kit;
  const [invite, setInvite] = React.useState('');
  const [invited, setInvited] = React.useState(false);

  return (
    <section
      className="cn-card flex flex-col gap-3 bg-card p-4 text-card-foreground"
      data-slot="card"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">Share document</span>
        <span className="cn-badge cn-badge-variant-secondary">3 active</span>
      </div>

      <div className="flex flex-col gap-2">
        {COLLABORATORS.map((member) => (
          <div
            key={member.name}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{member.name}</span>
            </div>
            <span className="text-muted-foreground">{member.role}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          aria-label="Invite collaborator email"
          className="h-8 text-xs"
          onChange={(event) => {
            setInvite(event.target.value);
            setInvited(false);
          }}
          placeholder="teammate@company.com"
          type="email"
          value={invite}
        />
        <Button
          onClick={() => {
            if (!invite.trim()) return;
            setInvite('');
            setInvited(true);
          }}
          size="xs"
          type="button"
          variant={invited ? 'secondary' : 'default'}
        >
          {invited ? 'Sent' : 'Invite'}
        </Button>
      </div>
    </section>
  );
}
