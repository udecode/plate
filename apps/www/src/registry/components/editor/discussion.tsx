'use client';

import {
  CheckIcon,
  MessageSquareTextIcon,
  MessagesSquareIcon,
  PencilLineIcon,
  XIcon,
} from 'lucide-react';
import { ElementApi, type NodeKey, type Range, RangeApi } from 'platejs';
import type {
  AuthoredChange,
  AuthoredChangeDetails,
  AuthoredChangeGroup,
  AuthoredChangePart,
  AuthoredResult,
} from 'platejs/authored';
import { AuthoredPlugin } from 'platejs/authored';
import { CommentsPlugin } from 'platejs/comments/react';
import {
  type EditableSiblingProps,
  type RenderNodeWrapperDescriptor,
  type RenderNodeWrapperProps,
  type WrapRootProps,
  useEditor,
  useEditorRootElement,
  useEditorSelector,
  usePath,
  usePluginStore,
} from 'platejs/react';
import {
  SuggestionPlugin,
  useActiveSuggestion,
  useSuggestionGroups,
} from 'platejs/suggestion/react';
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

type RuntimeEditor = ReturnType<typeof useEditor>;

type DiscussionItem =
  | Readonly<{
      blockIndices: readonly number[];
      createdAt: Date;
      id: string;
      kind: 'comment';
    }>
  | Readonly<{
      createdAt: Date;
      group: AuthoredChangeGroup;
      id: string;
      kind: 'suggestion';
      range: Range | null;
      threadIds: readonly string[];
    }>;

type CommentItem = Extract<DiscussionItem, { kind: 'comment' }>;

type SuggestionItem = Extract<DiscussionItem, { kind: 'suggestion' }>;

type DiscussionBlockSnapshot = Readonly<{
  active: boolean;
  comments: number;
}>;

type DiscussionTarget = Readonly<{
  anchor: HTMLElement;
  blockKey: NodeKey;
}>;

type DiscussionSnapshot = Readonly<{
  revision: number;
  target: DiscussionTarget | null;
}>;

const EMPTY_BLOCK_SNAPSHOT: DiscussionBlockSnapshot = Object.freeze({
  active: false,
  comments: 0,
});
const EMPTY_DISCUSSION_SNAPSHOT: DiscussionSnapshot = Object.freeze({
  revision: 0,
  target: null,
});
const DISCUSSION_PAGE_SIZE = 20;

const sortDiscussionItems = (items: readonly DiscussionItem[]) =>
  items.toSorted(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime()
  );

const NO_GROUPS: readonly AuthoredChangeGroup[] = Object.freeze([]);
const NO_THREADS: ReadonlyMap<string, readonly string[]> = new Map();

const sameGroups = (
  left: readonly AuthoredChangeGroup[] | null,
  right: readonly AuthoredChangeGroup[]
) =>
  left?.length === right.length &&
  left.every(
    (group, index) =>
      group.id === right[index]?.id && group.revision === right[index].revision
  );

const suggestionItemOf = (
  editor: RuntimeEditor,
  threads: ReadonlyMap<string, readonly string[]>,
  group: AuthoredChangeGroup
): SuggestionItem => {
  const { read } = editor.plugin(AuthoredPlugin);

  return {
    createdAt: new Date(group.createdAt),
    group,
    id: group.id,
    kind: 'suggestion',
    range:
      read.changes({ group: group.id, limit: 1 }).items[0]?.ranges[0] ?? null,
    threadIds: [...threads].flatMap(([changeId, ids]) =>
      read.groupOf(changeId)?.id === group.id ? ids : []
    ),
  };
};

const blockThreadCount = (
  editor: RuntimeEditor,
  threads: ReadonlyMap<string, readonly string[]>,
  blockIndex: number
) => {
  const { read } = editor.plugin(AuthoredPlugin);
  let count = 0;

  for (let cursor: string | undefined; threads.size > 0;) {
    const page = read.changes({ at: [blockIndex], cursor, limit: 200 });

    for (const change of page.items) {
      count += threads.get(change.id)?.length ?? 0;
    }
    if (!page.cursor) break;
    ({ cursor } = page);
  }

  return count;
};

const blockIndicesOf = (ranges: readonly Range[]) => [
  ...new Set(
    ranges.flatMap((range) => {
      const [start, end] = RangeApi.edges(range);
      if (start.root || end.root) return [];
      const firstBlock = start.path[0] ?? 0;
      return Array.from(
        { length: (end.path[0] ?? firstBlock) - firstBlock + 1 },
        (_, offset) => firstBlock + offset
      );
    })
  ),
];

