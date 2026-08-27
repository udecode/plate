"use client";

import {
  BaseCommentPlugin,
  getCommentCount,
  getDraftCommentKey,
} from "@platejs/comment";
import type { NormalizePluginState } from "@platejs/core/internal";
import { failInvariant } from "@platejs/plite/internal";
import {
  BaseSuggestionPlugin,
  SUGGESTION_TRANSIENT_KEY,
} from "@platejs/suggestion";
import { SuggestionPlugin } from "@platejs/suggestion/react";
import {
  CheckIcon,
  XIcon,
  MessageSquareTextIcon,
  MessagesSquareIcon,
  PencilLineIcon,
} from "lucide-react";
import {
  ElementApi,
  type Element,
  type NodeEntry,
  type NodeKey,
  PathApi,
  PLUGINS,
  type Text,
  TextApi,
} from "platejs";
import {
  useEditorPlugin,
  useEditorRuntimeState,
  usePluginStore,
  type PlateEditor,
  type RenderNodeWrapper,
  type RenderNodeWrapperProps,
  useEditor,
} from "platejs/react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  type TDiscussion,
  discussionPlugin,
} from "@/registry/components/editor/discussion";
import {
  FloatingPopover,
  FloatingPopoverAnchor,
  FloatingPopoverContent,
} from "@/registry/components/editor/floating-popover";
import { suggestionPlugin } from "@/registry/components/editor/suggestion";
import {
  BLOCK_SUGGESTION_TOKEN,
  buildBlockDiscussionIndex,
  type ResolvedSuggestion,
  sameBlockDiscussionSelection,
  shouldRefreshBlockDiscussionIndex,
} from "@/registry/lib/block-discussion-index";

import {
  Comment,
  CommentCreateForm,
  commentPlugin,
  formatCommentDate,
} from "./comment";

type DiscussionSnapshot = NormalizePluginState<TDiscussion>;

const EMPTY_DISCUSSIONS = Object.freeze([]) as readonly TDiscussion[];
const EMPTY_SUGGESTIONS = Object.freeze([]) as readonly ResolvedSuggestion[];

const suggestionText2Array = (text: string) => {
  if (text === BLOCK_SUGGESTION_TOKEN) return ["line breaks"];

  return text.split(BLOCK_SUGGESTION_TOKEN).filter(Boolean);
};

const getRemoveSummaryItems = (text: string) => {
  const items = suggestionText2Array(text).map((item) => {
    if (item === "columnGroup") return "Column";
    if (item === "codeBlock") return "Code Block";

    return item;
  });

  if (items.includes("Table")) return ["Table"];
  if (items.includes("Code Block")) return ["Code Block"];
  if (items.includes("Column")) return ["Column"];

  return items;
};

const discussionIndexCache = new WeakMap<
  PlateEditor,
  {
    discussions: readonly DiscussionSnapshot[];
    index: ReturnType<typeof buildBlockDiscussionIndex>;
    version: number;
  }
>();

