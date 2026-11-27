'use client';

import { cn } from 'cn';
import { MessageSquareTextIcon, MessagesSquareIcon } from 'lucide-react';
import { createEditorView, getEditorRuntimeOwner, type Range } from 'platejs';
import { AuthoredPlugin } from 'platejs/authored';
import { CommentsPlugin } from 'platejs/comments/react';
import {
  type Editor,
  useEditor,
  useEditorHasSelection,
  useEditorReadOnly,
  useEditorSelector,
  useEditorViewState,
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
import {
  CommentThreadCard,
  useCommentThread,
  usePendingComment,
} from '@/registry/components/editor/comment';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

const PAGE_SIZE = 20;
type CommentFilter = 'all' | 'open' | 'resolved';
type CommentTarget =
  | Readonly<{ range: Range; status: 'attached'; type: 'change' | 'range' }>
  | Readonly<{
      status: 'accepted' | 'contested' | 'deleted' | 'rejected' | 'unavailable';
    }>;

const TARGET_LABELS: Record<CommentTarget['status'], string> = {
  accepted: 'Suggestion accepted',
  attached: 'Attached to document',
  contested: 'Suggestion accepted and rejected',
  deleted: 'Suggestion deleted',
  rejected: 'Suggestion rejected',
  unavailable: 'Target unavailable in this view',
};

const isPreviewing = (editor: Editor) => {
  const authored = editor.plugin(AuthoredPlugin);

  return authored.installed && 'preview' in authored.read.view();
};

const readCommentTarget = (
  editor: Editor,
  id: string,
  previewing = isPreviewing(editor)
): CommentTarget => {
  const comments = editor.plugin(CommentsPlugin).api;
  const attachment = comments.attachment(id);
  if (attachment?.type === 'range') {
    return attachment.status === 'attached'
      ? { range: attachment.range, status: 'attached', type: 'range' }
      : { status: 'unavailable' };
  }
  if (attachment?.type === 'change') {
    const authored = editor.plugin(AuthoredPlugin);
    if (!authored.installed) return { status: 'unavailable' };
    const outcome = authored.read.outcome(attachment.id);
    if (outcome !== 'pending') return { status: outcome ?? 'deleted' };
    if (previewing) return { status: 'unavailable' };
    const range = authored.read.change(attachment.id)?.ranges[0];
    return range
      ? { range, status: 'attached', type: 'change' }
      : { status: 'unavailable' };
  }
  return { status: 'unavailable' };
};

const readStoredRange = (editor: Editor, id: string, target: CommentTarget) => {
  if (target.status !== 'attached') return undefined;
  if (target.type === 'change') return target.range;
  return editor.plugin(CommentsPlugin).api.ranges()[id];
};

export function CommentToolbarButton() {
  const editor = useEditor();
  const comments = editor.plugin(CommentsPlugin);
  const readOnly = useEditorReadOnly();
  const hasSelection = useEditorHasSelection();

  if (!comments.installed) return null;

  return (
    <ToolbarButton
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
  const current = useEditor();
  const readsPage = useEditorSelector(
    (viewed) => viewed.read.view.root() === undefined
  );
  // A nested root's view, such as a board note's, reads the page's threads as
  // unavailable, so the dialog reads every thread through the page in the
  // same presentation.
  const editor = React.useMemo(
    () => (readsPage ? current : createEditorView(current, { readOnly: true })),
    [current, readsPage]
  );
  const comments = editor.plugin(CommentsPlugin);

  if (!comments.installed) return null;

  return <AllCommentsButtonImpl editor={editor} />;
}

function AllCommentsButtonImpl({ editor }: { editor: Editor }) {
  const pending = usePendingComment();
  const [open, setOpen] = React.useState(false);
  const [blocked, setBlocked] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [revealing, setRevealing] = React.useState(false);
  const navigate = React.useCallback(
    (id: string) => {
      const target = readCommentTarget(editor, id);
      if (target.status !== 'attached') {
        setMessage(TARGET_LABELS[target.status]);
        return;
      }
      setMessage(null);
      setOpen(false);
      requestAnimationFrame(() => {
        const current = readCommentTarget(editor, id);
        const range = readStoredRange(editor, id, current);
        if (!range) {
          setMessage(
            TARGET_LABELS[
              current.status === 'attached' ? 'unavailable' : current.status
            ]
          );
          setOpen(true);
          return;
        }
        const model = getEditorRuntimeOwner(editor) as Editor;
        model.update.selection.set(range);
        setRevealing(true);
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
    <>
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
            editor={editor}
            message={message}
            onBlockedChange={setBlocked}
            onNavigate={navigate}
          />
        )}
      </Dialog>
      {revealing && <RevealSelection onRevealed={() => setRevealing(false)} />}
    </>
  );
}

function RevealSelection({ onRevealed }: { onRevealed: () => void }) {
  const editor = useEditor();

  React.useEffect(() => {
    const selection = editor.read.selection();
    if (selection) {
      editor.api.dom.focus();
      editor.api.dom.scrollIntoView(selection);
    }
    onRevealed();
  }, [editor, onRevealed]);

  return null;
}

function AllCommentsDialog({
  editor,
  message,
  onBlockedChange,
  onNavigate,
}: {
  editor: Editor;
  message: string | null;
  onBlockedChange: (blocked: boolean) => void;
  onNavigate: (id: string) => void;
}) {
  const { api: comments } = editor.plugin(CommentsPlugin);
  const [filter, setFilter] = React.useState<CommentFilter>('all');
  const [page, setPage] = React.useState(0);
  const blockedIdsRef = React.useRef<ReadonlySet<string>>(new Set());
  const [blockedIds, setBlockedIds] = React.useState<ReadonlySet<string>>(
    () => new Set()
  );
  // Joined into one string so an unchanged list keeps its snapshot.
  const readEligibleIds = () =>
    comments
      .getSnapshot()
      .threadIds.toReversed()
      .filter((id) => {
        const thread = comments.getThread(id);
        if (!thread || thread.status !== 'published') return false;
        if (filter === 'open') return thread.resolution === null;
        if (filter === 'resolved') return thread.resolution !== null;
        return true;
      })
      .join('\n');
  const eligible = React.useSyncExternalStore(
    comments.subscribeThreads,
    readEligibleIds,
    readEligibleIds
  );
  const eligibleIds = eligible ? eligible.split('\n') : [];
  const pageCount = Math.max(1, Math.ceil(eligibleIds.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageIds = eligibleIds.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
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
    <DialogContent
      className="max-h-[min(760px,calc(100dvh-2rem))] gap-0 overflow-hidden p-0 sm:max-w-xl"
      data-all-comments=""
    >
      <DialogHeader className="border-b p-5 pe-12">
        <DialogTitle>All comments</DialogTitle>
        <DialogDescription>
          Review open, resolved, and unavailable document conversations.
        </DialogDescription>
      </DialogHeader>

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
              editor={editor}
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
    </DialogContent>
  );
}

function AllCommentsRow({
  blocked,
  editor,
  id,
  onInteractionChange,
  onNavigate,
}: {
  blocked: boolean;
  editor: Editor;
  id: string;
  onInteractionChange: (id: string, blocked: boolean) => void;
  onNavigate: () => void;
}) {
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
  const previewing = useEditorViewState(editor, () => isPreviewing(editor));
  const getSnapshot = React.useCallback(
    () => readCommentTarget(editor, id, previewing).status,
    [editor, id, previewing]
  );
  const targetStatus = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );

  if (!thread) return null;

  return (
    <section
      className={cn(
        'rounded-lg border p-4',
        blocked && 'has-[[aria-busy=true]]:ring-1'
      )}
      data-all-comments-row={id}
      data-target={targetStatus}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{thread.resolution ? 'Resolved' : 'Open'}</span>
          <span aria-hidden="true">·</span>
          <span>{TARGET_LABELS[targetStatus]}</span>
        </div>
        <Button
          disabled={blocked || targetStatus !== 'attached'}
          onClick={onNavigate}
          onMouseDown={(event) => event.preventDefault()}
          onPointerDown={(event) => event.preventDefault()}
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
