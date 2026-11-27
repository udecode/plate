'use client';

import {
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
  EmojiPicker as EmojiPickerPrimitive,
} from 'frimousse';
import { type EditorReference, NodeApi } from 'platejs';
import { MarkdownPlugin } from 'platejs/markdown';
import { EditorRoot, useEditorSelector } from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { useCreatePreviewConfig } from './create-preview-context';
import type { CreateSinkKit, SinkEmojiPick } from './create-sink-types';
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

const EMOJI_COLUMNS = 10;
const TABLE_PICKER_DIMENSION = 8;

function EmojiPickerRow({ children, ...props }: EmojiPickerListRowProps) {
  return (
    <div
      {...props}
      className="flex w-full scroll-my-1 justify-between px-2"
      data-slot="emoji-picker-row"
    >
      {children}
    </div>
  );
}

function EmojiPickerEmoji({
  className,
  emoji,
  ...props
}: EmojiPickerListEmojiProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'flex size-8 items-center justify-center rounded-sm text-lg data-active:bg-accent',
        className
      )}
      data-slot="emoji-picker-emoji"
    >
      {emoji.emoji}
    </button>
  );
}

function EmojiPickerCategoryHeader({
  category,
  ...props
}: EmojiPickerListCategoryHeaderProps) {
  return (
    <div
      {...props}
      className="bg-popover px-3 pt-3 pb-1.5 text-xs leading-none text-muted-foreground"
      data-slot="emoji-picker-category-header"
    >
      {category.label}
    </div>
  );
}

