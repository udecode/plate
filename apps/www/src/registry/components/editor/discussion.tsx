'use client';

import {
  CheckIcon,
  MessageSquareTextIcon,
  MessagesSquareIcon,
  PencilLineIcon,
  XIcon,
} from 'lucide-react';
import { type NodeKey, RangeApi } from 'platejs';
import { CommentsPlugin } from 'platejs/comments/react';
import {
  type EditableSiblingProps,
  type Editor,
  type RenderNodeWrapperDescriptor,
  type RenderNodeWrapperProps,
  useEditor,
  useEditorPlugin,
  useEditorSelector,
  usePluginStore,
} from 'platejs/react';
import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CommentComposer,
  CommentThreadCard,
  formatCommentDate,
  useCommentUser,
  CommentKit,
  usePendingComment,
  useVisibleCommentThreadIds,
} from '@/registry/components/editor/comment';
import {
  FloatingPopover,
  FloatingPopoverAnchor,
  FloatingPopoverContent,
} from '@/registry/components/editor/floating-popover';
import {
  type SuggestionDiscussionReview,
  suggestionPlugin,
  useSuggestionDiscussionReviews,
} from '@/registry/components/editor/suggestion';

type DiscussionItem =
  | Readonly<{
      blockIndices: readonly number[];
      createdAt: Date;
      id: string;
      kind: 'comment';
    }>
  | Readonly<{
      blockIndices: readonly number[];
      createdAt: Date;
      id: string;
      kind: 'suggestion';
      review: SuggestionDiscussionReview;
      threadIds: readonly string[];
    }>;

type DiscussionGroup = Readonly<{
  blockIndex: number;
  blockKey: NodeKey;
  items: readonly DiscussionItem[];
}>;

type DiscussionBlockSnapshot = Readonly<{
  active: boolean;
  hasComments: boolean;
  hasSuggestions: boolean;
  totalCount: number;
}>;

type DiscussionTarget = Readonly<{
  anchor: HTMLElement;
  blockKey: NodeKey;
}>;

type DiscussionSnapshot = Readonly<{
  groupsByKey: ReadonlyMap<NodeKey, DiscussionGroup>;
  items: readonly DiscussionItem[];
  target: DiscussionTarget | null;
}>;

const EMPTY_BLOCK_SNAPSHOT: DiscussionBlockSnapshot = Object.freeze({
  active: false,
  hasComments: false,
  hasSuggestions: false,
  totalCount: 0,
});
const EMPTY_DISCUSSION_SNAPSHOT: DiscussionSnapshot = Object.freeze({
  groupsByKey: new Map(),
  items: Object.freeze([]),
  target: null,
});

const sortDiscussionItems = (items: readonly DiscussionItem[]) =>
  items.toSorted(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime()
  );

const sameBlockSnapshot = (
  left: DiscussionBlockSnapshot | undefined,
  right: DiscussionBlockSnapshot
) =>
  left?.active === right.active &&
  left.hasComments === right.hasComments &&
  left.hasSuggestions === right.hasSuggestions &&
  left.totalCount === right.totalCount;

