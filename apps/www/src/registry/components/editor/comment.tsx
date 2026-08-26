'use client';

import {
  BaseCommentPlugin,
  getCommentCount,
  getCommentKey,
  getDraftCommentKey,
} from '@platejs/comment';
import type { CommentPlugin } from '@platejs/comment/react';
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
import {
  type DefinitionOf,
  type Path,
  type Value,
  nanoid,
  NodeApi,
  TextApi,
} from 'platejs';
import {
  Plate,
  PlateLeaf,
  type PlateEditor,
  type PlateLeafProps,
  toPlatePlugin,
  useEditor,
  useEditorPlugin,
  useEditorSelector,
  usePlateEditor,
  usePluginStore,
} from 'platejs/react';
import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import {
  type TDiscussion,
  discussionPlugin,
  getDiscussionClickTarget,
} from '@/registry/components/editor/discussion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';

import { Editor, EditorContainer } from './editor';

export type CommentPluginState = {
  activeId: string | null;
  commentingBlock: Path | null;
  hoverId: string | null;
};

const initialState: CommentPluginState = {
  activeId: null,
  commentingBlock: null,
  hoverId: null,
};

export function CommentLeaf(props: PlateLeafProps<typeof CommentPlugin>) {
  const { children, leaf } = props;
  const { api, store } = useEditorPlugin(commentPlugin);
  const hoverId = usePluginStore(commentPlugin, 'hoverId');
  const activeId = usePluginStore(commentPlugin, 'activeId');
  const isOverlapping = getCommentCount(leaf) > 1;
  const currentId = api.id(leaf);
  const isActive = activeId === currentId;
  const isHover = hoverId === currentId;

  return (
    <PlateLeaf
      {...props}
      className={cn(
        'border-b-2 border-b-highlight/[.36] bg-highlight/[.13] transition-colors duration-200',
        (isHover || isActive) && 'border-b-highlight bg-highlight/25',
        isOverlapping && 'border-b-2 border-b-highlight/[.7] bg-highlight/25',
        (isHover || isActive) &&
          isOverlapping &&
          'border-b-highlight bg-highlight/45'
      )}
      attributes={{
        ...props.attributes,
        onClick: () => {
          store.set({ activeId: currentId ?? null });
        },
        onMouseEnter: () => {
          store.set({ hoverId: currentId ?? null });
        },
        onMouseLeave: () => {
          store.set({ hoverId: null });
        },
      }}
    >
      {children}
    </PlateLeaf>
  );
}

export const commentPlugin = toPlatePlugin(BaseCommentPlugin, {
  on: {
    click: ({ api, event, name, read, store }) => {
      const activeTarget = getDiscussionClickTarget({
        selector: `.plite-${name}`,
        target: event.target,
      });

      if (!activeTarget) {
        store.set({ activeId: null });
        return;
      }

      const commentEntry = read.node();

      store.set({
        activeId: commentEntry ? (api.id(commentEntry[0]) ?? null) : null,
      });
    },
  },
  initialState,
})
  .extend(({ schema, store }) => ({
    update: ({ tx }) => ({
      setDraft: (options = {}) => {
        const selection = tx.selection();
        const commentingBlock = selection
          ? selection.focus.path.slice(0, 1)
          : null;

        if (tx.selection.isCollapsed()) {
          const blockEntry = tx.nodes.block();

          if (blockEntry) {
            tx.selection.set(blockEntry[1]);
          }
        }

        tx.nodes.set(
          {
            [getDraftCommentKey()]: true,
            [schema.key]: true,
          },
          { match: TextApi.isText, split: true, ...options }
        );

        tx.selection.collapse();
        store.set({ activeId: getDraftCommentKey() });
        store.set({ commentingBlock });
      },
    }),
  }))
  .configure({
    component: CommentLeaf,
    shortcuts: {
      setDraft: { keys: 'mod+shift+m' },
    },
  });

export type CommentDefinition = DefinitionOf<typeof commentPlugin>;

export const CommentKit = [commentPlugin] as const;

export type TComment = {
  id: string;
  contentRich: Value;
  createdAt: Date;
  discussionId: string;
  isEdited: boolean;
  userId: string;
};

const replaceEditorValue = (editor: PlateEditor, value: Value) => {
  editor
    .update({ history: 'skip' })
    .value.replace({ children: value, selection: null });
};

const focusEditorAtEnd = (editor: PlateEditor) => {
  editor.update((tx) => {
    const point = tx.points.end([]);

    if (point) {
      tx.selection.set({ anchor: point, focus: point });
    }
  });
  editor.api.dom.focus();
};

