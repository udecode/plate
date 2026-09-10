'use client';

import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
} from 'date-fns';
import {
  ArrowUpIcon,
  CheckIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
} from 'lucide-react';
import { type PliteDecorationAttributes, type Value, NodeApi } from 'platejs';
import type { CommentMessage, CommentThread } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import {
  Plate,
  useCreateEditor,
  useEditorPlugin,
  usePluginStore,
  useStaticEditor,
} from 'platejs/react';
import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import { BaseBasicMarksKit } from '@/registry/components/editor/basic-marks-static';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';

import { Editor, EditorContainer, EditorView } from './editor';

export const commentDecorationAttributes: PliteDecorationAttributes = {
  className:
    'border-b-2 border-b-highlight/40 bg-highlight/15 transition-colors hover:border-b-highlight/70 hover:bg-highlight/25 data-comment-active:border-b-highlight! data-comment-active:bg-highlight/30! [&_[data-comment-id]]:border-b-highlight/80 [&_[data-comment-id]]:bg-highlight/25',
};

export const CommentKit = [
  CommentsPlugin.configure({
    decorate: { attributes: commentDecorationAttributes },
  }),
];

export const createCommentValue = (text = ''): Value => [
  { children: [{ text }], type: 'paragraph' },
];

const cloneCommentValue = (body: Value): Value => structuredClone(body);
const getCommentText = (body: Value) =>
  body.map((node) => NodeApi.string(node)).join('\n');
const normalizeBody = (body: Value) =>
  getCommentText(body).trim() ? cloneCommentValue(body) : null;

const EMPTY_COMMENT_IDS = Object.freeze([]) as readonly string[];

export const useCommentUser = (id: string | null) =>
  usePluginStore(CommentsPlugin, (state) => (id ? state.users[id] : undefined));

const useCurrentCommentUserId = () =>
  usePluginStore(CommentsPlugin, 'currentUserId');

export const usePendingComment = () => {
  const { api: comments } = useEditorPlugin(CommentsPlugin);

  return React.useSyncExternalStore(
    comments.subscribePending,
    () => comments.getSnapshot().pending,
    () => comments.getSnapshot().pending
  );
};

export const useCommentThread = (id: string) => {
  const { api: comments } = useEditorPlugin(CommentsPlugin);
  const subscribe = React.useCallback(
    (listener: () => void) => comments.subscribeThread(id, listener),
    [comments, id]
  );

  return React.useSyncExternalStore(
    subscribe,
    () => comments.getThread(id),
    () => comments.getThread(id)
  );
};

export const useVisibleCommentThreadIds = () => {
  const portal = useEditorPlugin(CommentsPlugin);
  const comments = portal.installed ? portal.api : null;
  const subscribe = React.useCallback(
    (listener: () => void) =>
      comments?.subscribeVisibleThreadIds(listener) ?? (() => {}),
    [comments]
  );

  return React.useSyncExternalStore(
    subscribe,
    () => comments?.getSnapshot().visibleThreadIds ?? EMPTY_COMMENT_IDS,
    () => comments?.getSnapshot().visibleThreadIds ?? EMPTY_COMMENT_IDS
  );
};

export const useDraftCommentThreadIds = () => {
  const portal = useEditorPlugin(CommentsPlugin);
  const comments = portal.installed ? portal.api : null;
  const subscribe = React.useCallback(
    (listener: () => void) =>
      comments?.subscribeDraftThreadIds(listener) ?? (() => {}),
    [comments]
  );

  return React.useSyncExternalStore(
    subscribe,
    () => comments?.getSnapshot().draftThreadIds ?? EMPTY_COMMENT_IDS,
    () => comments?.getSnapshot().draftThreadIds ?? EMPTY_COMMENT_IDS
  );
};

export function CommentComposer(props: {
  ariaLabel: string;
  onSubmit: (
    body: Value
  ) => boolean | string | null | Promise<boolean | string | null>;
  placeholder: string;
  autoFocus?: boolean;
  initialBody?: Value;
  onCancel?: () => void;
}) {
  return <CommentInput {...props} showAvatar />;
}

