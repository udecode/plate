import React, { useMemo } from 'react';

import type { TCommentText } from '@udecode/plate-comments';
import type {
  PlateRenderElementProps,
  RenderNodeWrapper,
} from '@udecode/plate/react';

import {
  type NodeEntry,
  type Path,
  type TElement,
  ElementApi,
  PathApi,
  TextApi,
} from '@udecode/plate';
import {
  type TSuggestionText,
  getAllSuggestionData,
  getAllSuggestionId,
  getSuggestionDataList,
  getSuggestionId,
  getSuggestionKey,
  getSuggestionLineBreakData,
  getSuggestionLineBreakId,
  keyId2SuggestionId,
} from '@udecode/plate-suggestion';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import {
  useEditorPlugin,
  useEditorRef,
  usePluginOption,
} from '@udecode/plate/react';
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

import {
  type ResolvedSuggestion,
  BlockSuggestionCard,
  getAllSuggestionNodes,
  LINE_BREAK_SUGGESTION,
} from './suggestion-card';

export const BlockComments: RenderNodeWrapper = (props) => {
  const { editor, element } = props;

  const blockPath = editor.api.findPath(element);

  // avoid duplicate in table or column
  if (!blockPath || blockPath.length > 1) return;

  const commentNodes: NodeEntry<TCommentText>[] = [];
  const suggestionNodes = [...getAllSuggestionNodes(editor, { at: blockPath })];

  if (commentNodes.length === 0 && suggestionNodes.length === 0) return;

  return (props) => (
    <BlockCommentsContent
      blockPath={blockPath}
      commentNodes={commentNodes}
      suggestionNodes={suggestionNodes}
      {...props}
    />
  );
};

// const BlockCommentsCard = ({
//   discussion,
//   isLast,
// }: {
//   discussion: RouterDiscussionItem;
//   isLast: boolean;
// }) => {
//   const [editingId, setEditingId] = React.useState<string | null>(null);

//   return (
//     <React.Fragment key={discussion.id}>
//       <div className="p-4">
//         {discussion.comments.map((comment, index) => (
//           <CommentItem
//             key={comment.id ?? index}
//             comment={comment}
//             discussionLength={discussion.comments.length}
//             documentContent={discussion?.documentContent}
//             editingId={editingId}
//             index={index}
//             setEditingId={setEditingId}
//             showDocumentContent
//           />
//         ))}
//         <CommentCreateForm discussionId={discussion.id} />
//       </div>

//       {!isLast && <div className="h-px w-full bg-muted" />}
//     </React.Fragment>
//   );
// };