export function EmojiPickerCard({
  kit,
  onPickEmoji,
}: {
  kit: CreateSinkKit;
  onPickEmoji: (pick: SinkEmojiPick) => void;
}) {
  const { resolveEmojiData, useEmojiSearch } = kit;
  const [search, setSearch] = React.useState('');
  const [active, setActive] = React.useState(0);
  const [lastPicked, setLastPicked] = React.useState<SinkEmojiPick | null>(
    null
  );
  const { results, status } = useEmojiSearch(search);

  const select = (pick: SinkEmojiPick) => {
    setLastPicked(pick);
    onPickEmoji(pick);
  };

  return (
    <div
      className="cn-popover-content cn-menu-target flex h-80 w-full flex-col overflow-hidden rounded-xl border bg-popover p-0 text-popover-foreground shadow-sm"
      data-menu-translucent=""
      data-slot="sink-emoji-picker"
    >
      <div className="flex h-9 shrink-0 items-center gap-2 border-b px-3">
        <IconPlaceholder
          className="size-4 shrink-0 opacity-50"
          hugeicons="SearchIcon"
          lucide="SearchIcon"
          phosphor="MagnifyingGlassIcon"
          remixicon="RiSearchLine"
          tabler="IconSearch"
        />
        <input
          aria-label="Search emoji"
          className="flex h-9 w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground"
          onChange={(event) => {
            setSearch(event.target.value);
            setActive(0);
          }}
          placeholder="Search emoji..."
          value={search}
        />
        {lastPicked && (
          <span className="cn-badge cn-badge-variant-secondary shrink-0">
            {lastPicked.emoji}
          </span>
        )}
      </div>

      {status === 'failed' ? (
        <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
          Emoji catalog unavailable
        </div>
      ) : search ? (
        results.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
            No emoji found.
          </div>
        ) : (
          <div
            aria-label="Emoji results"
            className="grid min-h-0 flex-1 auto-rows-min overflow-y-auto p-1"
            role="listbox"
            style={{
              gridTemplateColumns: `repeat(${EMOJI_COLUMNS}, minmax(0, 1fr))`,
            }}
          >
            {results.slice(0, 54).map((result, index) => (
              <button
                key={result.emoji}
                aria-label={result.label}
                aria-selected={index === active}
                className="flex size-8 items-center justify-center rounded-sm text-lg data-active:bg-accent"
                data-active={index === active ? '' : undefined}
                onClick={() => select(result)}
                onMouseEnter={() => setActive(index)}
                role="option"
                type="button"
              >
                {result.emoji}
              </button>
            ))}
          </div>
        )
      ) : status === 'ready' ? (
        <EmojiPickerPrimitive.Root
          className="isolate flex min-h-0 flex-1 flex-col"
          columns={EMOJI_COLUMNS}
          onEmojiSelect={select}
          resolveEmojiData={resolveEmojiData}
        >
          <EmojiPickerPrimitive.Viewport
            className="relative flex-1 outline-hidden"
            data-slot="emoji-picker-viewport"
          >
            <EmojiPickerPrimitive.Loading className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <IconPlaceholder
                className="size-4 animate-spin"
                hugeicons="Loading03Icon"
                lucide="LoaderIcon"
                phosphor="SpinnerIcon"
                remixicon="RiLoader4Line"
                tabler="IconLoader"
              />
            </EmojiPickerPrimitive.Loading>
            <EmojiPickerPrimitive.List
              className="pb-1 select-none"
              components={{
                CategoryHeader: EmojiPickerCategoryHeader,
                Emoji: EmojiPickerEmoji,
                Row: EmojiPickerRow,
              }}
            />
          </EmojiPickerPrimitive.Viewport>
          <EmojiPickerPrimitive.ActiveEmoji>
            {({ emoji }) => (
              <div className="flex h-10 w-full shrink-0 items-center gap-1.5 border-t px-2.5 text-xs">
                {emoji ? (
                  <>
                    <span className="text-base">{emoji.emoji}</span>
                    <span className="truncate text-secondary-foreground">
                      {emoji.label}
                    </span>
                  </>
                ) : (
                  <span className="truncate text-muted-foreground">
                    Click an emoji to insert into document...
                  </span>
                )}
              </div>
            )}
          </EmojiPickerPrimitive.ActiveEmoji>
        </EmojiPickerPrimitive.Root>
      ) : (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <IconPlaceholder
            className="size-4 animate-spin"
            hugeicons="Loading03Icon"
            lucide="LoaderIcon"
            phosphor="SpinnerIcon"
            remixicon="RiLoader4Line"
            tabler="IconLoader"
          />
        </div>
      )}
    </div>
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

export function FindReplaceCard({ kit }: { kit: CreateSinkKit }) {
  const { Button, Input, Toggle } = kit;
  const [query, setQuery] = React.useState('Plate');
  const [replaceText, setReplaceText] = React.useState('Plate v2');
  const [matchCase, setMatchCase] = React.useState(false);

  const documentText = useEditorSelector(
    (editor) =>
      editor.read
        .children()
        .map((node) => NodeApi.string(node))
        .join('\n'),
    { dependsOn: 'document' }
  );
  const matchCount = React.useMemo(() => {
    if (!query.trim()) return 0;

    const haystack = matchCase ? documentText : documentText.toLowerCase();
    const needle = matchCase ? query : query.toLowerCase();

    return haystack.split(needle).length - 1;
  }, [documentText, matchCase, query]);

  return (
    <div
      className="cn-popover-content cn-menu-target flex flex-col gap-2 rounded-xl border bg-popover p-3 text-popover-foreground shadow-sm"
      data-menu-translucent=""
      data-slot="sink-find-replace"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">Find &amp; replace</span>
        <span className="font-mono text-xs text-muted-foreground">
          {matchCount} {matchCount === 1 ? 'match' : 'matches'}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Input
          aria-label="Find in editor"
          className="h-8 text-xs"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find..."
          value={query}
        />
        <Toggle
          aria-label="Match case"
          onPressedChange={setMatchCase}
          pressed={matchCase}
          size="sm"
          variant="outline"
        >
          Aa
        </Toggle>
      </div>

      <div className="flex items-center gap-1.5">
        <Input
          aria-label="Replace with"
          className="h-8 text-xs"
          onChange={(event) => setReplaceText(event.target.value)}
          placeholder="Replace with..."
          value={replaceText}
        />
        <Button size="xs" type="button" variant="secondary">
          Replace
        </Button>
      </div>
    </div>
  );
}

export function LinkFloatingCard({
  kit,
  onInsertLink,
}: {
  kit: CreateSinkKit;
  onInsertLink: (url: string, text: string) => void;
}) {
  const { Button, Input, Separator } = kit;
  const [url, setUrl] = React.useState('https://platejs.org/docs');
  const [text, setText] = React.useState('Plate v2 docs');
  const [inserted, setInserted] = React.useState(false);

  const submit = () => {
    const cleanUrl = url.trim();
    if (!cleanUrl) return;

    onInsertLink(cleanUrl, text.trim() || cleanUrl);
    setInserted(true);
    window.setTimeout(() => setInserted(false), 1500);
  };

  return (
    <div className="flex flex-col gap-2" data-slot="sink-link-popover">
      <div
        className="cn-menu-target flex w-fit flex-row items-center gap-1 rounded-lg border bg-popover p-1 text-popover-foreground shadow-sm"
        data-menu-translucent=""
      >
        <Button size="xs" type="button" variant="ghost">
          Edit link
        </Button>
        <Separator className="h-4" orientation="vertical" />
        <a
          aria-label="Open link"
          className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          href={url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconPlaceholder
            className="size-3.5"
            hugeicons="LinkSquare02Icon"
            lucide="ExternalLinkIcon"
            phosphor="ArrowSquareOutIcon"
            remixicon="RiExternalLinkLine"
            tabler="IconExternalLink"
          />
        </a>
        <Separator className="h-4" orientation="vertical" />
        <Button
          aria-label="Unlink"
          onClick={() => setUrl('')}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          <IconPlaceholder
            className="size-3.5"
            hugeicons="Unlink02Icon"
            lucide="Unlink"
            phosphor="LinkBreakIcon"
            remixicon="RiLinkUnlink"
            tabler="IconUnlink"
          />
        </Button>
      </div>

      <div
        className="cn-popover-content cn-menu-target flex flex-col gap-1.5 rounded-xl border bg-popover p-2 text-popover-foreground shadow-sm"
        data-menu-translucent=""
      >
        <div className="flex items-center gap-1.5">
          <IconPlaceholder
            className="ms-1 size-3.5 shrink-0 text-muted-foreground"
            hugeicons="LinkIcon"
            lucide="LinkIcon"
            phosphor="LinkIcon"
            remixicon="RiLinksLine"
            tabler="IconLink"
          />
          <Input
            aria-label="Link URL"
            className="h-7 border-none bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Paste link"
            value={url}
          />
        </div>
        <Separator />
        <div className="flex items-center gap-1.5">
          <IconPlaceholder
            className="ms-1 size-3.5 shrink-0 text-muted-foreground"
            hugeicons="TextAlignLeftIcon"
            lucide="Text"
            phosphor="TextAlignLeftIcon"
            remixicon="RiAlignLeft"
            tabler="IconAlignLeft"
          />
          <Input
            aria-label="Link display text"
            className="h-7 border-none bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Text to display"
            value={text}
          />
          <Button
            onClick={submit}
            size="xs"
            type="button"
            variant={inserted ? 'secondary' : 'default'}
          >
            {inserted ? 'Added' : 'Insert'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TablePickerCard({
  onInsertTable,
}: {
  onInsertTable: (rowCount: number, colCount: number) => void;
}) {
  const [size, setSize] = React.useState({ colCount: 4, rowCount: 3 });

  return (
    <section
      className="cn-card flex items-center justify-between gap-4 bg-card p-4 text-card-foreground"
      data-slot="card"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <IconPlaceholder
            className="size-3.5 text-muted-foreground"
            hugeicons="GridTableIcon"
            lucide="Grid3x3Icon"
            phosphor="GridNineIcon"
            remixicon="RiGridLine"
            tabler="IconTable"
          />
          <span>Insert table</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Hover grid to pick dimensions and click to insert into the live
          document.
        </p>
        <div className="mt-1 font-mono text-xs font-medium text-foreground">
          {size.rowCount} &times; {size.colCount}
        </div>
      </div>

      <div
        aria-colcount={TABLE_PICKER_DIMENSION}
        aria-label="Table size picker"
        aria-rowcount={TABLE_PICKER_DIMENSION}
        className="grid shrink-0 grid-cols-8 gap-0.5 rounded-lg border bg-popover p-1.5"
        role="grid"
      >
        {Array.from({ length: TABLE_PICKER_DIMENSION }, (_, rowIndex) => (
          <div key={rowIndex} className="contents" role="row">
            {Array.from(
              { length: TABLE_PICKER_DIMENSION },
              (_col, colIndex) => {
                const selected =
                  rowIndex < size.rowCount && colIndex < size.colCount;

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    aria-label={`Insert ${rowIndex + 1} by ${colIndex + 1} table`}
                    aria-selected={selected}
                    className={cn(
                      'size-3.5 cursor-pointer rounded-[2px] border border-border bg-secondary transition-colors',
                      selected && 'border-primary bg-primary/25'
                    )}
                    onClick={() => onInsertTable(rowIndex + 1, colIndex + 1)}
                    onFocus={() =>
                      setSize({
                        colCount: colIndex + 1,
                        rowCount: rowIndex + 1,
                      })
                    }
                    onPointerEnter={() =>
                      setSize({
                        colCount: colIndex + 1,
                        rowCount: rowIndex + 1,
                      })
                    }
                    role="gridcell"
                    type="button"
                  />
                );
              }
            )}
          </div>
        ))}
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

export function MarkdownOutputCard({ kit }: { kit: CreateSinkKit }) {
  const { Button } = kit;
  const [copied, setCopied] = React.useState(false);
  const { blockCount, markdown } = useEditorSelector(
    (editor) => {
      const result = editor.plugin(MarkdownPlugin).api.serialize();

      return {
        blockCount: editor.read.children().length,
        markdown: result.ok ? result.data : '',
      };
    },
    {
      dependsOn: 'document',
      equalityFn: (prev, next) =>
        prev.blockCount === next.blockCount && prev.markdown === next.markdown,
    }
  );

  const handleCopy = () => {
    void navigator.clipboard?.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section
      className="cn-card flex flex-col gap-2.5 bg-card p-4 text-card-foreground"
      data-slot="card"
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium">Live Markdown</span>
          <span className="cn-badge cn-badge-variant-secondary">
            {blockCount} blocks
          </span>
        </div>
        <Button onClick={handleCopy} size="xs" type="button" variant="ghost">
          <IconPlaceholder
            className="size-3.5"
            hugeicons={copied ? 'Tick02Icon' : 'Copy01Icon'}
            lucide={copied ? 'Check' : 'CopyIcon'}
            phosphor={copied ? 'CheckIcon' : 'CopyIcon'}
            remixicon={copied ? 'RiCheckLine' : 'RiFileCopyLine'}
            tabler={copied ? 'IconCheck' : 'IconCopy'}
          />
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre
        className="max-h-56 overflow-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground"
        data-slot="sink-markdown"
      >
        {markdown}
      </pre>
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
