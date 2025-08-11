'use client';

import * as React from 'react';

import type { PlateElementProps, RenderNodeWrapper } from 'platejs/react';

import { getDraftCommentKey } from '@platejs/comment';
import { CommentPlugin } from '@platejs/comment/react';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import {
  MessageSquareTextIcon,
  MessagesSquareIcon,
  PencilLineIcon,
} from 'lucide-react';
import {
  type AnyPluginConfig,
  type NodeEntry,
  type Path,
  type TCommentText,
  type TElement,
  type TSuggestionText,
  PathApi,
  TextApi,
} from 'platejs';
import {
  useEditorPlugin,
  useEditorRef,
  useFocusedLast,
  usePluginOption,
} from 'platejs/react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { commentPlugin } from '@/components/editor/plugins/comment-kit';
import {
  type TDiscussion,
  discussionPlugin,
} from '@/components/editor/plugins/discussion-kit';
import { suggestionPlugin } from '@/components/editor/plugins/suggestion-kit';

import {
  BlockSuggestionCard,
  isResolvedSuggestion,
  useResolveSuggestion,
} from './block-suggestion';
import { Comment, CommentCreateForm } from './comment';

export const BlockDiscussion: RenderNodeWrapper<AnyPluginConfig> = (props) => {
  const { editor, element } = props;

  const commentsApi = editor.getApi(CommentPlugin).comment;
  const blockPath = editor.api.findPath(element);

  // avoid duplicate in table or column
  if (!blockPath || blockPath.length > 1) return;

  const draftCommentNode = commentsApi.node({ at: blockPath, isDraft: true });

  const commentNodes = [...commentsApi.nodes({ at: blockPath })];

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
    <BlockCommentContent
      blockPath={blockPath}
      commentNodes={commentNodes}
      draftCommentNode={draftCommentNode}
      suggestionNodes={suggestionNodes}
      {...props}
    />
  );
};

const BlockCommentContent = ({
  blockPath,
  children,
  commentNodes,
  draftCommentNode,
  suggestionNodes,
}: PlateElementProps & {
  blockPath: Path;
  commentNodes: NodeEntry<TCommentText>[];
  draftCommentNode: NodeEntry<TCommentText> | undefined;
  suggestionNodes: NodeEntry<TElement | TSuggestionText>[];
}) => {
  const editor = useEditorRef();
  const isFocusedLast = useFocusedLast();
  const resolvedSuggestions = useResolveSuggestion(suggestionNodes, blockPath);
  const resolvedDiscussions = useResolvedDiscussion(commentNodes, blockPath);

  const suggestionsCount = resolvedSuggestions.length;
  const discussionsCount = resolvedDiscussions.length;
  const totalCount = suggestionsCount + discussionsCount;

  const activeSuggestionId = usePluginOption(suggestionPlugin, 'activeId');
  const activeSuggestion =
    activeSuggestionId &&
    resolvedSuggestions.find((s) => s.suggestionId === activeSuggestionId);

  const commentingBlock = usePluginOption(commentPlugin, 'commentingBlock');
  const activeCommentId = usePluginOption(commentPlugin, 'activeId');
  const isCommenting = activeCommentId === getDraftCommentKey();
  const activeDiscussion =
    activeCommentId &&
    resolvedDiscussions.find((d) => d.id === activeCommentId);

  const noneActive = !activeSuggestion && !activeDiscussion;

  const sortedMergedData = [
    ...resolvedDiscussions,
    ...resolvedSuggestions,
  ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const selected =
    resolvedDiscussions.some((d) => d.id === activeCommentId) ||
    resolvedSuggestions.some((s) => s.suggestionId === activeSuggestionId);

  const [_open, setOpen] = React.useState(selected);

  // in some cases, we may comment the multiple blocks
  const commentingCurrent =
    !!commentingBlock && PathApi.equals(blockPath, commentingBlock);

  const open =
    isFocusedLast &&
    (_open ||
      selected ||
      (isCommenting && !!draftCommentNode && commentingCurrent));

  const anchorElement = React.useMemo(() => {
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
            editor.getApi(commentPlugin).comment.nodeId(node) ===
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
                className="mt-1 ml-1 flex h-6 gap-1 !px-1.5 py-0 text-muted-foreground/80 hover:text-muted-foreground/80 data-[active=true]:bg-muted"
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

function BlockComment({
  discussion,
  isLast,
}: {
  discussion: TDiscussion;
  isLast: boolean;
}) {
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
}

const useResolvedDiscussion = (
  commentNodes: NodeEntry<TCommentText>[],
  blockPath: Path
) => {
  const { api, getOption, setOption } = useEditorPlugin(commentPlugin);

  const discussions = usePluginOption(discussionPlugin, 'discussions');

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
