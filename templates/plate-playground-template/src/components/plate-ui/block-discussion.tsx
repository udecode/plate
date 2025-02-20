'use client';

import React, { useMemo } from 'react';

import type { TSuggestionText } from '@udecode/plate-suggestion';
import type {
  PlateRenderElementProps,
  RenderNodeWrapper,
} from '@udecode/plate/react';

import {
  type NodeEntry,
  type Path,
  type TElement,
  createZustandStore,
  PathApi,
  TextApi,
} from '@udecode/plate';
import { type TCommentText, getDraftCommentKey } from '@udecode/plate-comments';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import {
  useEditorPlugin,
  useEditorRef,
  usePluginOption,
  useStoreValue,
} from '@udecode/plate/react';
import {
  MessageSquareTextIcon,
  MessagesSquareIcon,
  PencilLineIcon,
} from 'lucide-react';

import {
  type CommentsConfig,
  commentsPlugin,
} from '@/components/editor/plugins/comments-plugin';
import { suggestionPlugin } from '@/components/editor/plugins/suggestion-plugin';
import { Button } from '@/components/plate-ui/button';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@/components/plate-ui/popover';

import {
  BlockSuggestionCard,
  isResolvedSuggestion,
  useResolveSuggestion,
} from './block-suggestion';
import { type TComment, Comment } from './comment';
import { CommentCreateForm } from './comment-create-form';

export interface TDiscussion {
  id: string;
  comments: TComment[];
  createdAt: Date;
  isResolved: boolean;
  userId: string;
  documentContent?: string;
}

const initTestDiscussions = [
  {
    id: 'discussion1',
    comments: [
      {
        id: 'comment1',
        contentRich: [
          {
            children: [
              {
                text: 'This is a comment',
              },
            ],
            type: 'p',
          },
        ],
        createdAt: new Date(Date.now() - 900_000),
        discussionId: 'discussion1',
        isEdited: false,
        userId: 'user1',
      },
    ],
    createdAt: new Date(),
    documentContent: 'comments to your content',
    isResolved: false,
    userId: 'user1',
  },
  {
    id: 'discussion2',
    comments: [
      {
        id: 'comment1',
        contentRich: [
          {
            children: [
              {
                text: 'Hey, what do you think about this approach?',
              },
            ],
            type: 'p',
          },
        ],
        createdAt: new Date(Date.now() - 900_000),
        discussionId: 'discussion1',
        isEdited: false,
        userId: 'user1',
      },
      {
        id: 'comment2',
        contentRich: [
          {
            children: [
              {
                text: 'Looks good!',
              },
            ],
            type: 'p',
          },
        ],
        createdAt: new Date(Date.now() - 800_000),
        discussionId: 'discussion1',
        isEdited: false,
        userId: 'user2',
      },
      {
        id: 'comment3',
        contentRich: [
          {
            children: [
              {
                text: 'Thanks for the feedback!',
              },
            ],
            type: 'p',
          },
        ],
        createdAt: new Date(Date.now() - 700_000),
        discussionId: 'discussion1',
        isEdited: false,
        userId: 'user1',
      },
    ],
    createdAt: new Date(),
    documentContent: 'collaborate',
    isResolved: false,
    userId: 'user2',
  },
];

type TDiscussionStore = {
  discussions: TDiscussion[];
};

export const discussionStore = createZustandStore<TDiscussionStore>(
  {
    discussions: initTestDiscussions,
  },
  {
    devtools: { enabled: true }, // Redux DevTools with options
    mutative: true, // shorthand for { enabled: true }
    name: 'discussion',
  }
);

export const useFakeCurrentUserId = () => 'user3';

export const useFakeUserInfo = (userId: string) => {
  const mockUsers = [
    {
      id: 'user1',
      avatarUrl: 'https://avatars.githubusercontent.com/u/19695832?s=96&v=4',
      name: 'zbeyens',
    },
    {
      id: 'user2',
      avatarUrl: 'https://avatars.githubusercontent.com/u/4272090?v=4',
      name: '12joan',
    },
    {
      id: 'user3',
      avatarUrl: 'https://avatars.githubusercontent.com/u/164472012?v=4',
      name: 'felixfeng33',
    },
  ];

  return mockUsers.find((user) => user.id === userId);
};