const createDiscussionStore = () => {
  const listeners = new Set<() => void>();
  const blockListeners = new Map<NodeKey, Set<() => void>>();
  const blockTriggers = new Map<NodeKey, HTMLElement>();
  let blockSnapshots = new Map<NodeKey, DiscussionBlockSnapshot>();
  let prepareSelection: (() => void) | null = null;
  let snapshot = EMPTY_DISCUSSION_SNAPSHOT;

  const notifyBlocks = (keys: ReadonlySet<NodeKey>) => {
    keys.forEach((key) => {
      blockListeners.get(key)?.forEach((listener) => listener());
    });
  };
  const publishTarget = (target: DiscussionTarget | null) => {
    if (snapshot.target === target) return;

    const changedKeys = new Set<NodeKey>();
    const previousKey = snapshot.target?.blockKey;
    const nextKey = target?.blockKey;

    if (previousKey) changedKeys.add(previousKey);
    if (nextKey) changedKeys.add(nextKey);

    changedKeys.forEach((key) => {
      const current = blockSnapshots.get(key);

      if (!current) return;

      blockSnapshots.set(key, {
        ...current,
        active: key === nextKey,
      });
    });
    snapshot = { ...snapshot, target };
    listeners.forEach((listener) => listener());
    notifyBlocks(changedKeys);
  };

  return {
    clearTarget() {
      publishTarget(null);
    },
    getBlockSnapshot(key: NodeKey) {
      return blockSnapshots.get(key) ?? EMPTY_BLOCK_SNAPSHOT;
    },
    getBlockTrigger(key: NodeKey) {
      return blockTriggers.get(key) ?? null;
    },
    getSnapshot: () => snapshot,
    selectBlock(blockKey: NodeKey, anchor: HTMLElement) {
      if (!blockSnapshots.has(blockKey) || !prepareSelection) return;

      prepareSelection();

      publishTarget(
        snapshot.target?.blockKey === blockKey ? null : { anchor, blockKey }
      );
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    subscribeBlock(key: NodeKey, listener: () => void) {
      const keyListeners = blockListeners.get(key) ?? new Set<() => void>();

      keyListeners.add(listener);
      blockListeners.set(key, keyListeners);

      return () => {
        keyListeners.delete(listener);
        if (keyListeners.size === 0) blockListeners.delete(key);
      };
    },
    setPrepareSelection(next: typeof prepareSelection) {
      prepareSelection = next;
    },
    setBlockTrigger(key: NodeKey, element: HTMLElement | null) {
      if (element) {
        blockTriggers.set(key, element);
      } else {
        blockTriggers.delete(key);
      }
    },
    update(editor: Editor, items: readonly DiscussionItem[]) {
      const grouped = new Map<
        NodeKey,
        { blockIndex: number; items: DiscussionItem[] }
      >();

      items.forEach((item) => {
        item.blockIndices.forEach((blockIndex) => {
          const blockKey = editor.key([blockIndex]);

          if (!blockKey) return;

          const group = grouped.get(blockKey);

          if (group) {
            group.items.push(item);
          } else {
            grouped.set(blockKey, {
              blockIndex,
              items: [item],
            });
          }
        });
      });

      const target =
        snapshot.target && grouped.has(snapshot.target.blockKey)
          ? snapshot.target
          : null;
      const changedKeys = new Set<NodeKey>();
      const nextBlockSnapshots = new Map<NodeKey, DiscussionBlockSnapshot>();
      const groups = [...grouped]
        .map(([blockKey, group]): DiscussionGroup => {
          const nextBlockSnapshot: DiscussionBlockSnapshot = {
            active: target?.blockKey === blockKey,
            hasComments: group.items.some(({ kind }) => kind === 'comment'),
            hasSuggestions: group.items.some(
              ({ kind }) => kind === 'suggestion'
            ),
            totalCount: group.items.length,
          };
          const previousBlockSnapshot = blockSnapshots.get(blockKey);
          const blockSnapshot =
            previousBlockSnapshot &&
            sameBlockSnapshot(previousBlockSnapshot, nextBlockSnapshot)
              ? previousBlockSnapshot
              : nextBlockSnapshot;

          nextBlockSnapshots.set(blockKey, blockSnapshot);
          if (blockSnapshot !== previousBlockSnapshot) {
            changedKeys.add(blockKey);
          }

          return {
            blockIndex: group.blockIndex,
            blockKey,
            items: sortDiscussionItems(group.items),
          };
        })
        .toSorted((left, right) => left.blockIndex - right.blockIndex);

      blockSnapshots.forEach((_, blockKey) => {
        if (!nextBlockSnapshots.has(blockKey)) changedKeys.add(blockKey);
      });

      const groupsByKey = new Map(
        groups.map((group) => [group.blockKey, group] as const)
      );

      blockSnapshots = nextBlockSnapshots;
      snapshot = {
        groupsByKey,
        items,
        target,
      };
      listeners.forEach((listener) => listener());
      notifyBlocks(changedKeys);
    },
  };
};

type DiscussionStore = ReturnType<typeof createDiscussionStore>;

const DiscussionContext = React.createContext<DiscussionStore | null>(null);

const useDiscussionStore = () => {
  const store = React.useContext(DiscussionContext);

  if (!store) throw new Error('Discussion requires DiscussionSlots.');

  return store;
};

const useDiscussionController = () => {
  const editor = useEditor();
  const { api: comments } = useEditorPlugin(CommentsPlugin);
  const visibleThreadIds = useVisibleCommentThreadIds();
  const suggestions = useSuggestionDiscussionReviews();
  const [store] = React.useState(createDiscussionStore);
  React.useEffect(() => {
    const { api } = editor.plugin(CommentsPlugin);
    const suggestionThreads = new Map<string, string[]>();
    const commentItems = new Map<string, DiscussionItem>();
    const locate = (id: string, thread = comments.getThread(id)) => {
      const range = api.range(id);
      if (
        !thread ||
        thread.resolved ||
        thread.target.type !== 'range' ||
        !range
      ) {
        return null;
      }
      const [start, end] = RangeApi.edges(range);
      const firstBlock = start.path[0] ?? 0;
      return {
        blockIndices: Array.from(
          { length: (end.path[0] ?? firstBlock) - firstBlock + 1 },
          (_, offset) => firstBlock + offset
        ),
        createdAt: new Date(thread.createdAt),
        id,
        kind: 'comment' as const,
      };
    };
    visibleThreadIds.forEach((id) => {
      const thread = comments.getThread(id);
      if (thread?.target.type === 'suggestion') {
        const ids = suggestionThreads.get(thread.target.id) ?? [];
        ids.push(id);
        suggestionThreads.set(thread.target.id, ids);
      } else if (thread) {
        const item = locate(id, thread);
        if (item) commentItems.set(id, item);
      }
    });
    const suggestionItems = suggestions.map((review): DiscussionItem => ({
      blockIndices: review.blockIndices,
      createdAt: review.createdAt,
      id: review.suggestionId,
      kind: 'suggestion',
      review,
      threadIds: suggestionThreads.get(review.suggestionId) ?? [],
    }));
    const publish = () =>
      store.update(editor, [...commentItems.values(), ...suggestionItems]);
    const unsubscribe = api.subscribe(({ ids }) => {
      let changed = false;
      ids.forEach((id) => {
        const previous = commentItems.get(id);
        const next = locate(id);
        if (
          previous?.blockIndices.length === next?.blockIndices.length &&
          previous?.blockIndices.every(
            (blockIndex, index) => blockIndex === next?.blockIndices[index]
          )
        ) {
          return;
        }
        if (next) commentItems.set(id, next);
        else commentItems.delete(id);
        changed = true;
      });
      if (changed) publish();
    });
    publish();
    return unsubscribe;
  }, [comments, editor, store, suggestions, visibleThreadIds]);

  React.useEffect(() => {
    store.setPrepareSelection(() => {
      comments.cancel();
      editor.plugin(CommentsPlugin).api.setActive([]);
      editor.plugin(suggestionPlugin).store.set({ activeId: null });
    });

    return () => store.setPrepareSelection(null);
  }, [comments, editor, store]);

  return store;
};

function DiscussionRoot({ children }: { children: React.ReactNode }) {
  const store = useDiscussionController();

  return <DiscussionContext value={store}>{children}</DiscussionContext>;
}

function DiscussionCard({ item }: { item: DiscussionItem }) {
  return item.kind === 'comment' ? (
    <CommentThreadCard id={item.id} />
  ) : (
    <SuggestionDiscussionCard review={item.review} threadIds={item.threadIds} />
  );
}

const getSuggestionSummaryItems = (text: string) => {
  const items = text
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : ['Line break'];
};

function SuggestionDiscussionCard({
  review,
  threadIds,
}: {
  review: SuggestionDiscussionReview;
  threadIds: readonly string[];
}) {
  const { api: comments } = useEditorPlugin(CommentsPlugin);
  const { store, update } = useEditorPlugin(suggestionPlugin);
  const user = useCommentUser(review.userId);

  return (
    <article
      className="relative flex flex-col focus-within:[&>header>.plite-suggestion-actions]:pointer-events-auto focus-within:[&>header>.plite-suggestion-actions]:opacity-100 hover:[&>header>.plite-suggestion-actions]:pointer-events-auto hover:[&>header>.plite-suggestion-actions]:opacity-100"
      data-suggestion-review={review.suggestionId}
    >
      <header className="relative flex items-center">
        <Avatar className="size-5">
          <AvatarImage alt={user?.name} src={user?.avatarUrl} />
          <AvatarFallback>{user?.name?.[0] ?? '?'}</AvatarFallback>
        </Avatar>
        <span className="mx-2 text-sm leading-none font-semibold">
          {user?.name ?? review.userId}
        </span>
        <span className="text-xs leading-none text-muted-foreground/80">
          {formatCommentDate(review.createdAt)}
        </span>
        <span className="plite-suggestion-actions pointer-events-none absolute top-0 right-0 flex gap-2 opacity-0 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100">
          <Button
            aria-label="Accept suggestion"
            className="size-6 p-1 text-muted-foreground"
            onClick={() => {
              update.accept(review.suggestionId);
              store.set({ activeId: null });
            }}
            variant="ghost"
          >
            <CheckIcon className="size-4" />
          </Button>
          <Button
            aria-label="Reject suggestion"
            className="size-6 p-1 text-muted-foreground"
            onClick={() => {
              update.reject(review.suggestionId);
              store.set({ activeId: null });
            }}
            variant="ghost"
          >
            <XIcon className="size-4" />
          </Button>
        </span>
      </header>

      <div className="relative mt-1 mb-4 flex flex-col gap-2 pl-[32px] text-sm">
        {review.type === 'remove' && (
          <p className="whitespace-pre-wrap">
            <span className="text-muted-foreground">Delete: </span>
            {getSuggestionSummaryItems(review.text ?? '').join('\n')}
          </p>
        )}
        {review.type === 'insert' && (
          <p className="whitespace-pre-wrap">
            <span className="text-muted-foreground">Add: </span>
            {getSuggestionSummaryItems(review.newText ?? '').join('\n')}
          </p>
        )}
        {review.type === 'replace' && (
          <>
            <p>
              <span className="text-brand/80">With: </span>
              {review.newText}
            </p>
            <p>
              <span className="text-muted-foreground">Replace: </span>
              {review.text}
            </p>
          </>
        )}
        {review.type === 'update' && (
          <>
            <p className="text-muted-foreground">
              {[
                ...Object.keys(review.properties ?? {})
                  .filter((key) => !(key in (review.newProperties ?? {})))
                  .map((key) => `Remove ${key}`),
                ...Object.entries(review.newProperties ?? {}).map(
                  ([key, value]) =>
                    value === null || value === false
                      ? `Remove ${key}`
                      : value === true
                        ? `Add ${key}`
                        : `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`
                ),
              ].join(', ')}
            </p>
            {review.newText && <p>{review.newText}</p>}
          </>
        )}
      </div>

      {threadIds.map((id) => (
        <CommentThreadCard id={id} key={id} />
      ))}

      <CommentComposer
        ariaLabel="Comment on suggestion"
        onSubmit={(body) =>
          comments.createThread({
            body,
            excerpt: `${review.type} suggestion`,
            target: { id: review.suggestionId, type: 'suggestion' },
          })
        }
        placeholder="Reply..."
      />
    </article>
  );
}

function NewComment({ editableRef }: EditableSiblingProps) {
  const editor = useEditor();
  const { api: comments } = useEditorPlugin(CommentsPlugin);

  return (
    <CommentComposer
      ariaLabel="New comment"
      autoFocus
      onCancel={() => {
        comments.cancel();
        editableRef.current?.focus();
      }}
      onSubmit={async (body) => {
        const id = await comments.create(body);

        if (id) editor.plugin(CommentsPlugin).api.setActive([id]);
        return id;
      }}
      placeholder="Add a comment"
    />
  );
}

function DiscussionBlock({
  children,
  editor,
  element,
}: RenderNodeWrapperProps<typeof CommentsPlugin>) {
  const store = useDiscussionStore();
  const blockKey = editor.key(element);
  const subscribe = React.useCallback(
    (listener: () => void) => store.subscribeBlock(blockKey, listener),
    [blockKey, store]
  );
  const block = React.useSyncExternalStore(
    subscribe,
    () => store.getBlockSnapshot(blockKey),
    () => store.getBlockSnapshot(blockKey)
  );
  const setTriggerRef = React.useCallback(
    (trigger: HTMLButtonElement | null) => {
      store.setBlockTrigger(blockKey, trigger);
    },
    [blockKey, store]
  );

  const isActive = block.active;
  const Icon =
    block.hasComments && block.hasSuggestions
      ? MessagesSquareIcon
      : block.hasSuggestions
        ? PencilLineIcon
        : MessageSquareTextIcon;
  const itemLabel = block.totalCount === 1 ? 'item' : 'items';

  return (
    <div className="flex w-full justify-between">
      <div className="w-full min-w-0">{children}</div>
      <div
        className="relative left-0 size-0 select-none"
        contentEditable={false}
      >
        {block.totalCount > 0 && (
          <Button
            aria-expanded={isActive}
            aria-label={`${isActive ? 'Close' : 'Open'} ${block.totalCount} discussion ${itemLabel} for this block`}
            className="mt-1 ml-1 flex h-6 gap-1 !px-1.5 py-0 text-muted-foreground/80 hover:text-muted-foreground/80 data-[active=true]:bg-muted"
            contentEditable={false}
            data-active={isActive}
            data-discussion-block-trigger
            data-plite-keep-selection-visible
            onClick={(event) => {
              event.stopPropagation();
              store.selectBlock(blockKey, event.currentTarget);
            }}
            onMouseDown={(event) => event.preventDefault()}
            ref={setTriggerRef}
            type="button"
            variant="ghost"
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span
              aria-hidden="true"
              className="text-xs font-semibold after:content-[attr(data-count)]"
              data-count={block.totalCount}
            />
          </Button>
        )}
      </div>
    </div>
  );
}

const DiscussionBlockSlot: RenderNodeWrapperDescriptor<typeof CommentsPlugin> =
  {
    component: DiscussionBlock,
    match: ({ renderPath }) => renderPath.length === 1,
  };

function DiscussionPopover({
  editableRef,
  snapshot,
}: EditableSiblingProps & { snapshot: DiscussionSnapshot }) {
  const editor = useEditor();
  const store = useDiscussionStore();
  const { api: comments } = useEditorPlugin(CommentsPlugin);
  const pending = usePendingComment();
  const activeCommentIds = usePluginStore(CommentsPlugin, 'activeIds');
  const activeSuggestionId = usePluginStore(suggestionPlugin, 'activeId');
  const activeOrder = new Map(activeCommentIds.map((id, index) => [id, index]));
  const activeItems = snapshot.items
    .filter((item) =>
      item.kind === 'comment'
        ? activeOrder.has(item.id)
        : item.id === activeSuggestionId
    )
    .toSorted(
      (left, right) =>
        (activeOrder.get(left.id) ?? activeCommentIds.length) -
        (activeOrder.get(right.id) ?? activeCommentIds.length)
    );
  const targetGroup = snapshot.target
    ? snapshot.groupsByKey.get(snapshot.target.blockKey)
    : undefined;
  const target = !pending && activeItems.length === 0 ? snapshot.target : null;
  const shownItems =
    activeItems.length > 0 ? activeItems : (targetGroup?.items ?? []);
  const activeSuggestionRange = activeItems.find(
    (item): item is Extract<DiscussionItem, { kind: 'suggestion' }> =>
      item.kind === 'suggestion'
  )?.review.range;
  const { api } = editor.plugin(CommentsPlugin);
  const subscribe = React.useCallback(
    (listener: () => void) => api.subscribe(listener),
    [api]
  );
  const getCommentRange = React.useCallback(
    () => activeCommentIds.map(api.range).find(Boolean) ?? null,
    [activeCommentIds, api]
  );
  const commentRange = React.useSyncExternalStore(
    subscribe,
    getCommentRange,
    getCommentRange
  );
  const pendingRange = useEditorSelector(
    () => (pending ? comments.pendingRange() : null),
    {
      equalityFn: RangeApi.equals,
      shouldUpdate: (change) => !change || change.changed.hasAny('document'),
    }
  );
  const anchorRange =
    pendingRange ?? commentRange ?? activeSuggestionRange ?? null;
  const anchorBlockKey = anchorRange
    ? editor.key([RangeApi.start(anchorRange).path[0] ?? 0])
    : null;
  const virtualAnchor = {
    contextElement: editor.api.dom.root() ?? undefined,
    getBoundingClientRect: () => {
      const blockRect = anchorBlockKey
        ? store.getBlockTrigger(anchorBlockKey)?.getBoundingClientRect()
        : null;
      const domRange = anchorRange
        ? editor.api.dom.resolveDOMRange(anchorRange)
        : null;

      if (!domRange) return blockRect ?? new DOMRect();

      const clientRect = Array.from(domRange.getClientRects()).find(
        ({ height, width }) => height > 0 || width > 0
      );

      if (clientRect) return clientRect;

      const rangeRect = domRange.getBoundingClientRect();

      return rangeRect.height > 0 || rangeRect.width > 0
        ? rangeRect
        : (blockRect ?? rangeRect);
    },
  };
  const anchorElement = target?.anchor ?? (anchorRange ? virtualAnchor : null);
  const open = Boolean(
    anchorElement && (pending || activeItems.length > 0 || targetGroup)
  );
  const openRef = React.useRef(open);

  React.useLayoutEffect(() => {
    openRef.current = open;
  }, [open]);

  React.useEffect(() => {
    if (snapshot.target && (pending || activeItems.length > 0)) {
      store.clearTarget();
    }
  }, [activeItems.length, pending, snapshot.target, store]);

  return (
    <div data-discussion-root="">
      <FloatingPopover
        modal={false}
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) return;
          if (
            activeCommentIds.some((id) =>
              comments.getSnapshot().draftThreadIds.includes(id)
            )
          ) {
            return;
          }

          store.clearTarget();
          comments.cancel();
          editor.plugin(CommentsPlugin).api.setActive([]);
          editor.plugin(suggestionPlugin).store.set({ activeId: null });
        }}
      >
        {anchorElement && <FloatingPopoverAnchor element={anchorElement} />}
        <FloatingPopoverContent
          align="center"
          aria-label={pending ? 'New comment' : 'Discussion items'}
          className="max-h-[min(50dvh,calc(-24px+var(--floating-popover-available-height)))] w-[380px] max-w-[calc(100vw-24px)] min-w-[130px] gap-0 overflow-y-auto p-0 data-[state=closed]:opacity-0"
          data-discussion-popover=""
          data-plite-keep-selection-visible
          onFinalFocus={(event) => {
            event.preventDefault();
            if (!openRef.current) editableRef.current?.focus();
          }}
          onInitialFocus={(event) => event.preventDefault()}
          side="bottom"
        >
          {pending ? (
            <div className="p-4">
              <NewComment editableRef={editableRef} />
            </div>
          ) : (
            shownItems.map((item, index) => (
              <React.Fragment key={`${item.kind}-${item.id}`}>
                <div className="p-4">
                  <DiscussionCard item={item} />
                </div>
                {index < shownItems.length - 1 && (
                  <Separator data-discussion-separator="" />
                )}
              </React.Fragment>
            ))
          )}
        </FloatingPopoverContent>
      </FloatingPopover>
    </div>
  );
}

function Discussion({ editableRef }: EditableSiblingProps) {
  const store = useDiscussionStore();
  const snapshot = React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );

  return <DiscussionPopover editableRef={editableRef} snapshot={snapshot} />;
}

export const DiscussionSlots = {
  afterEditable: Discussion,
  wrapNode: DiscussionBlockSlot,
  wrapRoot: DiscussionRoot,
} satisfies typeof CommentsPlugin.slots;

export const DiscussionKit = [
  ...CommentKit,
  CommentsPlugin.configure({ slots: DiscussionSlots }),
];
