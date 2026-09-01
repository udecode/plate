'use client';

import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { NodeApi, type Path, type Range, TextApi } from 'platejs';
import {
  type Editor,
  type PlateLeafProps,
  PlateLeaf,
  definePlatePlugin,
  useEditor,
} from 'platejs/react';
import * as React from 'react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type FindMatch = Readonly<{
  id: string;
  range: Range;
}>;

type FindSnapshot = Readonly<{
  activeIndex: number;
  appliedQuery: string;
  error: string | null;
  inputQuery: string;
  matches: readonly FindMatch[];
  open: boolean;
}>;

const EMPTY_SNAPSHOT: FindSnapshot = {
  activeIndex: -1,
  appliedQuery: '',
  error: null,
  inputQuery: '',
  matches: [],
  open: false,
};

const getMatchId = (range: Range) =>
  `${range.anchor.path.join('.')}:${range.anchor.offset}-${range.focus.path.join('.')}:${range.focus.offset}`;

const indexFindMatchesByAnchorPath = (
  matches: readonly FindMatch[]
): ReadonlyMap<string, readonly FindMatch[]> => {
  const mutable = new Map<string, FindMatch[]>();

  matches.forEach((match) => {
    const key = match.range.anchor.path.join('.');
    const indexed = mutable.get(key) ?? [];

    indexed.push(match);
    mutable.set(key, indexed);
  });

  mutable.forEach((indexed) => Object.freeze(indexed));

  return mutable;
};

class FindResultOwner {
  private readonly activeListeners = new Map<string, Set<() => void>>();
  private readonly editor: Editor;
  private epoch = 0;
  private readonly listeners = new Set<() => void>();
  private matchesByAnchorPath: ReadonlyMap<string, readonly FindMatch[]> =
    new Map();
  private requestedIndex = 0;
  private snapshot: FindSnapshot = EMPTY_SNAPSHOT;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  get = () => this.snapshot;

  isActive = (id: string) =>
    this.snapshot.matches[this.snapshot.activeIndex]?.id === id;

  matchesAt = (path: Path) =>
    this.matchesByAnchorPath.get(path.join('.')) ?? [];

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  };

  subscribeMatch = (id: string, listener: () => void) => {
    const listeners = this.activeListeners.get(id) ?? new Set();

    listeners.add(listener);
    this.activeListeners.set(id, listeners);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) this.activeListeners.delete(id);
    };
  };

  close = () => {
    this.epoch += 1;
    this.requestedIndex = 0;
    this.publish({ ...EMPTY_SNAPSHOT, open: false });
    this.refreshDecorations();
    queueMicrotask(() => this.editor.api.dom.focus());
  };

  commitActiveMatch = () => {
    const match = this.snapshot.matches[this.snapshot.activeIndex];

    if (!match) return false;

    this.editor.update.selection.set(match.range);
    this.editor.api.dom.focus();

    return true;
  };

  move = (delta: -1 | 1) => {
    const count = this.snapshot.matches.length;

    if (count === 0) return;

    this.requestedIndex = (this.snapshot.activeIndex + delta + count) % count;
    this.publish({ ...this.snapshot, activeIndex: this.requestedIndex });
  };

  open = (query?: string) => {
    const nextQuery = query ?? this.snapshot.inputQuery;

    this.requestedIndex = 0;
    this.publish({
      ...this.snapshot,
      activeIndex:
        nextQuery === this.snapshot.inputQuery &&
        this.snapshot.matches.length > 0
          ? 0
          : -1,
      inputQuery: nextQuery,
      open: true,
    });
  };

  rescan = () => {
    if (this.snapshot.appliedQuery) {
      this.search(this.snapshot.appliedQuery, true);
    }
  };

  search = (query: string, force = false) => {
    if (!force && query === this.snapshot.appliedQuery) return;

    this.epoch += 1;
    const { epoch } = this;
    let errorMessage: string | null = null;
    let matches: readonly FindMatch[] = [];

    try {
      matches = query
        ? NodeApi.findTextRanges(this.editor, query, {
            caseSensitive: false,
          }).map((range) => ({ id: getMatchId(range), range }))
        : [];
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Search failed';
    }

    if (epoch !== this.epoch) return;

    const activeIndex =
      matches.length === 0 ? -1 : this.requestedIndex % matches.length;

    this.publish({
      ...this.snapshot,
      activeIndex,
      appliedQuery: query,
      error: errorMessage,
      matches,
    });
    this.refreshDecorations();
  };

  setInputQuery = (query: string) => {
    this.requestedIndex = 0;
    this.publish({
      ...this.snapshot,
      activeIndex: -1,
      error: null,
      inputQuery: query,
    });
  };

  private publish(snapshot: FindSnapshot) {
    const previousActive =
      this.snapshot.matches[this.snapshot.activeIndex]?.id ?? null;
    const nextActive = snapshot.matches[snapshot.activeIndex]?.id ?? null;

    if (this.snapshot.matches !== snapshot.matches) {
      this.matchesByAnchorPath = indexFindMatchesByAnchorPath(snapshot.matches);
    }

    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener());

    if (previousActive !== nextActive) {
      if (previousActive) {
        this.activeListeners
          .get(previousActive)
          ?.forEach((listener) => listener());
      }
      if (nextActive) {
        this.activeListeners.get(nextActive)?.forEach((listener) => listener());
      }
    }
  }

  private refreshDecorations() {
    const { store } = this.editor.plugin(FindPlugin);

    store.set({ revision: store.get('revision') + 1 });
  }
}

