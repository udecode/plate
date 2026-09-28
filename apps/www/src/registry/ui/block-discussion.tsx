'use client';

import * as React from 'react';

import type { PlateElementProps, RenderNodeWrapper } from 'platejs/react';

import { getDraftCommentKey } from '@platejs/comment';
import { CommentPlugin } from '@platejs/comment/react';
import { getTransientSuggestionKey } from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import {
  MessageSquareTextIcon,
  MessagesSquareIcon,
  PencilLineIcon,
} from 'lucide-react';
import { type AnyPluginConfig, type NodeEntry, PathApi } from 'platejs';
import { useEditorRef, usePluginOption } from 'platejs/react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { commentPlugin } from '@/registry/components/editor/plugins/comment-kit';
import type { TDiscussion } from '@/registry/components/editor/plugins/discussion-kit';
import { useBlockDiscussionItems } from '@/registry/lib/block-discussion-index';
import { suggestionPlugin } from '@/registry/components/editor/plugins/suggestion-kit';

import { BlockSuggestionCard, isResolvedSuggestion } from './block-suggestion';
import { Comment, CommentCreateForm } from './comment';

const POPOVER_SIDE_OFFSET = 4;
const POPOVER_VIEWPORT_MARGIN = 24;

export const BlockDiscussion: RenderNodeWrapper<AnyPluginConfig> =
  (_props) => (props) => <BlockCommentContent {...props} />;

const BlockCommentContent = ({ children, element }: PlateElementProps) => {
  const editor = useEditorRef();
  const commentsApi = editor.getApi(CommentPlugin).comment;
  const blockPath = editor.api.findPath(element) ?? [];
  const isTopLevelBlock = blockPath.length === 1;
  const draftCommentNode = isTopLevelBlock
    ? commentsApi.node({ at: blockPath, isDraft: true })
    : undefined;
  const commentNodes = isTopLevelBlock
    ? [...commentsApi.nodes({ at: blockPath })]
    : [];
  const suggestionNodes = isTopLevelBlock
    ? [
        ...editor.getApi(SuggestionPlugin).suggestion.nodes({ at: blockPath }),
      ].filter(([node]) => !node[getTransientSuggestionKey()])
    : [];
  const { resolvedDiscussions, resolvedSuggestions } =
    useBlockDiscussionItems(blockPath);

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
  const [popoverElement, setPopoverElement] =
    React.useState<HTMLDivElement | null>(null);

  // in some cases, we may comment the multiple blocks
  const commentingCurrent =
    !!commentingBlock && PathApi.equals(blockPath, commentingBlock);

  const open =
    _open ||
    selected ||
    (isCommenting && !!draftCommentNode && commentingCurrent);

  const anchorElement = React.useMemo(() => {
    let activeNode: NodeEntry | undefined;

    if (activeSuggestion) {
      activeNode = suggestionNodes.find(
        ([node]) =>
          editor.getApi(SuggestionPlugin).suggestion.nodeId(node) ===
          activeSuggestion.suggestionId
      );
    }

    if (activeCommentId) {
      if (activeCommentId === getDraftCommentKey()) {
        if (!draftCommentNode || !commentingCurrent) return null;

        return {
          contextElement: editor.api.toDOMNode(element) ?? undefined,
          getBoundingClientRect: () => {
            const draftNodes = [
              ...commentsApi.nodes({ at: [], isDraft: true }),
            ];
            const first = draftNodes[0];
            const last = draftNodes.at(-1);
            const start = first && editor.api.start(first[1]);
            const end = last && editor.api.end(last[1]);
            const domRange =
              start && end
                ? editor.api.toDOMRange({ anchor: start, focus: end })
                : undefined;
            const rangeRect = domRange?.getBoundingClientRect();

            if (!domRange || !rangeRect) {
              return (
                editor.api.toDOMNode(element)?.getBoundingClientRect() ??
                new DOMRect()
              );
            }

            const viewportHeight = window.innerHeight;

            if (popoverElement && popoverElement.scrollHeight > 0) {
              const contentHeight = Math.min(
                popoverElement.scrollHeight +
                  popoverElement.offsetHeight -
                  popoverElement.clientHeight,
                viewportHeight * 0.5
              );
              const availableHeight = Math.max(
                rangeRect.top,
                viewportHeight - rangeRect.bottom
              );

              // The whole marked range must stay clear when the composer flips.
              if (
                availableHeight >=
                contentHeight + POPOVER_SIDE_OFFSET + POPOVER_VIEWPORT_MARGIN
              ) {
                return rangeRect;
              }
            }

            // Keep the composer usable when neither side fits the full range.
            return (
              [...domRange.getClientRects()].findLast(
                ({ height, width }) => height > 0 || width > 0
              ) ?? rangeRect
            );
          },
        };
      }
      activeNode = commentNodes.find(
        ([node]) =>
          editor.getApi(commentPlugin).comment.nodeId(node) === activeCommentId
      );
    }

    if (!activeNode) return null;

    return editor.api.toDOMNode(activeNode[0])!;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    activeSuggestion,
    activeCommentId,
    commentingCurrent,
    editor.api,
    element,
    commentsApi,
    popoverElement,
    suggestionNodes,
    draftCommentNode,
    commentNodes,
  ]);

  if (!isTopLevelBlock) return <>{children}</>;

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
          ref={setPopoverElement}
          className="max-h-[min(50dvh,calc(-24px+var(--radix-popper-available-height)))] w-[380px] min-w-[130px] max-w-[calc(100vw-24px)] overflow-y-auto p-0 data-[state=closed]:opacity-0"
          collisionPadding={{
            bottom: POPOVER_VIEWPORT_MARGIN,
            top: POPOVER_VIEWPORT_MARGIN,
          }}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          align="center"
          side="bottom"
          sideOffset={POPOVER_SIDE_OFFSET}
        >
          {isCommenting ? (
            <CommentCreateForm className="p-4" focusOnMount />
          ) : noneActive ? (
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
            <>
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
            </>
          )}
        </PopoverContent>

        {totalCount > 0 && (
          <div className="relative left-0 size-0 select-none">
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="!px-1.5 mt-1 ml-1 flex h-6 gap-1 py-0 text-muted-foreground/80 hover:text-muted-foreground/80 data-[active=true]:bg-muted"
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

                <span className="font-semibold text-xs">{totalCount}</span>
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