export function Comment(props: {
  comment: TComment;
  discussionLength: number;
  editingId: string | null;
  index: number;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  documentContent?: string;
  showDocumentContent?: boolean;
  onEditorClick?: () => void;
}) {
  const {
    comment,
    discussionLength,
    documentContent,
    editingId,
    index,
    setEditingId,
    showDocumentContent = false,
    onEditorClick,
  } = props;

  const editor = useEditor();
  const userInfo = usePluginStore(discussionPlugin, 'user', comment.userId);
  const currentUserId = usePluginStore(discussionPlugin, 'currentUserId');

  const resolveDiscussion = (id: string) => {
    const updatedDiscussions = editor
      .plugin(discussionPlugin)
      .store.get('discussions')
      .map((discussion) => {
        if (discussion.id === id) {
          return { ...discussion, isResolved: true };
        }
        return discussion;
      });
    editor
      .plugin(discussionPlugin)
      .store.set({ discussions: updatedDiscussions });
  };

  const removeDiscussion = (id: string) => {
    const updatedDiscussions = editor
      .plugin(discussionPlugin)
      .store.get('discussions')
      .filter((discussion) => discussion.id !== id);
    editor
      .plugin(discussionPlugin)
      .store.set({ discussions: updatedDiscussions });
  };

  const updateComment = (input: {
    id: string;
    contentRich: Value;
    discussionId: string;
    isEdited: boolean;
  }) => {
    const updatedDiscussions = editor
      .plugin(discussionPlugin)
      .store.get('discussions')
      .map((discussion) => {
        if (discussion.id === input.discussionId) {
          const updatedComments = discussion.comments.map((innerComment) => {
            if (innerComment.id === input.id) {
              return {
                ...innerComment,
                contentRich: input.contentRich,
                isEdited: true,
                updatedAt: new Date(),
              };
            }
            return innerComment;
          });
          return { ...discussion, comments: updatedComments };
        }
        return discussion;
      });
    editor
      .plugin(discussionPlugin)
      .store.set({ discussions: updatedDiscussions });
  };

  // Replace to your own backend or refer to potion
  const isMyComment = currentUserId === comment.userId;

  const initialValue = comment.contentRich;

  const commentEditor = usePlateEditor(
    {
      id: comment.id,
      plugins: BasicMarksKit,
      initialValue,
    },
    [initialValue]
  );

  const onCancel = () => {
    setEditingId(null);
    replaceEditorValue(commentEditor, initialValue);
  };

  const onSave = () => {
    updateComment({
      id: comment.id,
      contentRich: commentEditor.read.value().children,
      discussionId: comment.discussionId,
      isEdited: true,
    });
    setEditingId(null);
  };

  const onResolveComment = () => {
    resolveDiscussion(comment.discussionId);
    editor.plugin(commentPlugin).update.unsetMark({ id: comment.discussionId });
  };

  const isFirst = index === 0;
  const isLast = index === discussionLength - 1;
  const isEditing = editingId && editingId === comment.id;

  const [hovering, setHovering] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <div
      onMouseEnter={() => {
        setHovering(true);
      }}
      onMouseLeave={() => {
        setHovering(false);
      }}
    >
      <div className="relative flex items-center">
        <Avatar className="size-5">
          <AvatarImage alt={userInfo?.name} src={userInfo?.avatarUrl} />
          <AvatarFallback>{userInfo?.name?.[0]}</AvatarFallback>
        </Avatar>
        <h4 className="mx-2 text-sm leading-none font-semibold">
          {/* Replace to your own backend or refer to potion */}
          {userInfo?.name}
        </h4>

        <div className="text-xs leading-none text-muted-foreground/80">
          <span className="mr-1">
            {formatCommentDate(new Date(comment.createdAt))}
          </span>
          {comment.isEdited && <span>(edited)</span>}
        </div>

        {isMyComment && (hovering || dropdownOpen) && (
          <div className="absolute top-0 right-0 flex space-x-1">
            {index === 0 && (
              <Button
                variant="ghost"
                className="h-6 p-1 text-muted-foreground"
                onClick={onResolveComment}
                type="button"
              >
                <CheckIcon className="size-4" />
              </Button>
            )}

            <CommentMoreDropdown
              onFinalFocus={() => {
                setTimeout(() => {
                  focusEditorAtEnd(commentEditor);
                }, 0);
              }}
              onRemoveComment={() => {
                if (discussionLength === 1) {
                  editor
                    .plugin(commentPlugin)
                    .update.unsetMark({ id: comment.discussionId });
                  removeDiscussion(comment.discussionId);
                }
              }}
              comment={comment}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              setEditingId={setEditingId}
            />
          </div>
        )}
      </div>

      {isFirst && showDocumentContent && (
        <div className="text-subtle-foreground relative mt-1 flex pl-[32px] text-sm">
          {discussionLength > 1 && (
            <div className="absolute top-[5px] left-3 h-full w-0.5 shrink-0 bg-muted" />
          )}
          <div className="my-px w-0.5 shrink-0 bg-highlight" />
          {documentContent && <div className="ml-2">{documentContent}</div>}
        </div>
      )}

      <div className="relative my-1 pl-[26px]">
        {!isLast && (
          <div className="absolute top-0 left-3 h-full w-0.5 shrink-0 bg-muted" />
        )}
        <Plate readOnly={!isEditing} editor={commentEditor}>
          <EditorContainer variant="comment">
            <Editor
              variant="comment"
              className="w-auto grow"
              onClick={() => onEditorClick?.()}
            />

            {isEditing && (
              <div className="ml-auto flex shrink-0 gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-[28px]"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onCancel();
                  }}
                >
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-[50%] bg-primary/40">
                    <XIcon className="size-3 stroke-[3px] text-background" />
                  </div>
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onSave();
                  }}
                >
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-[50%] bg-brand">
                    <CheckIcon className="size-3 stroke-[3px] text-background" />
                  </div>
                </Button>
              </div>
            )}
          </EditorContainer>
        </Plate>
      </div>
    </div>
  );
}