export const BlockDiscussion: RenderNodeWrapper<CommentsConfig> = (props) => {
  const { api, editor, element } = props;

  const blockPath = editor.api.findPath(element);

  // avoid duplicate in table or column
  if (!blockPath || blockPath.length > 1) return;

  const draftCommentNode = api.comment.node({ at: blockPath, isDraft: true });

  const commentNodes = [...api.comment.nodes({ at: blockPath })];

  const suggestionNodes = [
    ...editor.getApi(SuggestionPlugin).suggestion.nodes({ at: blockPath }),
  ];

  if (
    commentNodes.length === 0 &&
    suggestionNodes.length === 0 &&
    !draftCommentNode
  ) {
    return;
  }

  return (props) => (
    <BlockCommentsContent
      blockPath={blockPath}
      commentNodes={commentNodes}
      draftCommentNode={draftCommentNode}
      suggestionNodes={suggestionNodes}
      {...props}
    />
  );
};

const BlockCommentsContent = ({
  blockPath,
  children,
  commentNodes,
  draftCommentNode,
  suggestionNodes,
}: PlateRenderElementProps & {
  blockPath: Path;
  commentNodes: NodeEntry<TCommentText>[];
  draftCommentNode: NodeEntry<TCommentText> | undefined;
  suggestionNodes: NodeEntry<TElement | TSuggestionText>[];
}) => {
  const editor = useEditorRef();

  const resolvedSuggestion = useResolveSuggestion(suggestionNodes, blockPath);

  const resolvedDiscussions = useResolvedDiscussion(commentNodes, blockPath);

  const suggestionsCount = resolvedSuggestion.length;
  const discussionsCount = resolvedDiscussions.length;
  const totalCount = suggestionsCount + discussionsCount;

  const activeSuggestionId = usePluginOption(suggestionPlugin, 'activeId');
  const activeSuggestion =
    activeSuggestionId &&
    resolvedSuggestion.find((s) => s.suggestionId === activeSuggestionId);

  const commentingBlock = usePluginOption(commentsPlugin, 'commentingBlock');
  const activeCommentId = usePluginOption(commentsPlugin, 'activeId');
  const isCommenting = activeCommentId === getDraftCommentKey();
  const activeDiscussion =
    activeCommentId &&
    resolvedDiscussions.find((d) => d.id === activeCommentId);

  const noneActive = !activeSuggestion && !activeDiscussion;

  const sortedMergedData = [...resolvedDiscussions, ...resolvedSuggestion].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  const selected =
    resolvedDiscussions.some((d) => d.id === activeCommentId) ||
    resolvedSuggestion.some((s) => s.suggestionId === activeSuggestionId);

  const [_open, setOpen] = React.useState(selected);

  // in some cases, we may comment the multiple blocks
  const commentingCurrent =
    !!commentingBlock && PathApi.equals(blockPath, commentingBlock);

  const open =
    _open ||
    selected ||
    (isCommenting && !!draftCommentNode && commentingCurrent);

  const anchorElement = useMemo(() => {
    let activeNode: NodeEntry | undefined;

    if (activeSuggestion) {
      activeNode = suggestionNodes.find(
        ([node]) =>
          TextApi.isText(node) &&
          editor.getApi(SuggestionPlugin).suggestion.nodeId(node) ===
            activeSuggestion.suggestionId
      );
    }

    if (activeCommentId) {
      if (activeCommentId === getDraftCommentKey()) {
        activeNode = draftCommentNode;
      } else {
        activeNode = commentNodes.find(
          ([node]) =>
            editor.getApi(CommentsPlugin).comment.nodeId(node) ===
            activeCommentId
        );
      }
    }

    if (!activeNode) return null;

    return editor.api.toDOMNode(activeNode[0])!;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    activeSuggestion,
    activeCommentId,
    editor.api,
    suggestionNodes,
    draftCommentNode,
    commentNodes,
  ]);

  if (suggestionsCount + resolvedDiscussions.length === 0 && !draftCommentNode)
    return <div className="w-full">{children}</div>;

  return (
    <div className="flex w-full justify-between">
      <Popover
        open={open}
        onOpenChange={(_open_) => {
          if (!_open_ && isCommenting && draftCommentNode) {
            editor.tf.unsetNodes(getDraftCommentKey(), {
              at: [],
              mode: 'lowest',
              match: (n) => n[getDraftCommentKey()],
            });
          }
          setOpen(_open_);
        }}
      >
        <div className="w-full">{children}</div>
        {anchorElement && (
          <PopoverAnchor
            asChild
            className="w-full"
            virtualRef={{ current: anchorElement }}
          />
        )}

        <PopoverContent
          className="max-h-[min(50dvh,calc(-24px+var(--radix-popper-available-height)))] w-[380px] max-w-[calc(100vw-24px)] min-w-[130px] overflow-y-auto p-0 data-[state=closed]:opacity-0"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          align="center"
          side="bottom"
        >
          {isCommenting ? (
            <CommentCreateForm className="p-4" focusOnMount />
          ) : (
            <React.Fragment>
              {noneActive ? (
                sortedMergedData.map((item, index) =>
                  isResolvedSuggestion(item) ? (
                    <BlockSuggestionCard
                      key={item.suggestionId}
                      idx={index}
                      isLast={index === sortedMergedData.length - 1}
                      suggestion={item}
                    />
                  ) : (
                    <BlockComment
                      key={item.id}
                      discussion={item}
                      isLast={index === sortedMergedData.length - 1}
                    />
                  )
                )
              ) : (
                <React.Fragment>
                  {activeSuggestion && (
                    <BlockSuggestionCard
                      key={activeSuggestion.suggestionId}
                      idx={0}
                      isLast={true}
                      suggestion={activeSuggestion}
                    />
                  )}

                  {activeDiscussion && (
                    <BlockComment discussion={activeDiscussion} isLast={true} />
                  )}
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </PopoverContent>

        {totalCount > 0 && (
          <div className="relative left-0 size-0 select-none">
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="mt-1 ml-1 flex h-6 gap-1 px-1.5 py-0 text-muted-foreground/80 hover:text-muted-foreground/80 data-[active=true]:bg-muted"
                data-active={open}
                contentEditable={false}
              >
                {suggestionsCount > 0 && discussionsCount === 0 && (
                  <PencilLineIcon className="size-4 shrink-0" />
                )}

                {suggestionsCount === 0 && discussionsCount > 0 && (
                  <MessageSquareTextIcon className="size-4 shrink-0" />
                )}

                {suggestionsCount > 0 && discussionsCount > 0 && (
                  <MessagesSquareIcon className="size-4 shrink-0" />
                )}

                <span className="text-xs font-semibold">{totalCount}</span>
              </Button>
            </PopoverTrigger>
          </div>
        )}
      </Popover>
    </div>
  );
};

export const BlockComment = ({
  discussion,
  isLast,
}: {
  discussion: TDiscussion;
  isLast: boolean;
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);

  return (
    <React.Fragment key={discussion.id}>
      <div className="p-4">
        {discussion.comments.map((comment, index) => (
          <Comment
            key={comment.id ?? index}
            comment={comment}
            discussionLength={discussion.comments.length}
            documentContent={discussion?.documentContent}
            editingId={editingId}
            index={index}
            setEditingId={setEditingId}
            showDocumentContent
          />
        ))}
        <CommentCreateForm discussionId={discussion.id} />
      </div>

      {!isLast && <div className="h-px w-full bg-muted" />}
    </React.Fragment>
  );
};

export const useResolvedDiscussion = (
  commentNodes: NodeEntry<TCommentText>[],
  blockPath: Path
) => {
  const { api, getOption, setOption } = useEditorPlugin(commentsPlugin);

  const discussions = useStoreValue(discussionStore, 'discussions');

  commentNodes.forEach(([node]) => {
    const id = api.comment.nodeId(node);
    const map = getOption('uniquePathMap');

    if (!id) return;

    const previousPath = map.get(id);

    // If there are no comment nodes in the corresponding path in the map, then update it.
    if (PathApi.isPath(previousPath)) {
      const nodes = api.comment.node({ id, at: previousPath });

      if (!nodes) {
        setOption('uniquePathMap', new Map(map).set(id, blockPath));
        return;
      }

      return;
    }
    // TODO: fix throw error
    setOption('uniquePathMap', new Map(map).set(id, blockPath));
  });

  const commentsIds = new Set(
    commentNodes.map(([node]) => api.comment.nodeId(node)).filter(Boolean)
  );

  const resolvedDiscussions = discussions
    .map((d: TDiscussion) => ({
      ...d,
      createdAt: new Date(d.createdAt),
    }))
    .filter((item: TDiscussion) => {
      /** If comment cross blocks just show it in the first block */
      const commentsPathMap = getOption('uniquePathMap');
      const firstBlockPath = commentsPathMap.get(item.id);

      if (!firstBlockPath) return false;
      if (!PathApi.equals(firstBlockPath, blockPath)) return false;

      return (
        api.comment.has({ id: item.id }) &&
        commentsIds.has(item.id) &&
        !item.isResolved
      );
    });

  return resolvedDiscussions;
};
