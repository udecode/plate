'use client';

import {
  CheckIcon,
  MessageSquareTextIcon,
  MessagesSquareIcon,
  PencilLineIcon,
  XIcon,
} from 'lucide-react';
import {
  type NodeKey,
  type Path,
  PathApi,
  PointApi,
  type Range,
  RangeApi,
} from 'platejs';
import type {
  AuthoredChange,
  AuthoredChangeDetails,
  AuthoredChangePart,
  AuthoredResult,
} from 'platejs/authored';
import { DefaultAuthoredPlugin } from 'platejs/authored';
import { CommentsPlugin } from 'platejs/comments/react';
import {
  type EditableSiblingProps,
  type Editor,
  type RenderNodeWrapperDescriptor,
  type RenderNodeWrapperProps,
  useEditor,
  useEditorSelector,
  usePluginStore,
} from 'platejs/react';
import {
  SuggestionPlugin,
  useActiveSuggestion,
  useSuggestionChanges,
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

type DiscussionItem =
  | Readonly<{
      blockIndices: readonly number[];
      createdAt: Date;
      id: string;
      kind: 'comment';
    }>
  | Readonly<{
      change: AuthoredChange;
      createdAt: Date;
      id: string;
      kind: 'suggestion';
      range: Range | null;
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
  revision: number;
  target: DiscussionTarget | null;
}>;

const EMPTY_BLOCK_SNAPSHOT: DiscussionBlockSnapshot = Object.freeze({
  active: false,
  hasComments: false,
  hasSuggestions: false,
  totalCount: 0,
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

const sameSuggestionChanges = (
  left: readonly AuthoredChange[] | undefined,
  right: readonly AuthoredChange[]
) =>
  left?.length === right.length &&
  left.every((change, index) => {
    const current = right[index];

    return (
      current?.id === change.id &&
      current.revision === change.revision &&
      current.status === change.status
    );
  });

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
  const blockSnapshots = new Map<NodeKey, DiscussionBlockSnapshot>();
  let commentBlocks = new Map<
    NodeKey,
    Readonly<{
      blockIndex: number;
      items: ReadonlyArray<Extract<DiscussionItem, { kind: 'comment' }>>;
    }>
  >();
  let commentsById = new Map<
    string,
    Extract<DiscussionItem, { kind: 'comment' }>
  >();
  let notifyQueued = false;
  let prepareSelection: (() => void) | null = null;
  const suggestionBlocks = new Map<
    NodeKey,
    Readonly<{
      blockIndex: number;
      changes: readonly AuthoredChange[];
    }>
  >();
  const suggestionLocations = new Map<string, Map<NodeKey, AuthoredChange>>();
  let suggestionThreads = new Map<string, readonly string[]>();
  let snapshot = EMPTY_DISCUSSION_SNAPSHOT;

  const notifyBlocks = (keys: ReadonlySet<NodeKey>) => {
    keys.forEach((key) => {
      blockListeners.get(key)?.forEach((listener) => listener());
    });
  };
  const notify = () => {
    if (notifyQueued) return;
    notifyQueued = true;
    queueMicrotask(() => {
      notifyQueued = false;
      listeners.forEach((listener) => listener());
    });
  };
  const getGroup = (blockKey: NodeKey): DiscussionGroup | undefined => {
    const comments = commentBlocks.get(blockKey);
    const suggestions = suggestionBlocks.get(blockKey);
    const items: DiscussionItem[] = [
      ...(comments?.items ?? []),
      ...(suggestions?.changes.map((change): DiscussionItem => ({
        change,
        createdAt: new Date(change.createdAt),
        id: change.id,
        kind: 'suggestion',
        range: change.ranges[0] ?? null,
        threadIds: suggestionThreads.get(change.id) ?? [],
      })) ?? []),
    ];

    if (items.length === 0) return undefined;

    return {
      blockIndex: suggestions?.blockIndex ?? comments?.blockIndex ?? 0,
      blockKey,
      items: sortDiscussionItems(items),
    };
  };
  const readBlockSnapshot = (blockKey: NodeKey): DiscussionBlockSnapshot => {
    const group = getGroup(blockKey);
    if (!group) return EMPTY_BLOCK_SNAPSHOT;

    return {
      active: snapshot.target?.blockKey === blockKey,
      hasComments: group.items.some(
        (item) =>
          item.kind === 'comment' ||
          (item.kind === 'suggestion' && item.threadIds.length > 0)
      ),
      hasSuggestions: group.items.some(({ kind }) => kind === 'suggestion'),
      totalCount: group.items.reduce(
        (count, item) =>
          count + 1 + (item.kind === 'suggestion' ? item.threadIds.length : 0),
        0
      ),
    };
  };
  const publishBlocks = (keys: ReadonlySet<NodeKey>) => {
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
    snapshot = {
      revision: snapshot.revision + 1,
      target:
        snapshot.target && !getGroup(snapshot.target.blockKey)
          ? null
          : snapshot.target,
    };
    notify();
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
    getComment(id: string) {
      return commentsById.get(id) ?? null;
    },
    getGroup,
    getSnapshot: () => snapshot,
    getSuggestion(id: string) {
      const location = suggestionLocations.get(id)?.values().next().value;

      return location
        ? ({
            change: location,
            createdAt: new Date(location.createdAt),
            id: location.id,
            kind: 'suggestion',
            range: location.ranges[0] ?? null,
            threadIds: suggestionThreads.get(location.id) ?? [],
          } satisfies Extract<DiscussionItem, { kind: 'suggestion' }>)
        : null;
    },
    selectBlock(blockKey: NodeKey, anchor: HTMLElement) {
      if (!getGroup(blockKey) || !prepareSelection) return;

      prepareSelection();

      publishTarget(
        snapshot.target?.blockKey === blockKey ? null : { anchor, blockKey }
      );
    },
    removeBlock(blockKey: NodeKey) {
      const previous = suggestionBlocks.get(blockKey);
      if (!previous) return;
      suggestionBlocks.delete(blockKey);
      previous.changes.forEach((change) => {
        const locations = suggestionLocations.get(change.id);
        locations?.delete(blockKey);
        if (locations?.size === 0) suggestionLocations.delete(change.id);
      });
      publishBlocks(new Set([blockKey]));
    },
    setBlockSuggestions(
      blockKey: NodeKey,
      blockIndex: number,
      changes: readonly AuthoredChange[]
    ) {
      const previous = suggestionBlocks.get(blockKey);
      if (
        previous?.blockIndex === blockIndex &&
        sameSuggestionChanges(previous.changes, changes)
      ) {
        return;
      }
      previous?.changes.forEach((change) => {
        const locations = suggestionLocations.get(change.id);
        locations?.delete(blockKey);
        if (locations?.size === 0) suggestionLocations.delete(change.id);
      });
      suggestionBlocks.set(blockKey, { blockIndex, changes });
      changes.forEach((change) => {
        const locations =
          suggestionLocations.get(change.id) ??
          new Map<NodeKey, AuthoredChange>();

        locations.set(blockKey, change);
        suggestionLocations.set(change.id, locations);
      });
      publishBlocks(new Set([blockKey]));
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
    update(
      currentEditor: Editor,
      items: ReadonlyArray<Extract<DiscussionItem, { kind: 'comment' }>>,
      threads: ReadonlyMap<string, readonly string[]>
    ) {
      const previousKeys = new Set(commentBlocks.keys());
      const nextBlocks = new Map<
        NodeKey,
        {
          blockIndex: number;
          items: Array<Extract<DiscussionItem, { kind: 'comment' }>>;
        }
      >();
      commentsById = new Map(items.map((item) => [item.id, item]));
      items.forEach((item) => {
        item.blockIndices.forEach((blockIndex) => {
          const blockKey = currentEditor.key([blockIndex]);
          if (!blockKey) return;
          const block = nextBlocks.get(blockKey);

          if (block) block.items.push(item);
          else nextBlocks.set(blockKey, { blockIndex, items: [item] });
        });
      });
      commentBlocks = nextBlocks;
      suggestionThreads = new Map(threads);
      publishBlocks(
        new Set([
          ...previousKeys,
          ...commentBlocks.keys(),
          ...suggestionBlocks.keys(),
        ])
      );
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
  const { api: comments } = useEditor().plugin(CommentsPlugin);
  const visibleThreadIds = useVisibleCommentThreadIds();
  const [store] = React.useState(createDiscussionStore);
  React.useEffect(() => {
    const { api } = editor.plugin(CommentsPlugin);
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
    const publish = () => {
      const suggestionThreads = new Map<string, string[]>();
      const commentItems: Array<Extract<DiscussionItem, { kind: 'comment' }>> =
        [];
      const visible = new Set(visibleThreadIds);

      comments.getThreads().forEach((thread) => {
        if (thread.resolved) return;
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
    const unsubscribe = api.subscribe(publish);

    publish();
    return unsubscribe;
  }, [comments, editor, store, visibleThreadIds]);

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
    <SuggestionDiscussionCard
      change={item.change}
      createdAt={item.createdAt}
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

  return content.content.content.map(readContentText).join('\n');
};

const textPreview = (text: string) => {
  const preview = text.trim();

  return preview.length > 80 ? `${preview.slice(0, 77)}…` : preview;
};

const contentPreview = (
  content: Extract<AuthoredChangePart, { kind: 'content' }>['after']
) => textPreview(contentText(content));

const insertionPartsAreAdjacent = (
  editor: Editor,
  left: Extract<AuthoredChangePart, { kind: 'content' }>,
  right: Extract<AuthoredChangePart, { kind: 'content' }>
) => {
  if (left.action !== 'insert' || right.action !== 'insert') return false;
  const leftLocation = left.after?.location;
  const rightLocation = right.after?.location;

  if (
    left.after?.root !== right.after?.root ||
    leftLocation?.kind !== 'range' ||
    rightLocation?.kind !== 'range'
  ) {
    return false;
  }

  const [, leftEnd] = RangeApi.edges(leftLocation.range);
  const [rightStart] = RangeApi.edges(rightLocation.range);
  const afterLeft = editor.read.points.after(leftEnd);

  return (
    PointApi.equals(leftEnd, rightStart) ||
    (!PathApi.equals(leftEnd.path, rightStart.path) &&
      !!afterLeft &&
      PointApi.equals(afterLeft, rightStart))
  );
};

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
  switch (part.kind) {
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

      switch (part.action) {
        case 'delete': {
          return [before ? `Delete “${before}”` : 'Delete content'];
        }
        case 'insert': {
          return [after ? `Add “${after}”` : 'Add content'];
        }
        case 'move': {
          return [before ? `Move “${before}”` : 'Move content'];
        }
        case 'replace': {
          return [
            before && after
              ? `Replace “${before}” with “${after}”`
              : 'Replace content',
          ];
        }
      }

      return [];
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
    case 'root': {
      return [
        `${part.after ? 'Add' : 'Delete'} ${
          part.root === 'main' ? 'document content' : part.root
        }`,
      ];
    }
  }

  return [];
};

const describeSuggestion = (
  editor: Editor,
  details: AuthoredChangeDetails | null,
  fallback: AuthoredChange['kind']
) => {
  if (details?.parts.status === 'available') {
    const descriptions: string[] = [];

    for (let index = 0; index < details.parts.items.length; index++) {
      const part = details.parts.items[index];

      if (part.kind !== 'content' || part.action !== 'insert') {
        descriptions.push(...describeSuggestionPart(part));
        continue;
      }

      let text = contentText(part.after);
      let current = part;
      while (index + 1 < details.parts.items.length) {
        const next = details.parts.items[index + 1];
        if (
          next.kind !== 'content' ||
          !insertionPartsAreAdjacent(editor, current, next)
        ) {
          break;
        }
        text += contentText(next.after);
        current = next;
        index += 1;
      }
      const preview = textPreview(text);
      descriptions.push(preview ? `Add “${preview}”` : 'Add content');
    }

    if (descriptions.length > 0) return descriptions;
  }

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
  change,
  createdAt,
  threadIds,
}: {
  change: AuthoredChange;
  createdAt: Date;
  threadIds: readonly string[];
}) {
  const editor = useEditor();
  const { api: comments } = useEditor().plugin(CommentsPlugin);
  const user = useCommentUser(change.authorId);
  const changeKey = `${change.id}:${change.revision}`;
  const [outcomeState, setOutcomeState] = React.useState<{
    changeKey: string;
    result: AuthoredResult;
  } | null>(null);
  const outcome =
    outcomeState?.changeKey === changeKey ? outcomeState.result : null;
  const details = useEditorSelector(
    (current) =>
      current.plugin(DefaultAuthoredPlugin).read.details(change.id) ?? null,
    {
      shouldUpdate: (commit) =>
        !commit ||
        commit.changed.hasAny('document') ||
        commit.changed.hasAny('state'),
    }
  );
  const descriptions = describeSuggestion(editor, details ?? null, change.kind);
  const setOutcome = (result: AuthoredResult) =>
    setOutcomeState({ changeKey, result });

  const decide = (
    action: 'accept' | 'reject',
    related: readonly string[] = []
  ) => {
    const authored = editor.plugin(DefaultAuthoredPlugin);
    const latest = authored.read.change(change.id);
    if (!latest) {
      setOutcome({ status: 'stale', ids: [change.id] });
      return;
    }
    const ids = [...new Set([latest.id, ...related])];
    const input = {
      action,
      selection: authored.read.select({ ids }),
    };
    const result =
      latest.status === 'conflicted'
        ? authored.update.resolve(input)
        : authored.update.decide(input);

    if (result.status === 'applied' || result.status === 'unchanged') return;
    setOutcome(result);
  };
  const relatedIds =
    outcome?.status === 'blocked'
      ? [...outcome.dependencies, ...outcome.dependants, ...outcome.conflicts]
      : [];
  const outcomeMessage = (() => {
    if (!outcome) return null;
    switch (outcome.status) {
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
        return 'This suggestion no longer belongs to the current document.';
      }
      case 'stale': {
        return 'This suggestion changed. Review it again before deciding.';
      }
      case 'unavailable': {
        return 'The retained content needed for this action is unavailable.';
      }
    }

    return null;
  })();

  return (
    <article
      className="relative flex flex-col focus-within:[&>header>.editor-suggestion-actions]:pointer-events-auto focus-within:[&>header>.editor-suggestion-actions]:opacity-100 hover:[&>header>.editor-suggestion-actions]:pointer-events-auto hover:[&>header>.editor-suggestion-actions]:opacity-100"
      data-suggestion-review={change.id}
    >
      <header className="relative flex items-center">
        <Avatar className="size-5">
          <AvatarImage alt={user?.name} src={user?.avatarUrl} />
          <AvatarFallback>{user?.name?.[0] ?? '?'}</AvatarFallback>
        </Avatar>
        <span className="mx-2 text-sm leading-none font-semibold">
          {user?.name ?? change.authorId}
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
        <CommentThreadCard id={id} key={id} />
      ))}

      <CommentComposer
        ariaLabel="Comment on suggestion"
        onSubmit={(body) =>
          comments.createThread({
            body,
            excerpt: `${change.kind} suggestion`,
            target: { id: change.id, type: 'change' },
          })
        }
        placeholder="Reply..."
      />
    </article>
  );
}

function NewComment({ editableRef }: EditableSiblingProps) {
  const editor = useEditor();
  const { api: comments } = useEditor().plugin(CommentsPlugin);

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
  renderPath,
}: RenderNodeWrapperProps<typeof CommentsPlugin>) {
  const blockKey = editor.key(renderPath);

  if (!blockKey) return children;

  const props = {
    blockIndex: renderPath[0] ?? 0,
    blockKey,
    children,
  };

  if (editor.plugin(SuggestionPlugin).installed) {
    return <SuggestionDiscussionBlockContent {...props} path={renderPath} />;
  }

  return <DiscussionBlockContent {...props} changes={[]} />;
}

function SuggestionDiscussionBlockContent({
  path,
  ...props
}: React.PropsWithChildren<{
  blockIndex: number;
  blockKey: NodeKey;
  path: Path;
}>) {
  const changes = useSuggestionChanges(path);

  return <DiscussionBlockContent {...props} changes={changes} />;
}

function DiscussionBlockContent({
  blockIndex,
  blockKey,
  changes,
  children,
}: React.PropsWithChildren<{
  blockIndex: number;
  blockKey: NodeKey;
  changes: readonly AuthoredChange[];
}>) {
  const store = useDiscussionStore();

  React.useEffect(() => {
    store.setBlockSuggestions(blockKey, blockIndex, changes);

    return () => store.removeBlock(blockKey);
  }, [blockIndex, blockKey, changes, store]);
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
            aria-label={`${isActive ? 'Close' : 'Open'} ${
              block.totalCount
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
  const store = useDiscussionStore();
  const { api: comments } = useEditor().plugin(CommentsPlugin);
  const pending = usePendingComment();
  const activeCommentIds = usePluginStore(CommentsPlugin, 'activeIds');
  const activeOrder = new Map(activeCommentIds.map((id, index) => [id, index]));
  const activeItems: DiscussionItem[] = [
    ...activeCommentIds.flatMap((id) => {
      const item = store.getComment(id);

      return item ? [item] : [];
    }),
    ...(activeSuggestionId
      ? (() => {
          const item = store.getSuggestion(activeSuggestionId);

          return item ? [item] : [];
        })()
      : []),
  ].toSorted(
    (left, right) =>
      (activeOrder.get(left.id) ?? activeCommentIds.length) -
      (activeOrder.get(right.id) ?? activeCommentIds.length)
  );
  const targetGroup = snapshot.target
    ? store.getGroup(snapshot.target.blockKey)
    : undefined;
  const target = !pending && activeItems.length === 0 ? snapshot.target : null;
  const targetKey = snapshot.target?.blockKey ?? null;
  const [pagination, setPagination] = React.useState<{
    count: number;
    targetKey: NodeKey | null;
  }>({ count: DISCUSSION_PAGE_SIZE, targetKey });
  const visibleCount =
    pagination.targetKey === targetKey
      ? pagination.count
      : DISCUSSION_PAGE_SIZE;
  const targetItems = targetGroup?.items ?? [];
  const shownItems =
    activeItems.length > 0 ? activeItems : targetItems.slice(0, visibleCount);
  const activeSuggestionRange = activeItems.find(
    (item): item is Extract<DiscussionItem, { kind: 'suggestion' }> =>
      item.kind === 'suggestion'
  )?.range;
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
            <>
              {shownItems.map((item, index) => (
                <React.Fragment key={`${item.kind}-${item.id}`}>
                  <div className="p-4">
                    <DiscussionCard item={item} />
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
  const suggestionsInstalled = useEditorSelector(
    (editor) => editor.plugin(SuggestionPlugin).installed
  );

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