const sameBlockSnapshot = (
  left: DiscussionBlockSnapshot | undefined,
  right: DiscussionBlockSnapshot
) => left?.active === right.active && left.comments === right.comments;

const createDiscussionStore = () => {
  const listeners = new Set<() => void>();
  const blockListeners = new Map<NodeKey, Set<() => void>>();
  const blockTriggers = new Map<NodeKey, HTMLElement>();
  const blockSnapshots = new Map<NodeKey, DiscussionBlockSnapshot>();
  const threadListeners = new Set<() => void>();
  let commentBlocks = new Map<NodeKey, readonly CommentItem[]>();
  let commentsById = new Map<string, CommentItem>();
  let notifyQueued = false;
  let prepareSelection: (() => void) | null = null;
  let suggestionThreads = NO_THREADS;
  let snapshot = EMPTY_DISCUSSION_SNAPSHOT;

  const notifyBlocks = (keys: ReadonlySet<NodeKey>) => {
    keys.forEach((key) => {
      blockListeners.get(key)?.forEach((listener) => {
        listener();
      });
    });
  };
  const notify = () => {
    if (notifyQueued) return;
    notifyQueued = true;
    queueMicrotask(() => {
      notifyQueued = false;
      listeners.forEach((listener) => {
        listener();
      });
    });
  };
  const readBlockSnapshot = (blockKey: NodeKey): DiscussionBlockSnapshot => {
    const active = snapshot.target?.blockKey === blockKey;
    const comments = commentBlocks.get(blockKey)?.length ?? 0;

    return active || comments > 0 ? { active, comments } : EMPTY_BLOCK_SNAPSHOT;
  };
  const publishBlockSnapshots = (keys: ReadonlySet<NodeKey>) => {
    const changedKeys = new Set<NodeKey>();

    keys.forEach((key) => {
      const previous = blockSnapshots.get(key);
      const next = readBlockSnapshot(key);

      if (next === EMPTY_BLOCK_SNAPSHOT) blockSnapshots.delete(key);
      else if (previous && sameBlockSnapshot(previous, next)) return;
      else blockSnapshots.set(key, next);
      if (previous !== next) changedKeys.add(key);
    });
    notifyBlocks(changedKeys);
  };
  const publishTarget = (target: DiscussionTarget | null) => {
    if (snapshot.target === target) return;

    const keys = new Set<NodeKey>();

    if (snapshot.target) keys.add(snapshot.target.blockKey);
    if (target) keys.add(target.blockKey);
    snapshot = { ...snapshot, target };
    listeners.forEach((listener) => {
      listener();
    });
    publishBlockSnapshots(keys);
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
    getComment(id: string) {
      return commentsById.get(id) ?? null;
    },
    getComments(blockKey: NodeKey) {
      return commentBlocks.get(blockKey) ?? [];
    },
    getSnapshot: () => snapshot,
    getThreads: () => suggestionThreads,
    selectBlock(blockKey: NodeKey, anchor: HTMLElement) {
      if (!prepareSelection) return;

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
    subscribeThreads: (listener: () => void) => {
      threadListeners.add(listener);

      return () => threadListeners.delete(listener);
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
    update(
      currentEditor: RuntimeEditor,
      items: readonly CommentItem[],
      threads: ReadonlyMap<string, readonly string[]>
    ) {
      const previousKeys = new Set(commentBlocks.keys());
      const nextBlocks = new Map<NodeKey, CommentItem[]>();

      commentsById = new Map(items.map((item) => [item.id, item]));
      items.forEach((item) => {
        item.blockIndices.forEach((blockIndex) => {
          const blockKey = currentEditor.key([blockIndex]);
          if (!blockKey) return;
          const block = nextBlocks.get(blockKey);

          if (block) block.push(item);
          else nextBlocks.set(blockKey, [item]);
        });
      });
      commentBlocks = nextBlocks;
      suggestionThreads = new Map(threads);
      threadListeners.forEach((listener) => {
        listener();
      });
      publishBlockSnapshots(
        new Set([...previousKeys, ...commentBlocks.keys()])
      );
      snapshot = { ...snapshot, revision: snapshot.revision + 1 };
      notify();
    },
  };
};

type DiscussionStore = ReturnType<typeof createDiscussionStore>;

const DiscussionContext = React.createContext<DiscussionStore | null>(null);

const SuggestionsInstalledContext = React.createContext(false);

const useDiscussionStore = () => {
  const store = React.useContext(DiscussionContext);

  if (!store) throw new Error('Discussion requires DiscussionSlots.');

  return store;
};

const useDiscussionController = () => {
  const editor = useEditor();
  const { api: comments } = useEditor().plugin(CommentsPlugin);
  const visibleThreadIds = useVisibleCommentThreadIds();
  const [store] = React.useState(createDiscussionStore);
  React.useEffect(() => {
    const { api } = editor.plugin(CommentsPlugin);
    const locate = (id: string, thread = comments.getThread(id)) => {
      if (!thread || thread.resolution) return null;
      const attachment = api.attachment(id);
      if (thread.target.type === 'change') return null;
      if (attachment?.type !== 'range' || attachment.status !== 'attached') {
        return null;
      }
      return {
        blockIndices: blockIndicesOf([attachment.range]),
        createdAt: new Date(thread.createdAt),
        id,
        kind: 'comment' as const,
      };
    };
    const publish = () => {
      const suggestionThreads = new Map<string, string[]>();
      const commentItems: CommentItem[] = [];
      const visible = new Set(visibleThreadIds);

      comments.getThreads().forEach((thread) => {
        if (thread.resolution) return;
        if (thread.target.type === 'change') {
          const ids = suggestionThreads.get(thread.target.id) ?? [];

          ids.push(thread.id);
          suggestionThreads.set(thread.target.id, ids);
          return;
        }
        if (!visible.has(thread.id)) return;
        const item = locate(thread.id, thread);
        if (item) commentItems.push(item);
      });
      store.update(editor, commentItems, suggestionThreads);
    };
    const unsubscribeAttachments = api.subscribeAttachments(publish);
    const unsubscribeThreads = api.subscribeThreads(publish);

    publish();
    return () => {
      unsubscribeAttachments();
      unsubscribeThreads();
    };
  }, [comments, editor, store, visibleThreadIds]);

  return store;
};

function DiscussionRoot({ children }: WrapRootProps) {
  const store = useDiscussionController();
  const suggestions = useEditorSelector(
    (current) =>
      current.plugin(AuthoredPlugin).installed &&
      current.plugin(SuggestionPlugin).installed
  );

  return (
    <DiscussionContext value={store}>
      <SuggestionsInstalledContext value={suggestions}>
        {children}
      </SuggestionsInstalledContext>
    </DiscussionContext>
  );
}

function DiscussionCard({
  item,
  onDecisionApplied,
}: {
  item: DiscussionItem;
  onDecisionApplied: () => void;
}) {
  return item.kind === 'comment' ? (
    <CommentThreadCard id={item.id} />
  ) : (
    <SuggestionDiscussionCard
      createdAt={item.createdAt}
      group={item.group}
      onDecisionApplied={onDecisionApplied}
      threadIds={item.threadIds}
    />
  );
}

const readContentText = (value: unknown): string => {
  if (!value || typeof value !== 'object') return '';
  const node = value as { children?: unknown; text?: unknown };

  if (typeof node.text === 'string') return node.text;
  if (!Array.isArray(node.children)) return '';

  return node.children.map(readContentText).join('');
};

const contentText = (
  content: Extract<AuthoredChangePart, { kind: 'content' }>['after']
) => {
  if (!content) return '';

  // Only a line break between two blocks; inline content runs on.
  return content.content
    .map((node, index) =>
      index > 0 &&
      ElementApi.isElement(node) &&
      ElementApi.isElement(content.content[index - 1])
        ? `\n${readContentText(node)}`
        : readContentText(node)
    )
    .join('');
};

const textPreview = (text: string) => {
  const preview = text.trim();

  return preview.length > 80 ? `${preview.slice(0, 77)}…` : preview;
};

const contentPreview = (
  content: Extract<AuthoredChangePart, { kind: 'content' }>['after']
) => textPreview(contentText(content));

const formatPropertyName = (key: string) =>
  `${key[0]?.toUpperCase() ?? ''}${key.slice(1)}`
    .replaceAll(/[_-]+/g, ' ')
    .replaceAll(/([a-z0-9])([A-Z])/g, '$1 $2');

const formatPropertyValue = (value: unknown) => {
  if (value === undefined) return 'none';
  if (typeof value === 'boolean') return value ? 'on' : 'off';
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return JSON.stringify(value);
};

const describeSuggestionPart = (
  part: AuthoredChangePart
): readonly string[] => {
  const { kind } = part;

  switch (kind) {
    case 'boundary': {
      return [
        part.action === 'split'
          ? 'Add paragraph break'
          : 'Delete paragraph break',
      ];
    }
    case 'content': {
      const before = contentPreview(part.before);
      const after = contentPreview(part.after);
      const { action } = part;

      switch (action) {
        case 'delete': {
          return [before ? `Delete “${before}”` : 'Delete content'];
        }
        case 'insert': {
          return [after ? `Add “${after}”` : 'Add content'];
        }
        case 'replace': {
          return [
            before && after
              ? `Replace “${before}” with “${after}”`
              : 'Replace content',
          ];
        }
        default: {
          const unsupportedAction: never = action;

          throw new Error(
            `Unsupported content action: ${String(unsupportedAction)}`
          );
        }
      }
    }
    case 'properties': {
      const keys = [
        ...new Set([...Object.keys(part.before), ...Object.keys(part.after)]),
      ].sort();

      return keys.map(
        (key) =>
          `${formatPropertyName(key)}: ${formatPropertyValue(
            part.before[key]
          )} → ${formatPropertyValue(part.after[key])}`
      );
    }
    case 'enclosure': {
      return [
        `${part.action === 'wrap' ? 'Wrap in' : 'Unwrap'} ${formatPropertyName(
          part.type
        )}`,
      ];
    }
    default: {
      const unsupportedKind: never = kind;

      throw new Error(
        `Unsupported suggestion part: ${String(unsupportedKind)}`
      );
    }
  }
};

const describeSuggestion = (
  details: ReadonlyArray<AuthoredChangeDetails | null>,
  fallback: AuthoredChange['kind']
) => {
  const parts = details.flatMap((detail) => detail?.parts ?? []);
  const descriptions: string[] = [];

  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    const next = parts[index + 1];

    if (
      part.kind === 'content' &&
      part.action === 'delete' &&
      next?.kind === 'content' &&
      next.action === 'insert'
    ) {
      descriptions.push(
        ...describeSuggestionPart({
          ...part,
          action: 'replace',
          after: next.after,
        })
      );
      index += 1;
      continue;
    }
    descriptions.push(...describeSuggestionPart(part));
  }

  if (descriptions.length > 0) return descriptions;

  return [
    {
      delete: 'Delete content',
      format: 'Change formatting',
      insert: 'Add content',
      mixed: 'Edit content',
      structure: 'Change structure',
    }[fallback],
  ];
};

function SuggestionDiscussionCard({
  createdAt,
  group,
  onDecisionApplied,
  threadIds,
}: {
  createdAt: Date;
  group: AuthoredChangeGroup;
  onDecisionApplied: () => void;
  threadIds: readonly string[];
}) {
  const editor = useEditor();
  const { api: comments } = useEditor().plugin(CommentsPlugin);
  const user = useCommentUser(group.authorId);
  const groupKey = `${group.id}:${group.revision}`;
  const [outcomeState, setOutcomeState] = React.useState<{
    groupKey: string;
    result: AuthoredResult;
  } | null>(null);
  const outcome =
    outcomeState?.groupKey === groupKey ? outcomeState.result : null;
  const [shownState, setShownState] = React.useState({
    count: DISCUSSION_PAGE_SIZE,
    groupId: group.id,
  });
  const shown =
    shownState.groupId === group.id ? shownState.count : DISCUSSION_PAGE_SIZE;
  const authored = editor.plugin(AuthoredPlugin);
  // Each render reads the card's changes from its first page, so no cursor
  // outlives a commit.
  const changes: AuthoredChange[] = [];

  for (let cursor: string | undefined; changes.length < shown;) {
    const page = authored.read.changes({ cursor, group: group.id, limit: 200 });

    changes.push(...page.items);
    if (!page.cursor) break;
    ({ cursor } = page);
  }

  const descriptions = describeSuggestion(
    changes.slice(0, shown).map((change) => authored.read.details(change.id)),
    changes[0]?.kind ?? 'mixed'
  );
  const setOutcome = (result: AuthoredResult) =>
    setOutcomeState({ groupKey, result });

  const decide = (
    action: 'accept' | 'reject',
    related: readonly string[] = []
  ) => {
    const relatedChanges = related.flatMap((id) => {
      const change = authored.read.change(id);
      return change ? [change] : [];
    });
    const result = authored.update.decide([
      { action, groups: [group] },
      ...(relatedChanges.length > 0
        ? [{ action, changes: relatedChanges }]
        : []),
    ]);

    if (result.status === 'applied' || result.status === 'unchanged') {
      onDecisionApplied();
      return;
    }
    setOutcome(result);
  };
  const relatedIds = outcome?.status === 'blocked' ? outcome.with : [];
  const outcomeMessage = (() => {
    if (!outcome) return null;
    const { status } = outcome;

    switch (status) {
      case 'applied': {
        return null;
      }
      case 'unchanged': {
        return null;
      }
      case 'blocked': {
        return `This decision also affects ${
          relatedIds.length
        } related suggestion${relatedIds.length === 1 ? '' : 's'}.`;
      }
      case 'invalid': {
        return 'This decision would leave the document invalid.';
      }
      case 'stale': {
        return 'This suggestion changed. Review it again before deciding.';
      }
      default: {
        const unsupportedStatus: never = status;

        throw new Error(
          `Unsupported authored result: ${String(unsupportedStatus)}`
        );
      }
    }
  })();

  return (
    <article
      className="relative flex flex-col focus-within:[&>header>.editor-suggestion-actions]:pointer-events-auto focus-within:[&>header>.editor-suggestion-actions]:opacity-100 hover:[&>header>.editor-suggestion-actions]:pointer-events-auto hover:[&>header>.editor-suggestion-actions]:opacity-100"
      data-suggestion-review={group.id}
    >
      <header className="relative flex items-center">
        <Avatar className="size-5">
          <AvatarImage alt={user?.name} src={user?.avatarUrl} />
          <AvatarFallback>{user?.name?.[0] ?? '?'}</AvatarFallback>
        </Avatar>
        <span className="mx-2 text-sm leading-none font-semibold">
          {user?.name ?? group.authorId}
        </span>
        <span className="text-xs leading-none text-muted-foreground/80">
          {formatCommentDate(createdAt)}
        </span>
        <span className="editor-suggestion-actions pointer-events-none absolute top-0 right-0 flex gap-2 opacity-0 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100">
          <Button
            aria-label="Accept suggestion"
            className="size-6 p-1 text-muted-foreground"
            onClick={() => decide('accept')}
            variant="ghost"
          >
            <CheckIcon className="size-4" />
          </Button>
          <Button
            aria-label="Reject suggestion"
            className="size-6 p-1 text-muted-foreground"
            onClick={() => decide('reject')}
            variant="ghost"
          >
            <XIcon className="size-4" />
          </Button>
        </span>
      </header>

      <div className="relative mt-1 mb-4 flex flex-col gap-2 pl-[32px] text-sm">
        {descriptions.map((description, index) => (
          <p className="text-muted-foreground" key={`${index}:${description}`}>
            {description}
          </p>
        ))}
        {group.changeCount > shown && (
          <Button
            className="self-start"
            onClick={() =>
              setShownState({
                count: shown + DISCUSSION_PAGE_SIZE,
                groupId: group.id,
              })
            }
            size="sm"
            variant="ghost"
          >
            Show {Math.min(DISCUSSION_PAGE_SIZE, group.changeCount - shown)}{' '}
            more changes
          </Button>
        )}
        {outcomeMessage && (
          <div className="flex flex-col items-start gap-2" role="alert">
            <p>{outcomeMessage}</p>
            {outcome?.status === 'blocked' && relatedIds.length > 0 && (
              <div className="flex gap-2">
                <Button
                  onClick={() => decide('accept', relatedIds)}
                  size="sm"
                  variant="outline"
                >
                  Accept related
                </Button>
                <Button
                  onClick={() => decide('reject', relatedIds)}
                  size="sm"
                  variant="outline"
                >
                  Reject related
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {threadIds.map((id) => (
        <CommentThreadCard id={id} key={id} showReply={false} />
      ))}

      <CommentComposer
        ariaLabel="Comment on suggestion"
        onSubmit={(body) =>
          comments.createThread({
            body,
            excerpt: descriptions[0] ?? 'Suggestion',
            target: { id: group.id, type: 'change' },
          })
        }
        placeholder="Reply..."
      />
    </article>
  );
}

function NewComment({
  autoFocus,
  editableRef,
}: EditableSiblingProps & { autoFocus: boolean }) {
  const { api: comments } = useEditor().plugin(CommentsPlugin);

  return (
    <CommentComposer
      ariaLabel="New comment"
      autoFocus={autoFocus}
      onCancel={() => {
        comments.cancel();
        editableRef.current?.focus();
      }}
      onSubmit={async (body) => {
        const result = await comments.create(body);

        if (result.status === 'applied') comments.setActive([result.value]);
        return result;
      }}
      placeholder="Add a comment"
    />
  );
}

function DiscussionBlock({
  children,
  editor,
}: RenderNodeWrapperProps<typeof CommentsPlugin>) {
  const path = usePath();
  const blockKey = editor.key(path);
  const suggestions = React.useContext(SuggestionsInstalledContext);

  if (!blockKey) return children;

  return suggestions ? (
    <SuggestionDiscussionBlock blockIndex={path[0] ?? 0} blockKey={blockKey}>
      {children}
    </SuggestionDiscussionBlock>
  ) : (
    <DiscussionBlockContent blockKey={blockKey} cards={0} threads={0}>
      {children}
    </DiscussionBlockContent>
  );
}

function SuggestionDiscussionBlock({
  blockIndex,
  blockKey,
  children,
}: React.PropsWithChildren<{ blockIndex: number; blockKey: NodeKey }>) {
  const editor = useEditor();
  const store = useDiscussionStore();
  const cards = useSuggestionGroups(blockKey);
  const threads = React.useSyncExternalStore(
    store.subscribeThreads,
    store.getThreads,
    store.getThreads
  );

  return (
    <DiscussionBlockContent
      blockKey={blockKey}
      cards={cards.length}
      threads={
        cards.length > 0 ? blockThreadCount(editor, threads, blockIndex) : 0
      }
    >
      {children}
    </DiscussionBlockContent>
  );
}

function DiscussionBlockContent({
  blockKey,
  cards,
  children,
  threads,
}: React.PropsWithChildren<{
  blockKey: NodeKey;
  cards: number;
  threads: number;
}>) {
  const store = useDiscussionStore();
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
  const hasComments = block.comments > 0 || threads > 0;
  const totalCount = block.comments + cards + threads;
  const Icon =
    hasComments && cards > 0
      ? MessagesSquareIcon
      : cards > 0
        ? PencilLineIcon
        : MessageSquareTextIcon;
  const itemLabel = totalCount === 1 ? 'item' : 'items';

  return (
    <div className="flex w-full justify-between">
      <div className="w-full min-w-0">{children}</div>
      <div
        className="relative left-0 size-0 select-none"
        contentEditable={false}
      >
        {totalCount > 0 && (
          <Button
            aria-expanded={isActive}
            aria-label={`${isActive ? 'Close' : 'Open'} ${
              totalCount
            } discussion ${itemLabel} for this block`}
            className="mt-1 ml-1 flex h-6 gap-1 !px-1.5 py-0 text-muted-foreground/80 hover:text-muted-foreground/80 data-[active=true]:bg-muted"
            contentEditable={false}
            data-active={isActive}
            data-discussion-block-trigger
            data-editor-keep-selection-visible
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
              data-count={totalCount}
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
  activeSuggestionId,
  editableRef,
  setActiveSuggestionId,
  snapshot,
}: EditableSiblingProps & {
  activeSuggestionId: string | null;
  setActiveSuggestionId?: (id: string | null) => void;
  snapshot: DiscussionSnapshot;
}) {
  const editor = useEditor();
  const rootElement = useEditorRootElement(editor);
  const store = useDiscussionStore();
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const { api: comments } = useEditor().plugin(CommentsPlugin);
  const pending = usePendingComment();
  const activeCommentIds = usePluginStore(CommentsPlugin, 'activeIds');
  const activeOrder = new Map(activeCommentIds.map((id, index) => [id, index]));
  const suggestions = React.useContext(SuggestionsInstalledContext);
  const targetKey = snapshot.target?.blockKey ?? null;
  const threads = React.useSyncExternalStore(
    store.subscribeThreads,
    store.getThreads,
    store.getThreads
  );
  // Open cards read their summaries after each commit, so the revision a
  // decision sends stays current when another block changes the card.
  const activeGroups = useEditorSelector(
    (current) => {
      const group =
        suggestions && activeSuggestionId
          ? current.plugin(AuthoredPlugin).read.groupOf(activeSuggestionId)
          : null;

      return group ? [group] : NO_GROUPS;
    },
    { equalityFn: sameGroups }
  );
  const targetGroups = useEditorSelector(
    (current) => {
      // Under a preview, the stored block at the same index holds the cards.
      const index =
        suggestions && targetKey
          ? current.read.nodes.path(targetKey)?.[0]
          : undefined;

      return index === undefined
        ? NO_GROUPS
        : current.plugin(AuthoredPlugin).read.groups({ at: [index] });
    },
    { equalityFn: sameGroups }
  );
  const activeItems: DiscussionItem[] = [
    ...activeCommentIds.flatMap((id) => {
      const item = store.getComment(id);

      return item ? [item] : [];
    }),
    ...activeGroups.map((group) => suggestionItemOf(editor, threads, group)),
  ].toSorted(
    (left, right) =>
      (activeOrder.get(left.id) ?? activeCommentIds.length) -
      (activeOrder.get(right.id) ?? activeCommentIds.length)
  );
  const targetItems = targetKey
    ? sortDiscussionItems([
        ...store.getComments(targetKey),
        ...targetGroups.map((group) =>
          suggestionItemOf(editor, threads, group)
        ),
      ])
    : [];
  const target = !pending && activeItems.length === 0 ? snapshot.target : null;
  const [pagination, setPagination] = React.useState<{
    count: number;
    targetKey: NodeKey | null;
  }>({ count: DISCUSSION_PAGE_SIZE, targetKey });
  const visibleCount =
    pagination.targetKey === targetKey
      ? pagination.count
      : DISCUSSION_PAGE_SIZE;
  const shownItems =
    activeItems.length > 0 ? activeItems : targetItems.slice(0, visibleCount);
  const activeSuggestionRange = activeItems.find(
    (item): item is SuggestionItem => item.kind === 'suggestion'
  )?.range;
  const { api } = editor.plugin(CommentsPlugin);
  const commentRange = (() => {
    const authored = editor.plugin(AuthoredPlugin);

    for (const id of activeCommentIds) {
      const attachment = api.attachment(id);
      if (attachment?.type === 'range' && attachment.status === 'attached') {
        return attachment.range;
      }
      if (attachment?.type === 'change' && authored.installed) {
        const range = authored.read.change(attachment.id)?.ranges[0];

        if (range) return range;
      }
    }
    return null;
  })();
  const pendingRange = useEditorSelector(
    () => (pending ? comments.pendingRange() : null),
    {
      equalityFn: RangeApi.equals,
      shouldUpdate: (change) => !change || change.changed.hasAny('document'),
    }
  );
  const anchorRange =
    pendingRange ?? commentRange ?? activeSuggestionRange ?? null;
  const anchorRangeJson = anchorRange ? JSON.stringify(anchorRange) : null;
  const anchorBlockKey = anchorRange
    ? editor.key([RangeApi.start(anchorRange).path[0] ?? 0])
    : null;
  const virtualAnchor = React.useMemo(() => {
    const currentAnchorRange = anchorRangeJson
      ? (JSON.parse(anchorRangeJson) as Range)
      : null;

    return {
      contextElement: rootElement ?? undefined,
      getBoundingClientRect: () => {
        const blockRect = anchorBlockKey
          ? store.getBlockTrigger(anchorBlockKey)?.getBoundingClientRect()
          : null;
        const domRange = currentAnchorRange
          ? editor.api.dom.resolveDOMRange(currentAnchorRange)
          : null;

        if (!domRange) return blockRect ?? new DOMRect();

        const clientRect = Array.from(domRange.getClientRects()).findLast(
          ({ height, width }) => height > 0 || width > 0
        );

        if (clientRect) return clientRect;

        const rangeRect = domRange.getBoundingClientRect();

        return rangeRect.height > 0 || rangeRect.width > 0
          ? rangeRect
          : (blockRect ?? rangeRect);
      },
    };
  }, [anchorBlockKey, anchorRangeJson, editor, rootElement, store]);
  const anchorElement = target?.anchor ?? (anchorRange ? virtualAnchor : null);
  const open = Boolean(
    anchorElement &&
    (pending || activeItems.length > 0 || targetItems.length > 0)
  );
  const openRef = React.useRef(open);
  const [placedPending, setPlacedPending] =
    React.useState<typeof pending>(null);

  React.useLayoutEffect(() => {
    openRef.current = open;
  }, [open]);

  React.useEffect(() => {
    if (
      snapshot.target &&
      (pending || activeItems.length > 0 || targetItems.length === 0)
    ) {
      store.clearTarget();
    }
  }, [activeItems.length, pending, snapshot.target, store, targetItems.length]);

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
          setActiveSuggestionId?.(null);
        }}
      >
        {anchorElement && <FloatingPopoverAnchor element={anchorElement} />}
        <FloatingPopoverContent
          align="center"
          aria-label={pending ? 'New comment' : 'Discussion items'}
          className="max-h-[min(50dvh,calc(-24px+var(--floating-popover-available-height)))] w-[380px] max-w-[calc(100vw-24px)] min-w-[130px] gap-0 overflow-y-auto p-0 data-[state=closed]:opacity-0"
          data-discussion-popover=""
          data-editor-keep-selection-visible
          ref={popoverRef}
          tabIndex={-1}
          onFinalFocus={(event) => {
            event.preventDefault();
            const document = editableRef.current?.ownerDocument;
            const active = document?.activeElement;
            if (
              !openRef.current &&
              (!active ||
                active === document?.body ||
                popoverRef.current?.contains(active))
            ) {
              editableRef.current?.focus();
            }
          }}
          onInitialFocus={(event) => event.preventDefault()}
          onPlaced={() => {
            if (pending) setPlacedPending(pending);
          }}
          side="bottom"
        >
          {pending ? (
            <div className="p-4">
              <NewComment
                autoFocus={placedPending === pending}
                editableRef={editableRef}
              />
            </div>
          ) : (
            <>
              {shownItems.map((item, index) => (
                <React.Fragment key={`${item.kind}-${item.id}`}>
                  <div className="p-4">
                    <DiscussionCard
                      item={item}
                      onDecisionApplied={() => {
                        if (!snapshot.target && item.kind === 'suggestion') {
                          comments.setActive(item.threadIds);
                          requestAnimationFrame(() => {
                            popoverRef.current?.focus();
                          });
                          return;
                        }
                        popoverRef.current?.focus();
                      }}
                    />
                  </div>
                  {(index < shownItems.length - 1 ||
                    shownItems.length < targetItems.length) && (
                    <Separator data-discussion-separator="" />
                  )}
                </React.Fragment>
              ))}
              {activeItems.length === 0 &&
                shownItems.length < targetItems.length && (
                  <div className="p-3">
                    <Button
                      className="w-full"
                      onClick={() =>
                        setPagination({
                          count: Math.min(
                            visibleCount + DISCUSSION_PAGE_SIZE,
                            targetItems.length
                          ),
                          targetKey,
                        })
                      }
                      size="sm"
                      variant="ghost"
                    >
                      Show more discussion items
                    </Button>
                  </div>
                )}
            </>
          )}
        </FloatingPopoverContent>
      </FloatingPopover>
    </div>
  );
}

const usePrepareDiscussionSelection = (
  setActiveSuggestionId?: (id: string | null) => void
) => {
  const editor = useEditor();
  const store = useDiscussionStore();
  const { api: comments } = editor.plugin(CommentsPlugin);

  React.useEffect(() => {
    store.setPrepareSelection(() => {
      comments.cancel();
      editor.plugin(CommentsPlugin).api.setActive([]);
      setActiveSuggestionId?.(null);
    });

    return () => store.setPrepareSelection(null);
  }, [comments, editor, setActiveSuggestionId, store]);
};

function SuggestionDiscussion({
  editableRef,
  snapshot,
}: EditableSiblingProps & { snapshot: DiscussionSnapshot }) {
  const { activeId, setActiveId } = useActiveSuggestion();

  usePrepareDiscussionSelection(setActiveId);

  return (
    <DiscussionPopover
      activeSuggestionId={activeId}
      editableRef={editableRef}
      setActiveSuggestionId={setActiveId}
      snapshot={snapshot}
    />
  );
}

function CommentDiscussion({
  editableRef,
  snapshot,
}: EditableSiblingProps & { snapshot: DiscussionSnapshot }) {
  usePrepareDiscussionSelection();

  return (
    <DiscussionPopover
      activeSuggestionId={null}
      editableRef={editableRef}
      snapshot={snapshot}
    />
  );
}

function Discussion({ editableRef }: EditableSiblingProps) {
  const store = useDiscussionStore();
  const snapshot = React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
  const suggestionsInstalled = React.useContext(SuggestionsInstalledContext);

  return suggestionsInstalled ? (
    <SuggestionDiscussion editableRef={editableRef} snapshot={snapshot} />
  ) : (
    <CommentDiscussion editableRef={editableRef} snapshot={snapshot} />
  );
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
