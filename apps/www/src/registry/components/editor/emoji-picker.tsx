'use client';

import {
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
  EmojiPicker as EmojiPickerPrimitive,
} from 'frimousse';
import { LoaderIcon, SearchIcon } from 'lucide-react';
import { useEditor } from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import {
  FloatingPopover,
  FloatingPopoverContent,
  FloatingPopoverTrigger,
} from '@/registry/components/editor/floating-popover';
import { resolveEmojiData, useEmojiSearch } from '@/registry/lib/emoji-data';

const COLUMNS = 9;
const FREQUENT_KEY = 'plate:emoji-frequent:v1';

type EmojiPick = { emoji: string; label: string };
type FrequentEmoji = EmojiPick & { count: number };

const isImeKey = (event: KeyboardEvent) =>
  event.isComposing ||
  // oxlint-disable-next-line typescript/no-deprecated -- Safari sends the Enter that confirms an IME candidate after compositionend, with only key code 229 to tell it apart.
  event.keyCode === 229;

const isFrequentEmoji = (item: unknown): item is FrequentEmoji =>
  typeof item === 'object' &&
  item !== null &&
  'emoji' in item &&
  typeof item.emoji === 'string' &&
  'label' in item &&
  typeof item.label === 'string' &&
  'count' in item &&
  typeof item.count === 'number';

function readFrequentEmojis(): FrequentEmoji[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(FREQUENT_KEY) ?? '[]'
    );

    return Array.isArray(stored) ? stored.filter(isFrequentEmoji) : [];
  } catch {
    return [];
  }
}

function recordFrequentEmoji({ emoji, label }: EmojiPick) {
  const frequent = readFrequentEmojis();
  const existing = frequent.find((item) => item.emoji === emoji);

  if (existing) existing.count += 1;
  else frequent.push({ count: 1, emoji, label });

  frequent.sort((a, b) => b.count - a.count);
  // A full store drops its least used other pick, so a new one can climb.
  if (frequent.length > 36) {
    frequent.splice(
      frequent.findLastIndex((item) => item.emoji !== emoji),
      1
    );
  }

  try {
    localStorage.setItem(FREQUENT_KEY, JSON.stringify(frequent));
  } catch {
    // A frequent row is a convenience; blocked storage only loses it.
  }
}

/**
 * Opens an emoji picker from its child trigger and hands the picked emoji to
 * `onEmojiSelect`, then closes. After a pick, focus returns to the editor.
 */
export function EmojiPicker({
  children,
  onEmojiSelect,
}: {
  children: React.ReactElement;
  onEmojiSelect: (emoji: string) => void;
}) {
  const editor = useEditor();
  const [open, setOpen] = React.useState(false);
  const picked = React.useRef(false);

  const select = (pick: EmojiPick) => {
    recordFrequentEmoji(pick);
    picked.current = true;
    onEmojiSelect(pick.emoji);
    setOpen(false);
  };

  return (
    <FloatingPopover
      open={open}
      onOpenChange={(next) => {
        if (next) picked.current = false;
        setOpen(next);
      }}
    >
      <FloatingPopoverTrigger>{children}</FloatingPopoverTrigger>

      <FloatingPopoverContent
        align="start"
        className="w-fit p-0"
        onEscapeKeyDown={(event) => {
          if (isImeKey(event)) event.preventDefault();
        }}
        onFinalFocus={(event) => {
          if (!picked.current) return;

          event.preventDefault();
          editor.api.dom.focus();
        }}
      >
        <EmojiPickerPanel onSelect={select} />
      </FloatingPopoverContent>
    </FloatingPopover>
  );
}

function EmojiPickerPanel({
  onSelect,
}: {
  onSelect: (pick: EmojiPick) => void;
}) {
  const id = React.useId();
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [search, setSearch] = React.useState('');
  const [active, setActive] = React.useState(0);
  const { results, status } = useEmojiSearch(search);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isImeKey(event.nativeEvent)) return;
    if (!search) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        viewportRef.current?.focus();
      }
      return;
    }

    const step = {
      ArrowDown: COLUMNS,
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -COLUMNS,
    }[event.key];

    if (step !== undefined) {
      event.preventDefault();
      setActive(Math.max(0, Math.min(results.length - 1, active + step)));
    } else if (event.key === 'Enter' && results[active]) {
      event.preventDefault();
      onSelect(results[active]);
    }
  };

  return (
    <div
      className="flex h-[23rem] w-[19.5rem] flex-col overflow-hidden rounded-md bg-popover text-popover-foreground"
      data-slot="emoji-picker"
    >
      <div className="flex h-9 shrink-0 items-center gap-2 border-b px-3">
        <SearchIcon className="size-4 shrink-0 opacity-50" />
        <input
          aria-activedescendant={
            search && results[active] ? `${id}-${active}` : undefined
          }
          aria-controls={search ? `${id}-results` : undefined}
          aria-expanded={!!search}
          aria-label="Search emoji"
          autoFocus
          className="flex h-9 w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground"
          data-slot="emoji-picker-search"
          placeholder="Search…"
          role="combobox"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      {status === 'failed' ? (
        <EmojiPickerStatus>Emoji unavailable</EmojiPickerStatus>
      ) : search ? (
        <EmojiSearchResults
          active={active}
          id={id}
          loading={status === 'loading'}
          results={results}
          onActiveChange={setActive}
          onSelect={onSelect}
        />
      ) : (
        <EmojiPickerBrowse
          ready={status === 'ready'}
          viewportRef={viewportRef}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}

function EmojiPickerBrowse({
  ready,
  viewportRef,
  onSelect,
}: {
  ready: boolean;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (pick: EmojiPick) => void;
}) {
  return (
    <>
      <FrequentEmojis onSelect={onSelect} />
      {ready ? (
        <EmojiPickerPrimitive.Root
          className="isolate flex min-h-0 flex-1 flex-col"
          columns={COLUMNS}
          resolveEmojiData={resolveEmojiData}
          onEmojiSelect={onSelect}
        >
          <EmojiPickerPrimitive.Viewport
            ref={viewportRef}
            className="relative flex-1 outline-hidden"
            data-slot="emoji-picker-viewport"
            tabIndex={0}
          >
            <EmojiPickerPrimitive.Loading className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <LoaderIcon className="size-4 animate-spin" />
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
              <EmojiPickerFooter emoji={emoji?.emoji} label={emoji?.label} />
            )}
          </EmojiPickerPrimitive.ActiveEmoji>
        </EmojiPickerPrimitive.Root>
      ) : (
        <EmojiPickerLoading />
      )}
    </>
  );
}