const getDiscussionIndex = (
  editor: PlateEditor,
  discussions: readonly DiscussionSnapshot[],
  version: number
) => {
  const cached = discussionIndexCache.get(editor);

  if (
    cached &&
    cached.version === version &&
    cached.discussions === discussions
  ) {
    return cached.index;
  }

  const commentApi = editor.plugin(BaseCommentPlugin).api;
  const suggestionApi = editor.plugin(BaseSuggestionPlugin).api;
  const blockLabels = new Map<string, string>();

  (
    [
      [PLUGINS.audio, "Audio"],
      [PLUGINS.blockquote, "Blockquote"],
      [PLUGINS.callout, "Callout"],
      [PLUGINS.codeBlock, "Code Block"],
      [PLUGINS.column, "Column"],
      [PLUGINS.equation, "Equation"],
      [PLUGINS.file, "File"],
      [PLUGINS.heading, "Heading"],
      [PLUGINS.horizontalRule, "Horizontal Rule"],
      [PLUGINS.image, "Image"],
      [PLUGINS.mediaEmbed, "Media"],
      [PLUGINS.table, "Table"],
      [PLUGINS.toc, "Table of Contents"],
      [PLUGINS.toggle, "Toggle"],
      [PLUGINS.video, "Video"],
    ] as const
  ).forEach(([plugin, label]) => {
    const portal = editor.plugin(plugin);

    if (portal.installed) blockLabels.set(portal.schema.type, label);
  });
  const paragraph = editor.plugin(PLUGINS.paragraph);
  const paragraphType = paragraph.installed ? paragraph.schema.type : null;
  const inlineEquation = editor.plugin(PLUGINS.inlineEquation);
  const inlineEquationType = inlineEquation.installed
    ? inlineEquation.schema.type
    : null;
  const date = editor.plugin(PLUGINS.date);
  const dateType = date.installed ? date.schema.type : null;

  const index = buildBlockDiscussionIndex({
    discussions,
    entries: editor.read.nodes.toArray({
      at: [],
      match: (node): node is Element | Text =>
        ElementApi.isElement(node) || TextApi.isText(node),
      mode: "all",
    }),
    getBlockLabel: (node) => {
      const heading = editor.plugin(PLUGINS.heading);

      if (
        heading.installed &&
        node.type === heading.schema.type &&
        typeof node.level === "number"
      ) {
        return `Heading ${node.level}`;
      }
      if (node.type === paragraphType) {
        if (node.listType === "task") return "Todo List";
        if (node.listType === "numbered") return "Ordered List";
        if (node.listType === "bulleted") return "List";

        return "Paragraph";
      }

      return blockLabels.get(node.type) ?? node.type;
    },
    getBlockNodeKey: (node) => editor.key(node),
    getCommentId: (node) => commentApi.id(node),
    getSuggestionData: (node) => suggestionApi.suggestionData(node),
    getSuggestionDataList: (node) => suggestionApi.dataList(node),
    getSuggestionId: (node) => suggestionApi.id(node),
    getSuggestionKey: (id) => suggestionApi.key(id),
    isBlockSuggestion: (node) =>
      ElementApi.isElement(node) && suggestionApi.isBlockSuggestion(node),
    isDraftComment: (node) => Boolean(node[getDraftCommentKey()]),
    isDate: (node) => node.type === dateType,
    isInlineEquation: (node) => node.type === inlineEquationType,
  });

  discussionIndexCache.set(editor, { discussions, index, version });

  return index;
};