const FIND_OWNERS = new WeakMap<Editor, FindResultOwner>();

export const getFindOwner = (editor: Editor) => {
  const current = FIND_OWNERS.get(editor);

  if (current) return current;

  const owner = new FindResultOwner(editor);

  FIND_OWNERS.set(editor, owner);

  return owner;
};

const getSelectedText = (editor: Editor) => {
  const selection = editor.read.selection();

  if (!selection || editor.read.selection.isCollapsed()) return undefined;

  return editor.read
    .fragment({ at: selection })
    .map((node) => NodeApi.string(node))
    .join('\n');
};

export const FindPlugin = definePlatePlugin('find', {
  decorate: ({ editor, entry: [node, path] }) => {
    if (!TextApi.isText(node)) return [];

    return getFindOwner(editor)
      .matchesAt(path)
      .map((match) => ({
        ...match.range,
        findMatchId: match.id,
      }));
  },
  editOnly: { render: false },
  initialState: { revision: 0 },
  on: {
    commit: ({ commit, editor }) => {
      if (commit.changed.hasAny('document')) getFindOwner(editor).rescan();
    },
  },
  shortcuts: {
    open: {
      handler: ({ editor }) => {
        getFindOwner(editor).open(getSelectedText(editor));

        return true;
      },
      keys: 'mod+f',
    },
  },
});

export type FindController = Readonly<{
  activeIndex: number;
  close: () => void;
  commitActiveMatch: () => boolean;
  count: number;
  error: string | null;
  isOpen: boolean;
  next: () => void;
  open: (query?: string) => void;
  pending: boolean;
  previous: () => void;
  query: string;
  setQuery: (query: string) => void;
}>;

export function useFindController(): FindController {
  const editor = useEditor();
  const owner = getFindOwner(editor);
  const snapshot = React.useSyncExternalStore(
    owner.subscribe,
    owner.get,
    owner.get
  );
  const deferredQuery = React.useDeferredValue(snapshot.inputQuery);

  React.useEffect(() => {
    owner.search(deferredQuery);
  }, [deferredQuery, owner]);

  return React.useMemo(
    () => ({
      activeIndex: snapshot.activeIndex,
      close: owner.close,
      commitActiveMatch: owner.commitActiveMatch,
      count: snapshot.matches.length,
      error: snapshot.error,
      isOpen: snapshot.open,
      next: () => owner.move(1),
      open: owner.open,
      pending: snapshot.inputQuery !== snapshot.appliedQuery,
      previous: () => owner.move(-1),
      query: snapshot.inputQuery,
      setQuery: owner.setInputQuery,
    }),
    [owner, snapshot]
  );
}

function useFindMatchActive(id: string) {
  const owner = getFindOwner(useEditor());
  const subscribe = React.useCallback(
    (listener: () => void) => owner.subscribeMatch(id, listener),
    [id, owner]
  );
  const getSnapshot = React.useCallback(() => owner.isActive(id), [id, owner]);

  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function FindLeaf(props: PlateLeafProps<typeof FindPlugin>) {
  const active = useFindMatchActive(props.leaf.findMatchId);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (active) {
      ref.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [active]);

  return (
    <PlateLeaf
      {...props}
      ref={ref}
      attributes={{
        ...props.attributes,
        'data-find-active': active || undefined,
        'data-find-match': '',
      }}
      className={cn(
        'rounded-[2px] bg-yellow-200 text-inherit',
        active && 'bg-orange-400 ring-1 ring-orange-600'
      )}
    />
  );
}

function FindBar() {
  const controller = useFindController();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (controller.isOpen) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [controller.isOpen]);

  if (!controller.isOpen) return null;

  const countLabel =
    controller.count === 0
      ? 'No results'
      : `${controller.activeIndex + 1} of ${controller.count}`;

  return (
    <div
      aria-busy={controller.pending}
      aria-label="Find in document"
      className="absolute top-2 right-2 z-[60] w-[min(24rem,calc(100%-1rem))] rounded-xl border bg-background p-2 shadow-lg"
      data-plite-keep-selection-visible=""
      role="search"
    >
      <InputGroup>
        <InputGroupAddon>
          <Search aria-hidden data-icon="inline-start" />
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          aria-label="Find text"
          onChange={(event) => controller.setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              controller.close();

              return;
            }
            if (event.key !== 'Enter') return;

            event.preventDefault();
            if (event.shiftKey) {
              controller.previous();
            } else {
              controller.next();
            }
          }}
          placeholder="Find in document"
          type="search"
          value={controller.query}
        />
        <InputGroupAddon align="inline-end">
          <span
            aria-live="polite"
            className="text-xs whitespace-nowrap text-muted-foreground"
          >
            {controller.error ?? countLabel}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                aria-label="Previous match"
                disabled={controller.count === 0}
                onClick={controller.previous}
                size="icon-xs"
              >
                <ChevronUp aria-hidden data-icon="" />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>Previous match</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                aria-label="Next match"
                disabled={controller.count === 0}
                onClick={controller.next}
                size="icon-xs"
              >
                <ChevronDown aria-hidden data-icon="" />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>Next match</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                aria-label="Close find"
                onClick={controller.close}
                size="icon-xs"
              >
                <X aria-hidden data-icon="" />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>Close find</TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export const FindKit = [
  FindPlugin.configure({
    render: {
      afterEditable: FindBar,
      leaf: FindLeaf,
    },
  }),
] as const;
