'use client';

import { MessageSquareTextIcon, MessagesSquareIcon } from 'lucide-react';
import type { Range } from 'platejs';
import { DefaultAuthoredPlugin, type AuthoredChange } from 'platejs/authored';
import { CommentsPlugin } from 'platejs/comments/react';
import {
  type Editor,
  useEditor,
  useEditorHasSelection,
  useEditorReadOnly,
  useEditorSelector,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  CommentThreadCard,
  useCommentThread,
  usePendingComment,
} from '@/registry/components/editor/comment';
import { SuggestionDiscussionCard } from '@/registry/components/editor/discussion';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

const PAGE_SIZE = 20;
type CommentFilter = 'all' | 'open' | 'resolved';
type CommentTarget =
  | Readonly<{ range: Range; status: 'attached' }>
  | Readonly<{ status: 'unavailable' }>;

const readCommentTarget = (
  editor: Editor,
  id: string,
  suggestion = false
): CommentTarget => {
  if (suggestion) {
    const range = editor.plugin(DefaultAuthoredPlugin).read.change(id)
      ?.ranges[0];
    return range &&
      editor
        .plugin(DefaultAuthoredPlugin)
        .read.changesAt(range)
        .some((change) => change.id === id)
      ? { range, status: 'attached' }
      : { status: 'unavailable' };
  }
  const comments = editor.plugin(CommentsPlugin).api;
  const attachment = comments.attachment(id);
  if (attachment?.type === 'range') {
    return attachment.status === 'attached'
      ? { range: attachment.range, status: 'attached' }
      : { status: 'unavailable' };
  }
  if (attachment?.type === 'change') {
    const authored = editor.plugin(DefaultAuthoredPlugin);
    const range = authored.installed
      ? authored.read.change(attachment.id)?.ranges[0]
      : undefined;
    return range ? { range, status: 'attached' } : { status: 'unavailable' };
  }
  return { status: 'unavailable' };
};

export function CommentToolbarButton() {
  const editor = useEditor();
  const comments = editor.plugin(CommentsPlugin);
  const readOnly = useEditorReadOnly();
  const hasSelection = useEditorHasSelection();

  if (!comments.installed) return null;

  return (
    <ToolbarButton
      aria-label="Comment"
      disabled={readOnly || !hasSelection}
      onClick={() => comments.api.begin()}
      data-editor-prevent-overlay
      tooltip="Comment"
    >
      <MessageSquareTextIcon />
    </ToolbarButton>
  );
}

export function AllCommentsButton() {
  const editor = useEditor();
  const comments = editor.plugin(CommentsPlugin);

  if (!comments.installed) return null;

  return <AllCommentsButtonImpl editor={editor} />;
}

function AllCommentsButtonImpl({ editor }: { editor: Editor }) {
  const pending = usePendingComment();
  const [open, setOpen] = React.useState(false);
  const [blocked, setBlocked] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const navigating = React.useRef(false);
  const navigate = React.useCallback(
    (id: string, suggestion = false) => {
      const target = readCommentTarget(editor, id, suggestion);
      if (target.status === 'unavailable') {
        setMessage('Target unavailable in this view');
        return;
      }
      setMessage(null);
      navigating.current = !editor.read.view.isReadOnly();
      setOpen(false);
      requestAnimationFrame(() => {
        const current = readCommentTarget(editor, id, suggestion);
        if (current.status === 'unavailable') {
          setMessage('Target unavailable in this view');
          setOpen(true);
          return;
        }
        if (!editor.read.view.isReadOnly()) {
          editor.update.selection.set(current.range);
          editor.api.dom.focus();
        }
        editor.api.dom.scrollIntoView(current.range);
      });
    },
    [editor]
  );
  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen && blocked) return;
    setMessage(null);
    setOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <ToolbarButton
          aria-label="All comments"
          disabled={Boolean(pending)}
          data-editor-prevent-overlay
          tooltip={
            pending ? 'Finish or cancel your new comment' : 'All comments'
          }
        >
          <MessagesSquareIcon />
        </ToolbarButton>
      </DialogTrigger>
      {open && (
        <AllCommentsDialog
          message={message}
          onCloseAutoFocus={(event) => {
            if (navigating.current) event.preventDefault();
            navigating.current = false;
          }}
          onBlockedChange={setBlocked}
          onNavigate={navigate}
          onNavigateSuggestion={(id) => navigate(id, true)}
        />
      )}
    </Dialog>
  );
}

