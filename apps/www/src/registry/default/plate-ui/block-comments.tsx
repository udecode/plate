'use client';
import React, { createContext, useMemo, useReducer } from 'react';

import type {
  PlateRenderElementProps,
  RenderNodeWrapper,
} from '@udecode/plate/react';

import {
  type NodeEntry,
  type Path,
  type TElement,
  PathApi,
  TextApi,
} from '@udecode/plate';
import { type TCommentText, getDraftCommentKey } from '@udecode/plate-comments';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import {
  type TSuggestionText,
  getInlineSuggestionId,
} from '@udecode/plate-suggestion';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import { useEditorRef, usePluginOption } from '@udecode/plate/react';
import {
  MessageSquareTextIcon,
  MessagesSquareIcon,
  PencilLineIcon,
} from 'lucide-react';

import { Button } from '@/registry/default/plate-ui/button';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/default/plate-ui/popover';

import { commentsPlugin } from '../components/editor/plugins/comments-plugin';
import {
  BlockCommentsCard,
  useResolvedDiscussion,
} from './block-comments-card';
import {
  BlockSuggestionCard,
  isResolvedSuggestion,
  useResolveSuggestion,
} from './block-suggestion-card';
import { CommentCreateForm } from './comment-create-form';

export const ForceUpdateContext = createContext<() => void>(() => {});

export const BlockComments: RenderNodeWrapper = (props) => {
  const { editor, element } = props;

  const blockPath = editor.api.findPath(element);

  // avoid duplicate in table or column
  if (!blockPath || blockPath.length > 1) return;

  const draftCommentNode = editor
    .getApi(CommentsPlugin)
    .comment.node({ at: blockPath, isDraft: true });

  const commentNodes = [
    ...editor.getApi(CommentsPlugin).comment.nodes({ at: blockPath }),
  ];

  const suggestionNodes = [
    ...editor.getApi(SuggestionPlugin).suggestion.nodes({ at: blockPath }),
  ];

  if (
    commentNodes.length === 0 &&
    suggestionNodes.length === 0 &&
    !draftCommentNode
  )
    return;

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
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const editor = useEditorRef();

  const resolvedSuggestion = useResolveSuggestion(
    editor,
    suggestionNodes,
    blockPath
  );

  const resolvedDiscussions = useResolvedDiscussion(
    editor,
    commentNodes,
    blockPath
  );

  const suggestionsCount = resolvedSuggestion.length;
  const discussionsCount = resolvedDiscussions.length;
  const totalCount = suggestionsCount + discussionsCount;

  const activeSuggestionId = usePluginOption(SuggestionPlugin, 'activeId');
  const activeSuggestion =
    activeSuggestionId &&
    resolvedSuggestion.find((s) => s.suggestionId === activeSuggestionId);

  const commentingBlock = usePluginOption(
    commentsPlugin,
    'commentingBlock'
  );
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
          getInlineSuggestionId(node) === activeSuggestion.suggestionId
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
    <ForceUpdateContext.Provider value={forceUpdate}>
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
                      <BlockCommentsCard
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
                      <BlockCommentsCard
                        discussion={activeDiscussion}
                        isLast={true}
                      />
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
    </ForceUpdateContext.Provider>
  );
};