function EmojiSearchResults({
  active,
  id,
  loading,
  results,
  onActiveChange,
  onSelect,
}: {
  active: number;
  id: string;
  loading: boolean;
  results: readonly EmojiPick[];
  onActiveChange: (index: number) => void;
  onSelect: (pick: EmojiPick) => void;
}) {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (loading) return <EmojiPickerLoading />;
  if (results.length === 0) {
    return <EmojiPickerStatus>No emoji found.</EmojiPickerStatus>;
  }

  return (
    <>
      <div
        ref={listRef}
        aria-label="Emoji results"
        className="grid min-h-0 flex-1 auto-rows-min overflow-y-auto p-1"
        id={`${id}-results`}
        role="listbox"
        style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))` }}
      >
        {results.map((result, index) => (
          <button
            key={result.emoji}
            aria-label={result.label}
            aria-selected={index === active}
            className="flex size-8 items-center justify-center rounded-sm text-lg data-active:bg-accent"
            data-active={index === active ? '' : undefined}
            data-index={index}
            id={`${id}-${index}`}
            role="option"
            tabIndex={-1}
            type="button"
            onClick={() => onSelect(result)}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => onActiveChange(index)}
          >
            {result.emoji}
          </button>
        ))}
      </div>
      <EmojiPickerFooter
        emoji={results[active]?.emoji}
        label={results[active]?.label}
      />
    </>
  );
}

function FrequentEmojis({ onSelect }: { onSelect: (pick: EmojiPick) => void }) {
  const [frequent] = React.useState(() =>
    readFrequentEmojis().slice(0, COLUMNS)
  );

  if (frequent.length === 0) return null;

  return (
    <div
      aria-label="Frequently used"
      className="shrink-0 border-b px-1 pt-2 pb-1"
      data-slot="emoji-picker-frequent"
      role="group"
    >
      <div className="px-2 pb-1 text-xs text-muted-foreground">
        Frequently used
      </div>
      <div className="flex">
        {frequent.map((item) => (
          <button
            key={item.emoji}
            aria-label={item.label}
            className="flex size-8 items-center justify-center rounded-sm text-lg hover:bg-accent focus-visible:bg-accent focus-visible:outline-hidden"
            type="button"
            onClick={() => onSelect(item)}
          >
            {item.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmojiPickerFooter({ emoji, label }: Partial<EmojiPick>) {
  return (
    <div className="flex h-11 w-full shrink-0 items-center gap-1 border-t p-2">
      {emoji ? (
        <>
          <div className="flex size-7 flex-none items-center justify-center text-lg">
            {emoji}
          </div>
          <span className="truncate text-xs text-secondary-foreground">
            {label}
          </span>
        </>
      ) : (
        <span className="ml-1.5 truncate text-xs text-muted-foreground">
          Select an emoji…
        </span>
      )}
    </div>
  );
}

function EmojiPickerStatus(props: React.ComponentProps<'div'>) {
  return (
    <div
      className="flex flex-1 items-center justify-center text-sm text-muted-foreground"
      {...props}
    />
  );
}

function EmojiPickerLoading() {
  return (
    <EmojiPickerStatus aria-label="Loading emoji" role="status">
      <LoaderIcon className="size-4 animate-spin" />
    </EmojiPickerStatus>
  );
}

function EmojiPickerRow({ children, ...props }: EmojiPickerListRowProps) {
  return (
    <div {...props} className="scroll-my-1 px-1" data-slot="emoji-picker-row">
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
      className="bg-popover px-3 pt-3.5 pb-2 text-xs leading-none text-muted-foreground"
      data-slot="emoji-picker-category-header"
    >
      {category.label}
    </div>
  );
}