function CommentInput({
  ariaLabel,
  autoFocus = false,
  initialBody,
  onCancel,
  onSubmit,
  placeholder,
  showAvatar,
}: {
  ariaLabel: string;
  onSubmit: (
    body: Value
  ) => boolean | string | null | Promise<boolean | string | null>;
  placeholder: string;
  showAvatar: boolean;
  autoFocus?: boolean;
  initialBody?: Value;
  onCancel?: () => void;
}) {
  const currentUserId = useCurrentCommentUserId();
  const currentUser = useCommentUser(currentUserId);
  const initialValue = React.useMemo(
    () => cloneCommentValue(initialBody ?? createCommentValue()),
    [initialBody]
  );
  const commentEditor = useCreateEditor(
    {
      plugins: BasicMarksKit,
      initialValue,
    },
    [initialValue]
  );
  const [canSubmit, setCanSubmit] = React.useState(
    Boolean(normalizeBody(initialValue))
  );
  const [saving, setSaving] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const submitting = React.useRef(false);
  const submit = async () => {
    if (submitting.current) return;
    const nextBody = normalizeBody(commentEditor.read.value().children);
    if (!nextBody) return;
    submitting.current = true;
    setSaving(true);
    setFailed(false);
    try {
      const saved = await onSubmit(nextBody);
      if (!saved) {
        setFailed(true);
        return;
      }
      commentEditor.update({ history: 'skip' }).value.replace({
        children: createCommentValue(),
        selection: null,
      });
      setCanSubmit(false);
    } catch {
      setFailed(true);
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return (
    <form
      aria-busy={saving}
      className="flex w-full"
      data-plite-keep-selection-visible
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      {showAvatar && (
        <div className="mt-2 mr-1 shrink-0">
          <Avatar className="size-5">
            <AvatarImage alt={currentUser?.name} src={currentUser?.avatarUrl} />
            <AvatarFallback>{currentUser?.name?.[0] ?? '?'}</AvatarFallback>
          </Avatar>
        </div>
      )}

      <div className="relative flex grow flex-col gap-2">
        <Plate
          editor={commentEditor}
          readOnly={saving}
          onValueChange={({ value }) => {
            setCanSubmit(Boolean(normalizeBody(value.children)));
          }}
        >
          <EditorContainer variant="comment">
            <Editor
              aria-label={ariaLabel}
              autoComplete="off"
              autoFocus={autoFocus}
              className={cn(
                'min-h-[25px] grow pt-0.5',
                showAvatar ? 'pr-8' : 'pr-16'
              )}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && onCancel && !submitting.current) {
                  event.preventDefault();
                  onCancel();
                  return true;
                }
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  void submit();
                  return true;
                }
                return undefined;
              }}
              placeholder={placeholder}
              variant="comment"
            />

            {!showAvatar && onCancel && (
              <div className="ml-auto flex shrink-0 gap-1">
                <Button
                  aria-label="Cancel comment"
                  className="size-[28px]"
                  disabled={saving}
                  onClick={onCancel}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/40">
                    <XIcon className="size-3 stroke-[3px] text-background" />
                  </span>
                </Button>
                <Button
                  aria-label="Send comment"
                  disabled={!canSubmit || saving}
                  size="icon"
                  type="submit"
                  variant="ghost"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand">
                    <CheckIcon className="size-3 stroke-[3px] text-background" />
                  </span>
                </Button>
              </div>
            )}

            {showAvatar && (
              <Button
                aria-label="Send comment"
                className="absolute right-0.5 bottom-0.5 ml-auto size-6 shrink-0"
                disabled={!canSubmit || saving}
                size="icon"
                type="submit"
                variant="ghost"
              >
                <span className="flex size-6 items-center justify-center rounded-full">
                  <ArrowUpIcon />
                </span>
              </Button>
            )}
          </EditorContainer>
        </Plate>
        {failed && (
          <p className="text-xs text-destructive" role="alert">
            Could not save comment. Try again.
          </p>
        )}
      </div>
    </form>
  );
}

function CommentBody({ body }: { body: Value }) {
  const initialValue = React.useMemo(() => cloneCommentValue(body), [body]);
  const commentEditor = useStaticEditor(
    {
      plugins: BaseBasicMarksKit,
      initialValue,
    },
    [initialValue]
  );

  return (
    <EditorView
      className="min-h-0 w-auto grow px-1 py-1.5 text-sm"
      editor={commentEditor}
      variant="comment"
    />
  );
}

export function CommentThreadCard({ id }: { id: string }) {
  const { api: comments } = useEditorPlugin(CommentsPlugin);
  const thread = useCommentThread(id);
  const currentUserId = useCurrentCommentUserId();
  const [editingId, setEditingId] = React.useState<string | null>(null);

  if (!thread) return null;

  return (
    <article
      className="relative"
      data-comment-thread={id}
      data-status={thread.status}
    >
      {thread.messages.map((message, index) => (
        <CommentMessageRow
          editing={editingId === message.id}
          excerpt={thread.excerpt}
          id={id}
          index={index}
          isLast={index === thread.messages.length - 1}
          key={message.id}
          message={message}
          onEdit={() => setEditingId(message.id)}
          onEditingChange={setEditingId}
          mine={message.userId === currentUserId}
          showExcerpt={thread.target.type === 'range' && index === 0}
          status={thread.status}
          threadLength={thread.messages.length}
        />
      ))}

      {thread.target.type === 'range' && (
        <CommentComposer
          ariaLabel="Reply to thread"
          onSubmit={(body) => comments.reply(id, body)}
          placeholder="Reply..."
        />
      )}
    </article>
  );
}