function CommentMoreDropdown(props: {
  comment: TComment;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  onFinalFocus?: () => void;
  onRemoveComment?: () => void;
}) {
  const {
    comment,
    dropdownOpen,
    setDropdownOpen,
    setEditingId,
    onFinalFocus,
    onRemoveComment,
  } = props;

  const editor = useEditor();

  const selectedEditCommentRef = React.useRef<boolean>(false);

  const onDeleteComment = React.useCallback(() => {
    if (!comment.id) {
      // oxlint-disable-next-line no-alert -- [P1 local-invariant] This copied UI deliberately uses the native blocking fallback.
      alert('You are operating too quickly, please try again later.');
      return;
    }

    // Find and update the discussion
    const updatedDiscussions = editor
      .plugin(discussionPlugin)
      .store.get('discussions')
      .map((discussion) => {
        if (discussion.id !== comment.discussionId) {
          return discussion;
        }

        const commentIndex = discussion.comments.findIndex(
          (c) => c.id === comment.id
        );
        if (commentIndex === -1) {
          return discussion;
        }

        return {
          ...discussion,
          comments: [
            ...discussion.comments.slice(0, commentIndex),
            ...discussion.comments.slice(commentIndex + 1),
          ],
        };
      });

    // Save back to session storage
    editor
      .plugin(discussionPlugin)
      .store.set({ discussions: updatedDiscussions });
    onRemoveComment?.();
  }, [comment.discussionId, comment.id, editor, onRemoveComment]);

  const onEditComment = React.useCallback(() => {
    selectedEditCommentRef.current = true;

    if (!comment.id) {
      // oxlint-disable-next-line no-alert -- [P1 local-invariant] This copied UI deliberately uses the native blocking fallback.
      alert('You are operating too quickly, please try again later.');
      return;
    }

    setEditingId(comment.id);
  }, [comment.id, setEditingId]);

  return (
    <DropdownMenu
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      modal={false}
    >
      <DropdownMenuTrigger
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Button variant="ghost" className={cn('h-6 p-1 text-muted-foreground')}>
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48"
        onFinalFocus={(e) => {
          if (selectedEditCommentRef.current) {
            onFinalFocus?.();
            selectedEditCommentRef.current = false;
          }

          e.preventDefault();
        }}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onEditComment}>
            <PencilIcon className="size-4" />
            Edit comment
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDeleteComment}>
            <TrashIcon className="size-4" />
            Delete comment
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CommentCreateForm({
  autoFocus = false,
  className,
  discussionId: discussionIdProp,
  focusOnMount = false,
}: {
  autoFocus?: boolean;
  className?: string;
  discussionId?: string;
  focusOnMount?: boolean;
}) {
  const discussions = usePluginStore(discussionPlugin, 'discussions');

  const editor = useEditor();
  const commentId = useEditorSelector((innerEditor) => {
    if (
      !innerEditor.read.selection() ||
      innerEditor.read.selection.isExpanded()
    ) {
      return undefined;
    }
    const { api, read } = innerEditor.plugin(BaseCommentPlugin);
    const commentNode = read.node();

    if (commentNode) return api.id(commentNode[0]);

    return undefined;
  });
  const discussionId = discussionIdProp ?? commentId;

  const userInfo = usePluginStore(discussionPlugin, 'currentUser');
  const [commentValue, setCommentValue] = React.useState<Value | undefined>();
  const commentContent = React.useMemo(
    () => commentValue?.map((node) => NodeApi.string(node)).join('') ?? '',
    [commentValue]
  );
  const commentEditor = usePlateEditor({
    id: 'comment',
    plugins: BasicMarksKit,
  });

  React.useEffect(() => {
    if (commentEditor && focusOnMount) {
      commentEditor.api.dom.focus();
    }
  }, [commentEditor, focusOnMount]);

  const onAddComment = React.useCallback(() => {
    if (!commentValue) return;

    replaceEditorValue(commentEditor, []);

    if (discussionId) {
      // Get existing discussion
      const discussion = discussions.find((d) => d.id === discussionId);
      if (!discussion) {
        // Mock creating suggestion
        const newDiscussion: TDiscussion = {
          id: discussionId,
          comments: [
            {
              id: nanoid(),
              contentRich: commentValue,
              createdAt: new Date(),
              discussionId,
              isEdited: false,
              userId: editor
                .plugin(discussionPlugin)
                .store.get('currentUserId'),
            },
          ],
          createdAt: new Date(),
          isResolved: false,
          userId: editor.plugin(discussionPlugin).store.get('currentUserId'),
        };

        editor
          .plugin(discussionPlugin)
          .store.set({ discussions: [...discussions, newDiscussion] });
        return;
      }

      // Create reply comment
      const comment: TComment = {
        id: nanoid(),
        contentRich: commentValue,
        createdAt: new Date(),
        discussionId,
        isEdited: false,
        userId: editor.plugin(discussionPlugin).store.get('currentUserId'),
      };

      // Add reply to discussion comments
      const updatedDiscussion = {
        ...discussion,
        comments: [...discussion.comments, comment],
      };

      // Filter out old discussion and add updated one
      const updatedDiscussions = discussions
        .filter((d) => d.id !== discussionId)
        .concat(updatedDiscussion);

      editor
        .plugin(discussionPlugin)
        .store.set({ discussions: updatedDiscussions });

      return;
    }

    const commentsNodeEntry = editor.plugin(commentPlugin).read.nodes({
      at: [],
      isDraft: true,
    });

    if (commentsNodeEntry.length === 0) return;

    const documentContent = commentsNodeEntry
      .map(([node]) => node.text)
      .join('');

    const _discussionId = nanoid();
    // Mock creating new discussion
    const newDiscussion: TDiscussion = {
      id: _discussionId,
      comments: [
        {
          id: nanoid(),
          contentRich: commentValue,
          createdAt: new Date(),
          discussionId: _discussionId,
          isEdited: false,
          userId: editor.plugin(discussionPlugin).store.get('currentUserId'),
        },
      ],
      createdAt: new Date(),
      documentContent,
      isResolved: false,
      userId: editor.plugin(discussionPlugin).store.get('currentUserId'),
    };

    editor
      .plugin(discussionPlugin)
      .store.set({ discussions: [...discussions, newDiscussion] });

    const { id } = newDiscussion;

    editor.update((tx) => {
      commentsNodeEntry.forEach(([, path]) => {
        tx.nodes.set(
          {
            [getCommentKey(id)]: true,
          },
          { at: path, split: true }
        );
        const draftKeys: string[] = [getDraftCommentKey()];

        tx.nodes.unset(draftKeys, { at: path });
      });
    });
  }, [commentValue, commentEditor, discussionId, editor, discussions]);

  return (
    <div className={cn('flex w-full', className)}>
      <div className="mt-2 mr-1 shrink-0">
        {/* Replace to your own backend or refer to potion */}
        <Avatar className="size-5">
          <AvatarImage alt={userInfo?.name} src={userInfo?.avatarUrl} />
          <AvatarFallback>{userInfo?.name?.[0]}</AvatarFallback>
        </Avatar>
      </div>

      <div className="relative flex grow gap-2">
        <Plate
          onValueChange={({ value }) => {
            setCommentValue(value.children);
          }}
          editor={commentEditor}
        >
          <EditorContainer variant="comment">
            <Editor
              variant="comment"
              className="min-h-[25px] grow pt-0.5 pr-8"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onAddComment();
                }
              }}
              placeholder="Reply..."
              autoComplete="off"
              autoFocus={autoFocus}
            />

            <Button
              size="icon"
              variant="ghost"
              className="absolute right-0.5 bottom-0.5 ml-auto size-6 shrink-0"
              disabled={commentContent.trim().length === 0}
              onClick={(e) => {
                e.stopPropagation();
                onAddComment();
              }}
            >
              <div className="flex size-6 items-center justify-center rounded-full">
                <ArrowUpIcon />
              </div>
            </Button>
          </EditorContainer>
        </Plate>
      </div>
    </div>
  );
}

export const formatCommentDate = (date: Date) => {
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, date);
  const diffHours = differenceInHours(now, date);
  const diffDays = differenceInDays(now, date);

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }
  if (diffHours < 24) {
    return `${diffHours}h`;
  }
  if (diffDays < 2) {
    return `${diffDays}d`;
  }

  return format(date, 'MM/dd/yyyy');
};