const BlockCommentsContent = ({
  blockPath,
  children,
  commentNodes,
  element,
  suggestionNodes,
}: PlateRenderElementProps & {
  blockPath: Path;
  commentNodes: NodeEntry<TCommentText>[];
  suggestionNodes: NodeEntry<TElement | TSuggestionText>[];
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const editor = useEditorRef();
  const activeSuggestionId = usePluginOption(
    SuggestionPlugin,
    'activeSuggestionId'
  );

  const { getOption, setOption } = useEditorPlugin(SuggestionPlugin);

  suggestionNodes.forEach(([node]) => {
    const id = getAllSuggestionId(node);
    const map = getOption('uniquePathMap');

    if (!id || map.has(id)) return;

    setOption('uniquePathMap', new Map(map).set(id, blockPath));
  });



  const resolvedSuggestion: ResolvedSuggestion[] = useMemo(() => {
    const map = getOption('uniquePathMap');

    if (suggestionNodes.length === 0) return [];

    const suggestionIds = new Set(
      suggestionNodes
        .flatMap(([node]) => {
          if (TextApi.isText(node)) {
            const dataList = getSuggestionDataList(node);
            const includeUpdate = dataList.some(
              (data) => data.type === 'update'
            );

            if (!includeUpdate) return getSuggestionId(node);

            return dataList
              .filter((data) => data.type === 'update')
              .map((d) => d.id);
          }
          if (ElementApi.isElement(node)) {
            return getSuggestionLineBreakId(node);
          }
        })
        .filter(Boolean)
    );

    const res: ResolvedSuggestion[] = [];

    suggestionIds.forEach((id) => {
      if (!id) return;

      const path = map.get(id);

      if (!path || !PathApi.isPath(path)) return;
      if (!PathApi.equals(path, blockPath)) return;

      const entries = [
        ...editor.api.nodes<TElement | TSuggestionText>({
          at: [],
          mode: 'all',
          match: (n) =>
            (n[SuggestionPlugin.key] && n[getSuggestionKey(id)]) ||
            getSuggestionLineBreakId(n as TElement) === id,
        }),
      ];

      // move line break to the end
      entries.sort(([, path1], [, path2]) => {
        return PathApi.isChild(path1, path2) ? -1 : 1;
      });

      let newText = '';
      let text = '';
      let updateProps: any;

      // overlapping suggestion
      entries.forEach(([node]) => {
        if (TextApi.isText(node)) {
          const dataList = getSuggestionDataList(node);

          dataList.forEach((data) => {
            if (data.id !== id) return;

            switch (data.type) {
              case 'insert': {
                newText += node.text;

                break;
              }
              case 'remove': {
                text += node.text;

                break;
              }
              case 'update': {
                updateProps = {
                  ...updateProps,
                  ...data. properties,
                };

                newText += node.text;

                break;
              }
              // No default
            }
          });
        } else {
          const lineBreakData = getSuggestionLineBreakData(node);

          if (lineBreakData?.id !== keyId2SuggestionId(id)) return;
          if (lineBreakData.type === 'insert') {
            newText += LINE_BREAK_SUGGESTION;
          } else if (lineBreakData.type === 'remove') {
            text += LINE_BREAK_SUGGESTION;
          }
        }
      });

      if (entries.length === 0) return;

      const nodeData = getAllSuggestionData(entries[0][0]);

      if (!nodeData) return;

      // const comments = data?.discussions.find((d) => d.id === id)?.comments;
      const createdAt = new Date(nodeData.createdAt);

      const keyId = getSuggestionKey(id);

      if (nodeData.type === 'update') {
        return res.push({
          createdAt,
          keyId,
          newText,
          suggestionId: keyId2SuggestionId(id),
          type: 'update',
          updateProps,
          userId: nodeData.userId,
        });
      }
      if (newText.length > 0 && text.length > 0) {
        return res.push({
          createdAt,
          keyId,
          newText,
          suggestionId: keyId2SuggestionId(id),
          text,
          type: 'replace',
          userId: nodeData.userId,
        });
      }
      if (newText.length > 0) {
        return res.push({
          createdAt,
          keyId,
          newText,
          suggestionId: keyId2SuggestionId(id),
          type: 'insert',
          userId: nodeData.userId,
        });
      }
      if (text.length > 0) {
        return res.push({
          createdAt,
          keyId,
          suggestionId: keyId2SuggestionId(id),
          text,
          type: 'remove',
          userId: nodeData.userId,
        });
      }
    });

    return res;
  }, [blockPath, editor.api, getOption, suggestionNodes]);

  const discussions:any[] = []

  const activeDiscussion = -1

  const suggestionsCount = resolvedSuggestion.length;

  const activeSuggestion =
    activeSuggestionId &&
    resolvedSuggestion.find((s) => s.suggestionId === activeSuggestionId);

  const sortedMergedData = [...discussions, ...resolvedSuggestion].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  const isSuggestion = (item: (typeof sortedMergedData)[number]) =>
    'suggestionId' in item;

  const selected =
    // discussions.some((d) => d.id === activeCommentId) ||
    resolvedSuggestion.some((s) => s.suggestionId === activeSuggestionId);

  const [_open, setOpen] = React.useState(selected);
  const open = _open || selected;



  const anchorElement = useMemo(() => {
    // const domNode = editor.api.toDOMNode(element)!;

    // if (!activeCommentId) return domNode;

    // const activeNode = commentNodes.find(
    //   ([node]) => getCommentLastId(node) === activeCommentId
    // );

    // if (!activeNode) return domNode;

    // return editor.api.toDOMNode(activeNode[0])!;

    return document.body
    // // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (
    suggestionsCount + discussions.length === 0
  )
    return <>{children}</>;

  return (
    <div ref={ref} className="flex w-full justify-between">
      <Popover open={open} onOpenChange={setOpen}>
        <div className="w-full">{children}</div>
        <PopoverAnchor
          asChild
          className="w-full"
          virtualRef={{ current: anchorElement }}
        />

        <PopoverContent
          className="max-h-[min(50dvh,calc(-24px+var(--radix-popper-available-height)))] w-[480px] max-w-[calc(100vw-24px)] min-w-[180px] overflow-y-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
          align="center"
          side="bottom"
        >
          {/* {activeDiscussion && (
            <BlockCommentsCard discussion={activeDiscussion} isLast={true} />
          )} */}

          {activeSuggestion && (
            <BlockSuggestionCard
              key={activeSuggestion.suggestionId}
              idx={0}
              isLast={true}
              suggestion={activeSuggestion}
            />
          )}

          {!activeSuggestion &&
            !activeDiscussion &&
            sortedMergedData.map((item, index) => {
              if (isSuggestion(item)) {
                return (
                  <BlockSuggestionCard
                    key={item.suggestionId}
                    idx={index}
                    isLast={index === sortedMergedData.length - 1}
                    suggestion={item}
                  />
                );
              }

              // return (
              //   <BlockCommentsCard
              //     key={item.id}
              //     discussion={item}
              //     isLast={index === sortedMergedData.length - 1}
              //   />
              // );
            })}
        </PopoverContent>

        <div className="relative left-0 size-0 select-none">
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="mt-1 ml-1 flex h-6 gap-1 px-1.5 py-0 text-muted-foreground/80 hover:text-muted-foreground/80 data-[active=true]:bg-muted"
              data-active={open}
              contentEditable={false}
            >
              {suggestionsCount > 0 && discussions.length === 0 && (
                <PencilLineIcon className="size-4 shrink-0" />
              )}

              {suggestionsCount === 0 && discussions.length > 0 && (
                <MessageSquareTextIcon className="size-4 shrink-0" />
              )}

              {suggestionsCount > 0 && discussions.length > 0 && (
                <MessagesSquareIcon className="size-4 shrink-0" />
              )}

              <span className="text-xs font-semibold">
                {discussions.length + suggestionsCount}
              </span>
            </Button>
          </PopoverTrigger>
        </div>
      </Popover>
    </div>
  );
};
