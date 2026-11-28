'use client';

import {
  CheckIcon,
  MessageSquareTextIcon,
  MessagesSquareIcon,
  PencilLineIcon,
  XIcon,
} from 'lucide-react';
import {
  createEditorView,
  ElementApi,
  type NamedRootKey,
  type NodeKey,
  type Point,
  type Range,
  RangeApi,
} from 'platejs';
import type {
  AuthoredChangeGroup,
  AuthoredGroupDetails,
  AuthoredGroupPart,
  AuthoredResult,
} from 'platejs/authored';
import { AuthoredPlugin } from 'platejs/authored';
import {
  AuthoredReactPlugin,
  useActiveAuthored,
  useAuthoredGroups,
} from 'platejs/authored/react';
import {
  CommentsPlugin,
  type CommentThreadIndex,
  useCommentThreadIndex,
} from 'platejs/comments/react';
import {
  type EditableSiblingProps,
  type RenderNodeWrapperDescriptor,
  type RenderNodeWrapperProps,
  type WrapRootProps,
  useEditor,
  useEditorRootAreas,
  useEditorRootElement,
  useEditorSelector,
  useModelEditor,
  usePath,
} from 'platejs/react';
import { describeTableSuggestionGroup } from 'platejs/table';
import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CommentComposer,
  CommentKit,
  CommentThreadCard,
  formatCommentDate,
  useActiveCommentIds,
  usePendingComment,
} from '@/registry/components/editor/comment';
import {
  FloatingPopover,
  FloatingPopoverAnchor,
  FloatingPopoverContent,
} from '@/registry/components/editor/floating-popover';
import { useUser } from '@/registry/components/editor/user-directory';
import { useVisibleAnchor } from '@/registry/hooks/use-visible-anchor';

type RuntimeEditor = ReturnType<typeof useEditor>;

type DiscussionItem =
  | Readonly<{
      blockKeys: readonly NodeKey[];
      createdAt: Date;
      id: string;
      kind: 'comment';
    }>
  | Readonly<{
      createdAt: Date;
      group: AuthoredChangeGroup;
      id: string;
      kind: 'suggestion';
      threadIds: readonly string[];
    }>;

type CommentItem = Extract<DiscussionItem, { kind: 'comment' }>;

type SuggestionItem = Extract<DiscussionItem, { kind: 'suggestion' }>;

type CommentAnchor = Readonly<{ changeId: string | null; range: Range }>;

type DiscussionBlockSnapshot = Readonly<{
  active: boolean;
  comments: number;
}>;

type DiscussionTarget = Readonly<{
  anchor: HTMLElement;
  blockKey: NodeKey;
}>;

type DiscussionSnapshot = Readonly<{
  lastTrigger: NodeKey | null;
  revision: number;
  target: DiscussionTarget | null;
}>;

const EMPTY_BLOCK_SNAPSHOT: DiscussionBlockSnapshot = Object.freeze({
  active: false,
  comments: 0,
});
const EMPTY_DISCUSSION_SNAPSHOT: DiscussionSnapshot = Object.freeze({
  lastTrigger: null,
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
  left: readonly AuthoredChangeGroup[],
  right: readonly AuthoredChangeGroup[]
) =>
  left.length === right.length &&
  left.every(
    (group, index) =>
      group.id === right[index]?.id && group.revision === right[index].revision
  );

const sameCommentAnchor = (
  left: CommentAnchor | null,
  right: CommentAnchor | null
) =>
  left?.changeId === right?.changeId &&
  RangeApi.equals(left?.range ?? null, right?.range ?? null);

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
    threadIds: [...threads].flatMap(([changeId, ids]) =>
      read.groupOf(changeId)?.id === group.id ? ids : []
    ),
  };
};

const blockThreadCount = (
  editor: RuntimeEditor,
  threads: ReadonlyMap<string, readonly string[]>,
  blockKey: NodeKey
) => {
  const { read } = editor.plugin(AuthoredPlugin);
  let count = 0;

  for (let cursor: string | undefined; threads.size > 0;) {
    const page = read.changes({ at: blockKey, cursor, limit: 200 });

    for (const change of page.items) {
      count += threads.get(change.id)?.length ?? 0;
    }
    if (!page.cursor) break;
    ({ cursor } = page);
  }

  return count;
};