export function BlockSuggestionCard({
  idx,
  isLast,
  suggestion,
}: {
  idx: number;
  isLast: boolean;
  suggestion: ResolvedSuggestion;
}) {
  const { update } = useEditorPlugin(SuggestionPlugin);

  const userInfo = usePluginStore(discussionPlugin, "user", suggestion.userId);

  const accept = (innerSuggestion: ResolvedSuggestion) => {
    update.accept(innerSuggestion);
  };

  const reject = (innerSuggestion2: ResolvedSuggestion) => {
    update.reject(innerSuggestion2);
  };

  const [hovering, setHovering] = React.useState(false);

  const [editingId, setEditingId] = React.useState<string | null>(null);

  return (
    <div
      key={`${suggestion.suggestionId}-${idx}`}
      className="relative"
      onMouseEnter={() => {
        setHovering(true);
      }}
      onMouseLeave={() => {
        setHovering(false);
      }}
    >
      <div className="flex flex-col p-4">
        <div className="relative flex items-center">
          {/* Replace to your own backend or refer to potion */}
          <Avatar className="size-5">
            <AvatarImage alt={userInfo?.name} src={userInfo?.avatarUrl} />
            <AvatarFallback>{userInfo?.name?.[0]}</AvatarFallback>
          </Avatar>
          <h4 className="mx-2 text-sm leading-none font-semibold">
            {userInfo?.name}
          </h4>
          <div className="text-xs leading-none text-muted-foreground/80">
            <span className="mr-1">
              {formatCommentDate(new Date(suggestion.createdAt))}
            </span>
          </div>
        </div>

        <div className="relative mt-1 mb-4 pl-[32px]">
          <div className="flex flex-col gap-2">
            {suggestion.type === "remove" &&
              getRemoveSummaryItems(
                suggestion.text ?? failInvariant("Expected value to be defined")
              ).map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Delete:</span>

                  <span className="text-sm">{text}</span>
                </div>
              ))}

            {suggestion.type === "insert" &&
              suggestionText2Array(
                suggestion.newText ??
                  failInvariant("Expected value to be defined")
              ).map((text, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Add:</span>

                  <span key={index} className="text-sm">
                    {text || "line breaks"}
                  </span>
                </div>
              ))}

            {suggestion.type === "replace" && (
              <div className="flex flex-col gap-2">
                {suggestionText2Array(
                  suggestion.newText ??
                    failInvariant("Expected value to be defined")
                ).map((text, index) => (
                  <React.Fragment key={index}>
                    <div
                      key={index}
                      className="flex items-start gap-2 text-brand/80"
                    >
                      <span className="text-sm">with:</span>
                      <span className="text-sm">{text || "line breaks"}</span>
                    </div>
                  </React.Fragment>
                ))}

                {suggestionText2Array(
                  suggestion.text ??
                    failInvariant("Expected value to be defined")
                ).map((text, index) => (
                  <React.Fragment key={index}>
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-sm text-muted-foreground">
                        {index === 0 ? "Replace:" : "Delete:"}
                      </span>
                      <span className="text-sm">{text || "line breaks"}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}

            {suggestion.type === "update" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {Object.keys(suggestion.properties ?? {}).map((key) => (
                    <span key={key}>Un{key}</span>
                  ))}

                  {Object.keys(suggestion.newProperties ?? {}).map((key) => (
                    <span key={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  ))}
                </span>
                <span className="text-sm">{suggestion.newText}</span>
              </div>
            )}
          </div>
        </div>

        {suggestion.comments.map((comment, index) => (
          <Comment
            key={comment.id}
            comment={comment}
            discussionLength={suggestion.comments.length}
            documentContent="__suggestion__"
            editingId={editingId}
            index={index}
            setEditingId={setEditingId}
          />
        ))}

        {hovering && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              aria-label="Accept suggestion"
              variant="ghost"
              className="size-6 p-1 text-muted-foreground"
              onClick={() => {
                accept(suggestion);
              }}
            >
              <CheckIcon className="size-4" />
            </Button>

            <Button
              aria-label="Reject suggestion"
              variant="ghost"
              className="size-6 p-1 text-muted-foreground"
              onClick={() => {
                reject(suggestion);
              }}
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        )}

        <CommentCreateForm discussionId={suggestion.suggestionId} />
      </div>

      {!isLast && <div className="h-px w-full bg-muted" />}
    </div>
  );
}

export const isResolvedSuggestion = (
  suggestion: ResolvedSuggestion | TDiscussion
): suggestion is ResolvedSuggestion => "suggestionId" in suggestion;

export const BlockDiscussion: RenderNodeWrapper = (_props) =>
  function BlockDiscussionWrapper(props) {
    return <BlockCommentContent {...props} />;
  };

const BlockCommentContent = ({ children, element }: RenderNodeWrapperProps) => {
  const editor = useEditor();
  const nodeKey = editor.key(element);
  const discussions = usePluginStore(discussionPlugin, "discussions");
  const {
    hasDraftComment,
    isTopLevelBlock,
    resolvedDiscussions,
    resolvedSuggestions,
  } = useEditorRuntimeState(
    editor,
    (state) => {
      const index = getDiscussionIndex(
        editor,
        discussions,
        state.runtime.snapshot().version
      );

      return {
        contentKey: index.contentKeyByNodeKey.get(nodeKey) ?? "",
        hasDraftComment: index.draftCommentNodeKeys.has(nodeKey),
        isTopLevelBlock: index.topLevelNodeKeys.has(nodeKey),
        resolvedDiscussions:
          index.discussionsByNodeKey.get(nodeKey) ?? EMPTY_DISCUSSIONS,
        resolvedSuggestions:
          index.suggestionsByNodeKey.get(nodeKey) ?? EMPTY_SUGGESTIONS,
      };
    },
    {
      equalityFn: sameBlockDiscussionSelection,
      shouldUpdate: shouldRefreshBlockDiscussionIndex,
    }
  );

  if (!isTopLevelBlock) return <>{children}</>;
  if (
    resolvedSuggestions.length + resolvedDiscussions.length === 0 &&
    !hasDraftComment
  ) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <BlockCommentDetails
      hasDraftComment={hasDraftComment}
      nodeKey={nodeKey}
      resolvedDiscussions={resolvedDiscussions}
      resolvedSuggestions={resolvedSuggestions}
    >
      {children}
    </BlockCommentDetails>
  );
};