function CommentMessageRow({
  editing,
  excerpt,
  id,
  index,
  isLast,
  message,
  mine,
  onEdit,
  onEditingChange,
  showExcerpt,
  status,
  threadLength,
}: {
  editing: boolean;
  excerpt: string;
  id: string;
  index: number;
  isLast: boolean;
  message: CommentMessage;
  mine: boolean;
  onEdit: () => void;
  onEditingChange: React.Dispatch<React.SetStateAction<string | null>>;
  showExcerpt: boolean;
  status: CommentThread['status'];
  threadLength: number;
}) {
  const { api: comments } = useEditorPlugin(CommentsPlugin);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const user = useCommentUser(message.userId);

  return (
    <div
      className="focus-within:[&>div>.plite-comment-actions]:pointer-events-auto focus-within:[&>div>.plite-comment-actions]:opacity-100 hover:[&>div>.plite-comment-actions]:pointer-events-auto hover:[&>div>.plite-comment-actions]:opacity-100"
      data-comment-message={message.id}
    >
      <div className="relative flex items-center">
        <Avatar className="size-5">
          <AvatarImage alt={user?.name} src={user?.avatarUrl} />
          <AvatarFallback>{user?.name?.[0] ?? '?'}</AvatarFallback>
        </Avatar>
        <h4 className="mx-2 text-sm leading-none font-semibold">
          {user?.name ?? 'Unknown'}
        </h4>
        <div className="text-xs leading-none text-muted-foreground/80">
          <span className="mr-1">
            {formatCommentDate(message.editedAt ?? message.createdAt)}
          </span>
          {message.editedAt && <span>(edited)</span>}
          {status === 'draft' && index === 0 && (
            <span className="ml-1">AI draft</span>
          )}
        </div>

        {mine && !editing && (
          <div
            className={cn(
              'plite-comment-actions pointer-events-none absolute top-0 right-0 flex gap-1 opacity-0 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100',
              menuOpen && 'pointer-events-auto opacity-100'
            )}
          >
            {index === 0 && (
              <Button
                aria-label="Resolve thread"
                className="h-6 p-1 text-muted-foreground"
                onClick={() => {
                  if (comments.resolve(id)) {
                    comments.setActive([]);
                  }
                }}
                type="button"
                variant="ghost"
              >
                <CheckIcon className="size-4" />
              </Button>
            )}

            <DropdownMenu
              modal={false}
              open={menuOpen}
              onOpenChange={setMenuOpen}
            >
              <DropdownMenuTrigger>
                <Button
                  aria-label="More comment actions"
                  className="h-6 p-1 text-muted-foreground"
                  type="button"
                  variant="ghost"
                >
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={onEdit}>
                    <PencilIcon className="size-4" />
                    Edit comment
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      if (comments.removeMessage(id, message.id)) {
                        onEditingChange(null);
                      }
                    }}
                  >
                    <TrashIcon className="size-4" />
                    Delete comment
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {showExcerpt && (
        <div
          className="text-subtle-foreground relative mt-1 flex pl-[32px] text-sm"
          data-comment-excerpt=""
        >
          {threadLength > 1 && (
            <div className="absolute top-[5px] left-3 h-full w-0.5 shrink-0 bg-muted" />
          )}
          <div className="my-px w-0.5 shrink-0 bg-highlight" />
          {excerpt && <div className="ml-2">{excerpt}</div>}
        </div>
      )}

      <div className="relative my-1 pl-[26px]">
        {!isLast && (
          <div className="absolute top-0 left-3 h-full w-0.5 shrink-0 bg-muted" />
        )}
        {editing ? (
          <CommentInput
            ariaLabel="Edit comment"
            autoFocus
            initialBody={message.body}
            onCancel={() => onEditingChange(null)}
            onSubmit={async (body) => {
              const saved = await comments.edit(id, message.id, body);
              if (saved) onEditingChange(null);
              return saved;
            }}
            placeholder="Edit comment"
            showAvatar={false}
          />
        ) : (
          <CommentBody body={message.body} />
        )}
      </div>
    </div>
  );
}

export const formatCommentDate = (date: Date | string) => {
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, date);
  const diffHours = differenceInHours(now, date);
  const diffDays = differenceInDays(now, date);

  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 2) return `${diffDays}d`;

  return format(date, 'MM/dd/yyyy');
};
