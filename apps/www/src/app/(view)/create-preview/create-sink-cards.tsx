'use client';

import {
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
  EmojiPicker as EmojiPickerPrimitive,
} from 'frimousse';
import * as React from 'react';

import {
  SELECT_DEFAULT_ITEMS,
  SELECT_LABELS,
} from '@/components/sink/sink-values';
import { cn } from '@/lib/utils';

import type { CreateSinkKit, SinkEmojiPick } from './create-sink-types';
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