const BlockCommentDetails = ({
  children,
  hasDraftComment,
  nodeKey,
  resolvedDiscussions,
  resolvedSuggestions,
}: {
  children: React.ReactNode;
  hasDraftComment: boolean;
  nodeKey: NodeKey;
  resolvedDiscussions: readonly TDiscussion[];
  resolvedSuggestions: readonly ResolvedSuggestion[];
}) => {
  const editor = useEditor();
  const blockPath =
    editor.read.nodes.path(nodeKey) ??
    failInvariant("Expected value to be defined");
  const {
    api: commentsApi,
    read: commentsRead,
    schema: commentsSchema,
    store: commentsStore,
  } = useEditorPlugin(commentPlugin);
  const { api: suggestionApi, read: suggestionRead } =
    useEditorPlugin(suggestionPlugin);

  const draftCommentNode = hasDraftComment
    ? commentsRead.node({ at: blockPath, isDraft: true })
    : undefined;
  const commentNodes = [...commentsRead.nodes({ at: blockPath })];
  const suggestionNodes = [...suggestionRead.nodes({ at: blockPath })].filter(
    ([node]) => !node[SUGGESTION_TRANSIENT_KEY]
  );
  const suggestionsCount = resolvedSuggestions.length;
  const discussionsCount = resolvedDiscussions.length;
  const totalCount = suggestionsCount + discussionsCount;

  const activeSuggestionId = usePluginStore(suggestionPlugin, "activeId");
  const activeSuggestion =
    activeSuggestionId &&
    resolvedSuggestions.find((s) => s.suggestionId === activeSuggestionId);

  const commentingBlock = usePluginStore(commentPlugin, "commentingBlock");
  const activeCommentId = usePluginStore(commentPlugin, "activeId");
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
  const [closingDraft, setClosingDraft] = React.useState(false);

  // in some cases, we may comment the multiple blocks
  const commentingCurrent =
    !!commentingBlock && PathApi.equals(blockPath, commentingBlock);

  const open =
    !closingDraft &&
    (_open ||
      selected ||
      (isCommenting && !!draftCommentNode && commentingCurrent));

  const anchorElement = (() => {
    let activeNode: NodeEntry<Element | Text> | undefined;

    if (activeSuggestion) {
      activeNode = suggestionNodes.find(
        ([node]) => suggestionApi.id(node) === activeSuggestion.suggestionId
      );
    }

    if (activeCommentId) {
      if (activeCommentId === getDraftCommentKey()) {
        activeNode = draftCommentNode;
      } else {
        activeNode = commentNodes.find(
          ([node]) => commentsApi.id(node) === activeCommentId
        );
      }
    }

    if (!activeNode) return null;

    return editor.api.dom.resolveDOMNode(activeNode[0]);
  })();
  const [triggerElement, setTriggerElement] =
    React.useState<HTMLButtonElement | null>(null);
  const popoverAnchorElement = anchorElement ?? triggerElement;

  return (
    <div className="flex w-full justify-between">
      <FloatingPopover
        open={open && !!popoverAnchorElement}
        onOpenChange={(_open_) => {
          if (!_open_ && isCommenting) {
            setClosingDraft(true);
            return;
          }
          setOpen(_open_);
        }}
      >
        <div className="w-full">{children}</div>
        {popoverAnchorElement && (
          <FloatingPopoverAnchor element={popoverAnchorElement} />
        )}

        <FloatingPopoverContent
          className="max-h-[min(50dvh,calc(-24px+var(--floating-popover-available-height)))] w-[380px] max-w-[calc(100vw-24px)] min-w-[130px] overflow-y-auto p-0 data-[state=closed]:opacity-0"
          onFinalFocus={(e) => {
            e.preventDefault();

            if (!closingDraft) return;

            if (draftCommentNode) {
              editor.update((tx) => {
                tx.nodes.unset(commentsSchema.key, {
                  at: [],
                  mode: "lowest",
                  match: (n) =>
                    TextApi.isText(n) &&
                    Boolean(n[getDraftCommentKey()]) &&
                    getCommentCount(n) === 0,
                });
                tx.nodes.unset(getDraftCommentKey(), {
                  at: [],
                  mode: "lowest",
                  match: (n) =>
                    Boolean(
                      (n as Record<string, unknown>)[getDraftCommentKey()]
                    ),
                });
              });
            }

            commentsStore.set({
              activeId: null,
              commentingBlock: null,
            });
            setOpen(false);
            setClosingDraft(false);
          }}
          onInitialFocus={(e) => {
            e.preventDefault();
          }}
          align="center"
          side="bottom"
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
        </FloatingPopoverContent>

        {totalCount > 0 && (
          <div className="relative left-0 size-0 select-none">
            <Button
              ref={setTriggerElement}
              variant="ghost"
              className="mt-1 ml-1 flex h-6 gap-1 !px-1.5 py-0 text-muted-foreground/80 hover:text-muted-foreground/80 data-[active=true]:bg-muted"
              data-active={open}
              contentEditable={false}
              onClick={() => setOpen(!open)}
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
          </div>
        )}
      </FloatingPopover>
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
            key={comment.id}
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