function AllCommentsDialog({
  message,
  onCloseAutoFocus,
  onBlockedChange,
  onNavigate,
  onNavigateSuggestion,
}: {
  message: string | null;
  onBlockedChange: (blocked: boolean) => void;
  onNavigate: (id: string) => void;
  onNavigateSuggestion: (id: string) => void;
  onCloseAutoFocus: React.ComponentProps<
    typeof DialogContent
  >['onCloseAutoFocus'];
}) {
  const editor = useEditor();
  const [blocked, setBlocked] = React.useState(false);
  const [tab, setTab] = React.useState('comments');
  const setInteraction = (next: boolean) => {
    setBlocked(next);
    onBlockedChange(next);
  };
  return (
    <DialogContent
      className="flex max-h-[min(760px,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      data-all-comments=""
      onCloseAutoFocus={onCloseAutoFocus}
    >
      <DialogHeader className="shrink-0 border-b p-5 pr-12">
        <DialogTitle>Comments and suggestions</DialogTitle>
        <DialogDescription>
          Review document conversations and original proposals.
        </DialogDescription>
      </DialogHeader>
      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (!blocked) setTab(value);
        }}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <TabsList className="mx-5 mt-3 shrink-0 self-start">
          <TabsTrigger value="comments" disabled={blocked}>
            Comments
          </TabsTrigger>
          {editor.plugin(DefaultAuthoredPlugin).installed && (
            <TabsTrigger value="suggestions" disabled={blocked}>
              Suggestions
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent
          value="comments"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <AllCommentsList
            message={message}
            onBlockedChange={setInteraction}
            onNavigate={onNavigate}
          />
        </TabsContent>
        <TabsContent
          value="suggestions"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <AllSuggestionsList
            onBlockedChange={setInteraction}
            onNavigate={onNavigateSuggestion}
          />
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}

function AllSuggestionsList({
  onBlockedChange,
  onNavigate,
}: {
  onBlockedChange: (blocked: boolean) => void;
  onNavigate: (id: string) => void;
}) {
  const editor = useEditor();
  const authored = editor.plugin(DefaultAuthoredPlugin);
  const comments = editor.plugin(CommentsPlugin).api;
  const version = useEditorSelector(
    (current) => current.read.runtime.snapshot().version
  );
  const [pagination, setPagination] = React.useState<{
    version: number;
    cursors: string[];
  }>({ version, cursors: [] });
  const cursors = pagination.version === version ? pagination.cursors : [];
  const page = authored.read.changes({
    proposals: true,
    limit: PAGE_SIZE,
    cursor: cursors.at(-1),
  });
  const blockedIds = React.useRef(new Set<string>());
  const [heldChanges, setHeldChanges] = React.useState<
    readonly AuthoredChange[] | null
  >(null);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [, refreshThreads] = React.useReducer((value: number) => value + 1, 0);
  React.useEffect(() => comments.subscribeThreads(refreshThreads), [comments]);
  const threads = new Map<string, string[]>();
  for (const thread of comments.getThreads()) {
    if (thread.status !== 'published' || thread.target.type !== 'change') {
      continue;
    }
    const ids = threads.get(thread.target.id) ?? [];
    ids.push(thread.id);
    threads.set(thread.target.id, ids);
  }
  const blocked = heldChanges !== null;
  const changes = heldChanges ?? page.items;
  const setRowBlocked = (id: string, next: boolean) => {
    const wasBlocked = blockedIds.current.size > 0;
    if (next) blockedIds.current.add(id);
    else blockedIds.current.delete(id);
    const active = blockedIds.current.size > 0;
    if (!wasBlocked && active) setHeldChanges(page.items);
    if (wasBlocked && !active) setHeldChanges(null);
    onBlockedChange(active);
  };
  return (
    <>
      <div className="flex min-h-32 flex-col gap-4 overflow-y-auto p-5">
        {changes.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No suggestions yet
          </p>
        )}
        {changes.map((savedChange) => {
          const change = authored.read.change(savedChange.id) ?? savedChange;
          return (
            <section
              key={change.id}
              className="rounded-lg border p-4"
              data-all-suggestions-row={change.id}
            >
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-w-0 justify-start"
                  disabled={blocked}
                  aria-expanded={expanded === change.id}
                  onClick={() =>
                    setExpanded(expanded === change.id ? null : change.id)
                  }
                >
                  <span className="truncate">
                    {change.authorId} · {change.kind} · {change.status}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    blocked ||
                    readCommentTarget(editor, change.id, true).status ===
                      'unavailable'
                  }
                  onClick={() => onNavigate(change.id)}
                >
                  Show in document
                </Button>
              </div>
              {expanded === change.id && (
                <div className="mt-4">
                  <SuggestionDiscussionCard
                    change={change}
                    createdAt={new Date(change.createdAt)}
                    threadIds={threads.get(change.id) ?? []}
                    onInteractionChange={(next) =>
                      setRowBlocked(change.id, next)
                    }
                  />
                </div>
              )}
            </section>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t px-5 py-3">
        <span className="text-xs text-muted-foreground">
          Page {cursors.length + 1}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={blocked || cursors.length === 0}
            onClick={() =>
              setPagination({ version, cursors: cursors.slice(0, -1) })
            }
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={blocked || !page.cursor}
            onClick={() => {
              if (page.cursor) {
                setPagination({ version, cursors: [...cursors, page.cursor] });
              }
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

function AllCommentsList({
  message,
  onBlockedChange,
  onNavigate,
}: {
  message: string | null;
  onBlockedChange: (blocked: boolean) => void;
  onNavigate: (id: string) => void;
}) {
  const editor = useEditor();
  const { api: comments } = editor.plugin(CommentsPlugin);
  const [, updateThreadVersion] = React.useReducer(
    (value: number) => value + 1,
    0
  );
  React.useEffect(
    () => comments.subscribeThreads(updateThreadVersion),
    [comments]
  );
  const snapshot = comments.getSnapshot();
  const [filter, setFilter] = React.useState<CommentFilter>('all');
  const [page, setPage] = React.useState(0);
  const blockedIdsRef = React.useRef<ReadonlySet<string>>(new Set());
  const [blockedIds, setBlockedIds] = React.useState<ReadonlySet<string>>(
    () => new Set()
  );
  const eligibleIds = snapshot.threadIds.toReversed().filter((id) => {
    const thread = comments.getThread(id);
    if (!thread || thread.status !== 'published') return false;
    if (filter === 'open') return thread.resolution === null;
    if (filter === 'resolved') return thread.resolution !== null;
    return true;
  });
  const pageCount = Math.max(1, Math.ceil(eligibleIds.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageIds = React.useMemo(
    () =>
      eligibleIds.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE),
    [currentPage, eligibleIds]
  );
  const [heldIds, setHeldIds] = React.useState<readonly string[]>([]);
  const blocked = blockedIds.size > 0;
  const displayedIds = blocked ? heldIds : pageIds;

  const setRowBlocked = (id: string, next: boolean) => {
    const { current } = blockedIdsRef;
    const value = new Set(current);
    if (next) value.add(id);
    else value.delete(id);
    if (
      value.size === current.size &&
      [...value].every((entry) => current.has(entry))
    ) {
      return;
    }
    if (current.size === 0 && value.size > 0) setHeldIds(pageIds);
    blockedIdsRef.current = value;
    setBlockedIds(value);
    onBlockedChange(value.size > 0);
  };
  const empty =
    filter === 'open'
      ? 'No open comments'
      : filter === 'resolved'
        ? 'No resolved comments'
        : 'No comments yet';

  return (
    <>
      <div className="flex gap-1 border-b px-5 py-3" role="group">
        {(['all', 'open', 'resolved'] as const).map((value) => (
          <Button
            aria-pressed={filter === value}
            className="capitalize"
            disabled={blocked}
            key={value}
            onClick={() => {
              setFilter(value);
              setPage(0);
            }}
            size="sm"
            variant={filter === value ? 'secondary' : 'ghost'}
          >
            {value}
          </Button>
        ))}
      </div>

      {message && (
        <p
          className="border-b px-5 py-3 text-sm text-muted-foreground"
          role="status"
        >
          {message}
        </p>
      )}

      <div className="flex min-h-32 flex-col gap-4 overflow-y-auto p-5">
        {displayedIds.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {empty}
          </p>
        ) : (
          displayedIds.map((id) => (
            <AllCommentsRow
              blocked={blocked}
              id={id}
              key={id}
              onInteractionChange={setRowBlocked}
              onNavigate={() => onNavigate(id)}
            />
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t px-5 py-3">
        <span className="text-xs text-muted-foreground">
          {eligibleIds.length === 0
            ? '0 comments'
            : `Page ${currentPage + 1} of ${pageCount}`}
        </span>
        <div className="flex gap-2">
          <Button
            disabled={blocked || currentPage === 0}
            onClick={() => setPage((value) => Math.max(0, value - 1))}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          <Button
            disabled={blocked || currentPage + 1 >= pageCount}
            onClick={() =>
              setPage((value) => Math.min(pageCount - 1, value + 1))
            }
            size="sm"
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

function AllCommentsRow({
  blocked,
  id,
  onInteractionChange,
  onNavigate,
}: {
  blocked: boolean;
  id: string;
  onInteractionChange: (id: string, blocked: boolean) => void;
  onNavigate: () => void;
}) {
  const editor = useEditor();
  const { api: comments } = editor.plugin(CommentsPlugin);
  const thread = useCommentThread(id);
  const subscribe = React.useCallback(
    (listener: () => void) => {
      const stopAttachments = comments.subscribeAttachments(listener);
      const stopCommit = editor.subscribeCommit(listener);
      return () => {
        stopAttachments();
        stopCommit();
      };
    },
    [comments, editor]
  );
  const getSnapshot = React.useCallback(() => {
    const target = readCommentTarget(editor, id);
    return target.status === 'attached'
      ? JSON.stringify(target.range)
      : 'unavailable';
  }, [editor, id]);
  const targetSnapshot = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );
  const target = readCommentTarget(editor, id);

  if (!thread) return null;

  return (
    <section
      className={cn(
        'rounded-lg border p-4',
        blocked && 'has-[[aria-busy=true]]:ring-1'
      )}
      data-all-comments-row={id}
      data-target={
        targetSnapshot === 'unavailable' ? 'unavailable' : 'attached'
      }
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{thread.resolution ? 'Resolved' : 'Open'}</span>
          <span aria-hidden="true">·</span>
          <span>
            {target.status === 'attached'
              ? 'Attached to document'
              : 'Target unavailable in this view'}
          </span>
        </div>
        <Button
          disabled={blocked || target.status === 'unavailable'}
          onClick={onNavigate}
          size="sm"
          variant="outline"
        >
          Show in document
        </Button>
      </div>
      <CommentThreadCard
        id={id}
        onInteractionChange={(next) => onInteractionChange(id, next)}
      />
    </section>
  );
}