const sameBlockSnapshot = (
  left: DiscussionBlockSnapshot | undefined,
  right: DiscussionBlockSnapshot
) => left?.active === right.active && left.comments === right.comments;

const createDiscussionStore = () => {
  const listeners = new Set<() => void>();
  const blockListeners = new Map<NodeKey, Set<() => void>>();
  const blockTriggers = new Map<NodeKey, HTMLElement>();
  const blockTriggerElements = new Set<HTMLElement>();
  const blockSnapshots = new Map<NodeKey, DiscussionBlockSnapshot>();
  const threadListeners = new Set<() => void>();
  let areaBlockIndexOf: (point: Point) => number | undefined = () => undefined;
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
    areaBlockIndexOf: (point: Point) => areaBlockIndexOf(point),
    clearTarget() {
      publishTarget(null);
    },
    forgetTrigger() {
      if (!snapshot.lastTrigger) return;

      snapshot = { ...snapshot, lastTrigger: null };
      listeners.forEach((listener) => {
        listener();
      });
    },
    getBlockSnapshot(key: NodeKey) {
      return blockSnapshots.get(key) ?? EMPTY_BLOCK_SNAPSHOT;
    },
    getBlockTrigger(key: NodeKey) {
      return blockTriggers.get(key) ?? null;
    },
    isBlockTrigger(target: Element) {
      const trigger = target.closest<HTMLElement>(
        '[data-discussion-block-trigger]'
      );

      return Boolean(trigger && blockTriggerElements.has(trigger));
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

      snapshot = { ...snapshot, lastTrigger: blockKey };
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
      const previous = blockTriggers.get(key);
      if (previous) blockTriggerElements.delete(previous);
      if (element) {
        blockTriggers.set(key, element);
        blockTriggerElements.add(element);
      } else {
        blockTriggers.delete(key);
      }
    },
    syncIndex(
      index: CommentThreadIndex,
      getCreatedAt: (id: string) => Date | null
    ) {
      ({ areaBlockIndexOf } = index);
      const previousKeys = new Set(commentBlocks.keys());
      const nextBlocks = new Map<NodeKey, CommentItem[]>();
      const nextById = new Map<string, CommentItem>();

      index.threadBlocks.forEach((blockKeys, id) => {
        const createdAt = getCreatedAt(id);
        if (!createdAt) return;
        const item: CommentItem = {
          blockKeys,
          createdAt,
          id,
          kind: 'comment',
        };

        nextById.set(id, item);
        blockKeys.forEach((blockKey) => {
          const block = nextBlocks.get(blockKey);

          if (block) block.push(item);
          else nextBlocks.set(blockKey, [item]);
        });
      });
      commentsById = nextById;
      commentBlocks = nextBlocks;
      suggestionThreads = index.changeThreads;
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

const readAuthoredViewMode = (editor: RuntimeEditor) => {
  const authored = editor.plugin(AuthoredPlugin);
  const current = authored.installed ? authored.read.view() : null;

  if (!current) return null;

  return 'intent' in current ? current.intent : `preview:${current.preview}`;
};

const useDiscussionController = () => {
  const editor = useEditor();
  const threadIndex = useCommentThreadIndex();
  const [store] = React.useState(createDiscussionStore);

  React.useLayoutEffect(() => {
    const portal = editor.plugin(CommentsPlugin);
    const comments = portal.installed ? portal.api : null;

    store.syncIndex(threadIndex, (id) => {
      const thread = comments?.getThread(id);

      return thread ? new Date(thread.createdAt) : null;
    });
  }, [editor, store, threadIndex]);

  return store;
};

function DiscussionRoot({ children }: WrapRootProps) {
  const store = useDiscussionController();
  const suggestions = useEditorSelector(
    (current) => current.plugin(AuthoredReactPlugin).installed
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
  content: Extract<AuthoredGroupPart, { kind: 'content' }>['after']
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
  content: Extract<AuthoredGroupPart, { kind: 'content' }>['after']
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

const describeSuggestionPart = (part: AuthoredGroupPart): readonly string[] => {
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
            before || after
              ? `Replace ${before ? `“${before}”` : 'content'} with ${
                  after ? `“${after}”` : 'content'
                }`
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

const describeSuggestion = (details: AuthoredGroupDetails | null) => {
  const descriptions = (details?.parts ?? []).flatMap(describeSuggestionPart);

  if (descriptions.length > 0) return descriptions;

  return [
    {
      delete: 'Delete content',
      format: 'Change formatting',
      insert: 'Add content',
      mixed: 'Edit content',
      structure: 'Change structure',
    }[details?.changes[0]?.kind ?? 'mixed'],
  ];
};

const sameLines = (left: readonly string[], right: readonly string[]) =>
  left.length === right.length &&
  left.every((line, index) => line === right[index]);

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
  const readOnly = useEditorSelector(
    (current) => current.read.view.isReadOnly(),
    { dependsOn: 'readOnly' }
  );
  const user = useUser(group.authorId);
  const groupKey = `${group.id}:${group.revision}`;
  const [outcomeState, setOutcomeState] = React.useState<{
    groupKey: string;
    result: AuthoredResult | { status: 'locked' };
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
  const readLines = React.useCallback(
    (current: RuntimeEditor) => {
      const { read } = current.plugin(AuthoredPlugin);
      const details = read.groupDetails(group.id, { limit: shown });

      return (
        describeTableSuggestionGroup(current, group.id, {
          limit: shown,
        }) ?? describeSuggestion(details)
      );
    },
    [group.id, shown]
  );
  const descriptions = useEditorSelector(readLines, {
    equalityFn: sameLines,
    dependsOn: 'document',
  });
  const setOutcome = (result: AuthoredResult | { status: 'locked' }) =>
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

    if (!result) {
      setOutcome({ status: 'locked' });
      return;
    }

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
      case 'locked': {
        return 'This suggestion is inside a locked block. Unlock the block to accept or reject it.';
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
        <span className="editor-suggestion-actions pointer-events-none absolute end-0 top-0 flex gap-2 opacity-0 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100">
          <Button
            aria-label="Accept suggestion"
            className="size-6 p-1 text-muted-foreground"
            disabled={readOnly}
            onClick={() => decide('accept')}
            variant="ghost"
          >
            <CheckIcon className="size-4" />
          </Button>
          <Button
            aria-label="Reject suggestion"
            className="size-6 p-1 text-muted-foreground"
            disabled={readOnly}
            onClick={() => decide('reject')}
            variant="ghost"
          >
            <XIcon className="size-4" />
          </Button>
        </span>
      </header>

      <div className="relative mt-1 mb-4 flex flex-col gap-2 ps-[32px] text-sm">
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
                  disabled={readOnly}
                  onClick={() => decide('accept', relatedIds)}
                  size="sm"
                  variant="outline"
                >
                  Accept related
                </Button>
                <Button
                  disabled={readOnly}
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
  focusEditor,
  pendingRoot,
}: {
  autoFocus: boolean;
  focusEditor: () => void;
  pendingRoot: NamedRootKey | undefined;
}) {
  const editor = useEditor();
  const viewRoot = useEditorSelector((current) => current.read.view.root(), {
    dependsOn: 'readOnly',
  });
  const submitEditor = React.useMemo(
    () =>
      pendingRoot === viewRoot
        ? editor
        : createEditorView(editor, { root: pendingRoot }),
    [editor, pendingRoot, viewRoot]
  );
  const { api: comments } = submitEditor.plugin(CommentsPlugin);

  return (
    <CommentComposer
      ariaLabel="New comment"
      autoFocus={autoFocus}
      onCancel={() => {
        comments.cancel();
        focusEditor();
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
    <SuggestionDiscussionBlock blockKey={blockKey}>
      {children}
    </SuggestionDiscussionBlock>
  ) : (
    <DiscussionBlockContent blockKey={blockKey} cards={0} threads={0}>
      {children}
    </DiscussionBlockContent>
  );
}

function SuggestionDiscussionBlock({
  blockKey,
  children,
}: React.PropsWithChildren<{ blockKey: NodeKey }>) {
  const editor = useEditor();
  const store = useDiscussionStore();
  const cards = useAuthoredGroups(blockKey);
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
        cards.length > 0 ? blockThreadCount(editor, threads, blockKey) : 0
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
  const icon =
    hasComments && cards > 0 ? (
      <MessagesSquareIcon aria-hidden="true" className="size-4 shrink-0" />
    ) : cards > 0 ? (
      <PencilLineIcon aria-hidden="true" className="size-4 shrink-0" />
    ) : (
      <MessageSquareTextIcon aria-hidden="true" className="size-4 shrink-0" />
    );
  const itemLabel = totalCount === 1 ? 'item' : 'items';

  return (
    <div className="flex w-full justify-between">
      <div className="w-full min-w-0">{children}</div>
      <div
        className="relative start-0 size-0 select-none"
        contentEditable={false}
      >
        {totalCount > 0 && (
          <Button
            aria-expanded={isActive}
            aria-label={`${isActive ? 'Close' : 'Open'} ${
              totalCount
            } discussion ${itemLabel} for this block`}
            className="ms-1 mt-1 flex h-6 gap-1 !px-1.5 py-0 text-muted-foreground/80 hover:text-muted-foreground/80 data-[active=true]:bg-muted"
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
            {icon}
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
  const model = useModelEditor();
  const { isPrimaryForRoot, nestedView } = useEditorRootAreas(editor);
  const viewRoot = useEditorSelector((current) => current.read.view.root(), {
    dependsOn: 'readOnly',
  });
  const presentationView = React.useMemo(
    () =>
      viewRoot === undefined
        ? editor
        : createEditorView(editor, { readOnly: true }),
    [editor, viewRoot]
  );
  const rootElement = useEditorRootElement(editor);
  const store = useDiscussionStore();
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const { api: comments } = presentationView.plugin(CommentsPlugin);
  const rawPending = usePendingComment();
  // React focus events bubble out of portals, so a menu opened from the
  // popover counts as a control inside it.
  const focusedControlRef = React.useRef<EventTarget | null>(null);
  // Safari focuses the popover itself, not a pressed button, so a press holds
  // the popover until the pointer is released.
  const pressingRef = React.useRef(false);
  const releasedPendingRef = React.useRef<typeof rawPending>(null);
  const rawActiveCommentIds = useActiveCommentIds();
  const activeCommentIds = isPrimaryForRoot ? rawActiveCommentIds : [];
  const activeOrder = new Map(activeCommentIds.map((id, index) => [id, index]));
  const suggestions = React.useContext(SuggestionsInstalledContext);
  const targetKey = snapshot.target?.blockKey ?? null;
  const threads = React.useSyncExternalStore(
    store.subscribeThreads,
    store.getThreads,
    store.getThreads
  );
  // An edit before a change can move its range and keep its revision, so the
  // anchor reads each range through its own selector.
  const commentAnchor = useEditorSelector(
    (current) => {
      if (!isPrimaryForRoot) return null;

      const authored = current.plugin(AuthoredPlugin);

      for (const id of activeCommentIds) {
        const attachment = comments.attachment(id);
        if (attachment?.type === 'range' && attachment.status === 'attached') {
          if (
            store.areaBlockIndexOf(RangeApi.start(attachment.range)) !==
            undefined
          ) {
            return { changeId: null, range: attachment.range };
          }
          continue;
        }
        if (attachment?.type === 'change' && authored.installed) {
          const range = authored.read.change(attachment.id)?.ranges[0];

          if (
            range &&
            store.areaBlockIndexOf(RangeApi.start(range)) !== undefined
          ) {
            return { changeId: attachment.id, range };
          }
        }
      }
      return null;
    },
    { equalityFn: sameCommentAnchor }
  );
  const changeId = commentAnchor?.changeId ?? null;
  // Open cards read their summaries after each commit, so the revision a
  // decision sends stays current when another block changes the card. A
  // thread opened alone, such as from a list, opens its change's card.
  const activeGroups = useEditorSelector(
    (current) => {
      if (!isPrimaryForRoot || !suggestions) return NO_GROUPS;

      const { read } = current.plugin(AuthoredPlugin);
      const activeGroup = activeSuggestionId
        ? read.groupOf(activeSuggestionId)
        : null;

      if (activeGroup) {
        const range = read.changes({
          group: activeGroup.id,
          limit: 1,
        }).items[0]?.ranges[0];

        if (
          !range ||
          store.areaBlockIndexOf(RangeApi.start(range)) !== undefined
        ) {
          return [activeGroup];
        }
      }

      const commentGroup = changeId ? read.groupOf(changeId) : null;

      return commentGroup ? [commentGroup] : NO_GROUPS;
    },
    { equalityFn: sameGroups }
  );
  const activeGroupId = activeGroups[0]?.id;
  const activeSuggestionRange = useEditorSelector(
    (current) =>
      activeGroupId
        ? (current.plugin(AuthoredPlugin).read.changes({
            group: activeGroupId,
            limit: 1,
          }).items[0]?.ranges[0] ?? null)
        : null,
    { equalityFn: RangeApi.equals }
  );
  const targetGroups = useEditorSelector(
    (current) =>
      suggestions && targetKey
        ? current.plugin(AuthoredPlugin).read.groups({ at: targetKey })
        : NO_GROUPS,
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
  const pendingRange = useEditorSelector(
    () => {
      if (!rawPending || !isPrimaryForRoot) return null;

      const range = comments.pendingRange();

      return range &&
        store.areaBlockIndexOf(RangeApi.start(range)) !== undefined
        ? range
        : null;
    },
    {
      dependsOn: 'document',
      equalityFn: RangeApi.equals,
    }
  );
  const pending = pendingRange ? rawPending : null;
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
  const view = useEditorSelector(readAuthoredViewMode, {
    dependsOn: 'authored',
  });
  const preview = view?.startsWith('preview:') ?? false;
  // A suggestion's ranges are places of the stored document, so a preview
  // anchors on the block whose trigger was pressed last, and only while that
  // block shows the open card.
  const previewHidesRange =
    preview &&
    !pendingRange &&
    (commentAnchor
      ? commentAnchor.changeId !== null
      : Boolean(activeSuggestionRange));
  const shownTrigger = useEditorSelector((current) => {
    const key = snapshot.lastTrigger;

    if (!previewHidesRange || !key) return null;

    const { read } = current.plugin(AuthoredPlugin);
    const openId = changeId ? read.groupOf(changeId)?.id : activeGroupId;

    return read.groups({ at: key }).some(({ id }) => id === openId)
      ? key
      : null;
  });

  // Editing and Proposed can give a block one key, and a pressed block
  // belongs to the view it was pressed in.
  React.useLayoutEffect(() => {
    store.forgetTrigger();
  }, [store, view]);

  const anchorRange = previewHidesRange
    ? null
    : (pendingRange ?? commentAnchor?.range ?? activeSuggestionRange ?? null);
  const focusEditor = () => {
    const selection = model.read.selection();
    const root = selection ? RangeApi.start(selection).root : undefined;

    if (!selection || root === editor.read.view.root()) {
      editableRef.current?.focus();
    } else {
      (
        (root ? nestedView(root) : null) ?? createEditorView(editor, { root })
      ).api.dom.focus();
    }
  };
  const anchorRangeKey = useEditorSelector((current) => {
    if (!anchorRange) return null;

    const index = store.areaBlockIndexOf(RangeApi.start(anchorRange));

    return index === undefined ? null : current.key([index]);
  });
  const anchorBlockKey = previewHidesRange ? shownTrigger : anchorRangeKey;
  const targetElement = target?.anchor ?? null;
  const measureAnchor = React.useMemo(() => {
    if (targetElement) return () => [targetElement.getBoundingClientRect()];

    const range = anchorRange;

    if (!range) {
      if (!anchorBlockKey) return null;

      return () => {
        const block = editor.api.dom.resolveDOMNode(anchorBlockKey);

        return block ? [block.getBoundingClientRect()] : [];
      };
    }

    const { root } = RangeApi.start(range);
    const fallbackView =
      root === viewRoot
        ? editor
        : createEditorView(editor, { readOnly: true, root });

    return () => {
      const rangeView =
        root === viewRoot
          ? editor
          : ((root ? nestedView(root) : null) ?? fallbackView);
      const domRange = rangeView.api.dom.resolveDOMRange(range);
      const lines = domRange
        ? Array.from(domRange.getClientRects()).filter(
            ({ height, width }) => height > 0 || width > 0
          )
        : [];

      if (lines.length > 0) return lines.reverse();

      const rangeRect = domRange?.getBoundingClientRect();

      if (rangeRect && (rangeRect.height > 0 || rangeRect.width > 0)) {
        return [rangeRect];
      }

      const trigger = anchorBlockKey
        ? store.getBlockTrigger(anchorBlockKey)
        : null;

      if (trigger) return [trigger.getBoundingClientRect()];

      return rangeRect ? [rangeRect] : [];
    };
  }, [
    anchorBlockKey,
    anchorRange,
    editor,
    nestedView,
    store,
    targetElement,
    viewRoot,
  ]);
  const { anchor: anchorElement, hidden } = useVisibleAnchor({
    editableRef,
    keepShown: () =>
      pressingRef.current ||
      focusedControlRef.current ===
        editableRef.current?.ownerDocument.activeElement ||
      (Boolean(pending) && releasedPendingRef.current !== pending),
    measure: measureAnchor,
  });
  const open = Boolean(
    anchorElement &&
    (pending || activeItems.length > 0 || targetItems.length > 0)
  );
  const openRef = React.useRef(open);
  const [placedPending, setPlacedPending] =
    React.useState<typeof pending>(null);
  const [composerMount, setComposerMount] = React.useState({
    count: 0,
    pending,
  });

  if (pending && composerMount.pending !== pending) {
    setComposerMount({ count: composerMount.count + 1, pending });
  }

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

  React.useEffect(() => {
    store.setPrepareSelection(() => {
      if (pending) comments.cancel();
      if (activeItems.length > 0) comments.setActive([]);
      setActiveSuggestionId?.(null);
    });

    return () => store.setPrepareSelection(null);
  }, [activeItems.length, comments, pending, setActiveSuggestionId, store]);

  const editorDecidesOpen = !pending && activeItems.length > 0;
  const isBlockTrigger = React.useCallback(
    (element: Element) => store.isBlockTrigger(element),
    [store]
  );

  return (
    <div data-discussion-root="">
      <FloatingPopover
        insideElement={editorDecidesOpen ? rootElement : null}
        isInside={isBlockTrigger}
        modal={false}
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) return;
          const { draftThreadIds } = comments.getSnapshot();
          if (
            activeItems.some(
              (item) =>
                item.kind === 'comment' && draftThreadIds.includes(item.id)
            )
          ) {
            return;
          }

          store.clearTarget();
          if (pending) comments.cancel();
          if (activeItems.length > 0) {
            comments.setActive([]);
          }
          setActiveSuggestionId?.(null);
        }}
      >
        {anchorElement && <FloatingPopoverAnchor element={anchorElement} />}
        <FloatingPopoverContent
          align="center"
          anchorHidden={hidden}
          key={composerMount.count}
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
              focusEditor();
            }
          }}
          onFocus={(event) => {
            const onControl = event.target !== event.currentTarget;

            focusedControlRef.current = onControl ? event.target : null;
            if (onControl && pending) releasedPendingRef.current = pending;
          }}
          onInitialFocus={(event) => event.preventDefault()}
          onPointerDown={(event) => {
            const release = new AbortController();
            const end = () => {
              pressingRef.current = false;
              release.abort();
            };

            pressingRef.current = true;
            for (const type of ['pointerup', 'pointercancel']) {
              event.currentTarget.ownerDocument.addEventListener(type, end, {
                capture: true,
                signal: release.signal,
              });
            }
          }}
          onPlaced={() => {
            if (pending) setPlacedPending(pending);
          }}
          side="bottom"
        >
          {pending ? (
            <div className="p-4">
              <NewComment
                autoFocus={placedPending === pending}
                focusEditor={focusEditor}
                pendingRoot={
                  pendingRange ? RangeApi.start(pendingRange).root : undefined
                }
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

function SuggestionDiscussion({
  editableRef,
  snapshot,
}: EditableSiblingProps & { snapshot: DiscussionSnapshot }) {
  const { activeId, setActiveId } = useActiveAuthored();

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
