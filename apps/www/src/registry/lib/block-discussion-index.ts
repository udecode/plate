'use client';

import * as React from 'react';

import type { TResolvedSuggestion } from '@platejs/suggestion';
import type { PlateEditor } from 'platejs/react';
import type { Element, Node, NodeEntry, Path, Text } from '@platejs/plite';

import { BaseCommentPlugin } from '@platejs/comment';
import { BaseSuggestionPlugin } from '@platejs/suggestion';
import {
  type TCommentText,
  ElementApi,
  KEYS,
  NodeApi,
  NODES,
  PathApi,
  TextApi,
} from 'platejs';
import {
  useEditor,
  useEditorRuntimeState,
  usePluginOption,
} from 'platejs/react';

import {
  type TDiscussion,
  discussionPlugin,
} from '@/registry/components/editor/plugins/discussion-kit';
import type { TComment } from '@/registry/ui/comment';

export interface ResolvedSuggestion extends TResolvedSuggestion {
  comments: TComment[];
}

export const BLOCK_SUGGESTION_TOKEN = '__block__';

type BlockDiscussionEntry = NodeEntry<TCommentText | Element>;
type SuggestionEntry = NodeEntry<Element | Text>;

type BlockDiscussionIndex = {
  discussionsByBlock: Map<string, TDiscussion[]>;
  suggestionsByBlock: Map<string, ResolvedSuggestion[]>;
};

type BuildBlockDiscussionIndexOptions = {
  entries: BlockDiscussionEntry[];
  discussions: TDiscussion[];
  getCommentId: (node: TCommentText) => string | undefined;
  getSuggestionData: (node: Node) =>
    | {
        createdAt: Date | number | string;
        id: string;
        isLineBreak?: boolean;
        newProperties?: Record<string, unknown>;
        properties?: Record<string, unknown>;
        type: 'insert' | 'remove' | 'update';
        userId: string;
      }
    | undefined;
  getSuggestionDataList: (node: Text) => Array<{
    id: string;
    newProperties?: Record<string, unknown>;
    properties?: Record<string, unknown>;
    type: 'insert' | 'remove' | 'update';
  }>;
  getSuggestionId: (node: Node) => string | undefined;
  getSuggestionKey: (id: string) => string;
  isBlockSuggestion: (node: Node) => boolean;
};

const discussionIndexCache = new WeakMap<
  PlateEditor,
  {
    discussions: TDiscussion[];
    index: BlockDiscussionIndex;
    version: number;
  }
>();

const getCommentApi = (editor: PlateEditor) =>
  editor.plugin(BaseCommentPlugin).api;

const getSuggestionApi = (editor: PlateEditor) =>
  editor.plugin(BaseSuggestionPlugin).api;

const TYPE_TEXT_MAP: Record<string, (node?: Element) => string> = {
  [KEYS.audio]: () => 'Audio',
  [KEYS.blockquote]: () => 'Blockquote',
  [KEYS.callout]: () => 'Callout',
  [NODES.codeBlock]: () => 'Code Block',
  [KEYS.column]: () => 'Column',
  [KEYS.equation]: () => 'Equation',
  [KEYS.file]: () => 'File',
  [KEYS.h1]: () => 'Heading 1',
  [KEYS.h2]: () => 'Heading 2',
  [KEYS.h3]: () => 'Heading 3',
  [KEYS.h4]: () => 'Heading 4',
  [KEYS.h5]: () => 'Heading 5',
  [KEYS.h6]: () => 'Heading 6',
  [KEYS.hr]: () => 'Horizontal Rule',
  [KEYS.img]: () => 'Image',
  [NODES.mediaEmbed]: () => 'Media',
  [KEYS.p]: (node) => {
    if (node?.[KEYS.listType] === KEYS.listTodo) return 'Todo List';
    if (node?.[KEYS.listType] === KEYS.ol) return 'Ordered List';
    if (node?.[KEYS.listType] === KEYS.ul) return 'List';

    return 'Paragraph';
  },
  [KEYS.table]: () => 'Table',
  [KEYS.toc]: () => 'Table of Contents',
  [KEYS.toggle]: () => 'Toggle',
  [KEYS.video]: () => 'Video',
};

const appendByKey = <T>(map: Map<string, T[]>, key: string, value: T) => {
  const values = map.get(key);

  if (values) {
    values.push(value);
    return;
  }

  map.set(key, [value]);
};

const getBlockKey = (path: Path) => path.join(',');

const getTopLevelPath = (path: Path): Path | null =>
  path.length > 0 ? path.slice(0, 1) : null;

const getSuggestionIds = (
  node: Node,
  getSuggestionDataList: BuildBlockDiscussionIndexOptions['getSuggestionDataList'],
  getSuggestionId: BuildBlockDiscussionIndexOptions['getSuggestionId']
) => {
  if (TextApi.isText(node)) {
    const dataList = getSuggestionDataList(node);
    const updateIds = dataList
      .filter((data) => data.type === 'update')
      .map((data) => data.id);

    if (updateIds.length > 0) return updateIds;

    const suggestionId = getSuggestionId(node);

    return suggestionId ? [suggestionId] : [];
  }

  if (ElementApi.isElement(node)) {
    const suggestionId = getSuggestionId(node);

    return suggestionId ? [suggestionId] : [];
  }

  return [];
};

const suggestionTypeText = (node: Element) =>
  (TYPE_TEXT_MAP[node.type] ?? (() => node.type))(node);

const formatSuggestionDateText = (date: string) => {
  const elementDate = new Date(date);

  if (Number.isNaN(elementDate.getTime())) return date;

  const today = new Date();
  const yesterday = new Date(today);
  const tomorrow = new Date(today);

  yesterday.setDate(today.getDate() - 1);
  tomorrow.setDate(today.getDate() + 1);

  const sameDay = (left: Date, right: Date) =>
    left.getDate() === right.getDate() &&
    left.getMonth() === right.getMonth() &&
    left.getFullYear() === right.getFullYear();

  if (sameDay(elementDate, today)) return 'Today';
  if (sameDay(elementDate, yesterday)) return 'Yesterday';
  if (sameDay(elementDate, tomorrow)) return 'Tomorrow';

  return elementDate.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getInlineSuggestionElementText = (node: Element) => {
  if (typeof node.value === 'string' && node.value.length > 0) {
    return node.value;
  }

  if (typeof node.date === 'string' && node.date.length > 0) {
    return formatSuggestionDateText(node.date);
  }

  if (
    node.type === NODES.inlineEquation &&
    typeof (node as Element & { texExpression?: unknown }).texExpression ===
      'string' &&
    (node as Element & { texExpression: string }).texExpression.length > 0
  ) {
    return (node as Element & { texExpression: string }).texExpression;
  }

  const nodeText = NodeApi.string(node);

  if (nodeText.length > 0) {
    return nodeText;
  }
};

const toResolvedSuggestion = ({
  discussionsById,
  entries,
  getSuggestionData,
  getSuggestionDataList,
  getSuggestionKey,
  id,
  isBlockSuggestion,
}: {
  discussionsById: Map<string, TDiscussion>;
  entries: SuggestionEntry[];
  getSuggestionData: BuildBlockDiscussionIndexOptions['getSuggestionData'];
  getSuggestionDataList: BuildBlockDiscussionIndexOptions['getSuggestionDataList'];
  getSuggestionKey: BuildBlockDiscussionIndexOptions['getSuggestionKey'];
  id: string;
  isBlockSuggestion: BuildBlockDiscussionIndexOptions['isBlockSuggestion'];
}): ResolvedSuggestion | null => {
  const sortedEntries = [...entries].sort(([, path1], [, path2]) =>
    PathApi.isChild(path1, path2) ? -1 : 1
  );

  if (sortedEntries.length === 0) return null;

  let newText = '';
  let text = '';
  let properties: Record<string, unknown> = {};
  let newProperties: Record<string, unknown> = {};

  sortedEntries.forEach(([node]) => {
    if (TextApi.isText(node)) {
      getSuggestionDataList(node).forEach((data) => {
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
            properties = { ...properties, ...data.properties };
            newProperties = { ...newProperties, ...data.newProperties };
            newText += node.text;
            break;
          }
        }
      });

      return;
    }

    if (!ElementApi.isElement(node)) return;

    const suggestionData = getSuggestionData(node);

    if (suggestionData?.id !== id) return;

    const inlineSuggestionText = getInlineSuggestionElementText(node);

    if (inlineSuggestionText) {
      if (suggestionData.type === 'insert') {
        newText += inlineSuggestionText;
      } else if (suggestionData.type === 'remove') {
        text += inlineSuggestionText;
      } else if (suggestionData.type === 'update') {
        properties = { ...properties, ...suggestionData.properties };
        newProperties = {
          ...newProperties,
          ...suggestionData.newProperties,
        };
        newText += inlineSuggestionText;
      }

      return;
    }

    if (!isBlockSuggestion(node)) return;

    const nextText = suggestionData.isLineBreak
      ? BLOCK_SUGGESTION_TOKEN
      : `${BLOCK_SUGGESTION_TOKEN}${suggestionTypeText(node)}`;

    if (suggestionData.type === 'insert') {
      newText += nextText;
    } else if (suggestionData.type === 'remove') {
      text += nextText;
    }
  });

  const suggestionData = getSuggestionData(sortedEntries[0][0]);

  if (!suggestionData) return null;

  const keyId = getSuggestionKey(id);
  const comments = discussionsById.get(id)?.comments ?? [];
  const createdAt = new Date(suggestionData.createdAt);
  const suggestionId = id;

  if (suggestionData.type === 'update') {
    return {
      comments,
      createdAt,
      keyId,
      newProperties,
      newText,
      properties,
      suggestionId,
      type: 'update',
      userId: suggestionData.userId,
    };
  }

  if (newText.length > 0 && text.length > 0) {
    return {
      comments,
      createdAt,
      keyId,
      newText,
      suggestionId,
      text,
      type: 'replace',
      userId: suggestionData.userId,
    };
  }

  if (newText.length > 0) {
    return {
      comments,
      createdAt,
      keyId,
      newText,
      suggestionId,
      type: 'insert',
      userId: suggestionData.userId,
    };
  }

  if (text.length > 0) {
    return {
      comments,
      createdAt,
      keyId,
      suggestionId,
      text,
      type: 'remove',
      userId: suggestionData.userId,
    };
  }

  return null;
};

export const buildBlockDiscussionIndex = ({
  discussions,
  entries,
  getCommentId,
  getSuggestionData,
  getSuggestionDataList,
  getSuggestionId,
  getSuggestionKey,
  isBlockSuggestion,
}: BuildBlockDiscussionIndexOptions): BlockDiscussionIndex => {
  const commentOwnerById = new Map<string, Path>();
  const suggestionOwnerById = new Map<string, Path>();
  const commentIds = new Set<string>();
  const suggestionEntriesById = new Map<string, SuggestionEntry[]>();
  const discussionsById = new Map(
    discussions.map((discussion) => [discussion.id, discussion])
  );

  entries.forEach(([node, path]) => {
    const blockPath = getTopLevelPath(path);

    if (!blockPath) return;

    if (TextApi.isText(node)) {
      const commentId = getCommentId(node);

      if (commentId) {
        commentIds.add(commentId);

        if (!commentOwnerById.has(commentId)) {
          commentOwnerById.set(commentId, blockPath);
        }
      }
    }

    getSuggestionIds(node, getSuggestionDataList, getSuggestionId).forEach(
      (suggestionId) => {
        if (!suggestionOwnerById.has(suggestionId)) {
          suggestionOwnerById.set(suggestionId, blockPath);
        }

        appendByKey(suggestionEntriesById, suggestionId, [node, path]);
      }
    );
  });

  const discussionsByBlock = new Map<string, TDiscussion[]>();

  discussions.forEach((discussion) => {
    const ownerPath = commentOwnerById.get(discussion.id);

    if (!ownerPath || !commentIds.has(discussion.id) || discussion.isResolved) {
      return;
    }

    appendByKey(discussionsByBlock, getBlockKey(ownerPath), {
      ...discussion,
      createdAt: new Date(discussion.createdAt),
    });
  });

  const suggestionsByBlock = new Map<string, ResolvedSuggestion[]>();

  suggestionEntriesById.forEach((suggestionEntries, suggestionId) => {
    const ownerPath = suggestionOwnerById.get(suggestionId);

    if (!ownerPath) return;

    const resolvedSuggestion = toResolvedSuggestion({
      discussionsById,
      entries: suggestionEntries,
      getSuggestionData,
      getSuggestionDataList,
      getSuggestionKey,
      id: suggestionId,
      isBlockSuggestion,
    });

    if (!resolvedSuggestion) return;

    appendByKey(suggestionsByBlock, getBlockKey(ownerPath), resolvedSuggestion);
  });

  return {
    discussionsByBlock,
    suggestionsByBlock,
  };
};

const getDiscussionIndex = (
  editor: PlateEditor,
  discussions: TDiscussion[],
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

  const commentApi = getCommentApi(editor);
  const suggestionApi = getSuggestionApi(editor);

  const index = buildBlockDiscussionIndex({
    discussions,
    entries: editor.read.nodes.toArray<TCommentText | Element>({
      at: [],
      mode: 'all',
    }),
    getCommentId: (node) => commentApi.nodeId(node),
    getSuggestionData: (node) => suggestionApi.suggestionData(node),
    getSuggestionDataList: (node) => suggestionApi.dataList(node),
    getSuggestionId: (node) => suggestionApi.nodeId(node),
    getSuggestionKey: (id) => suggestionApi.key(id),
    isBlockSuggestion: (node) =>
      ElementApi.isElement(node) && suggestionApi.isBlockSuggestion(node),
  });

  discussionIndexCache.set(editor, { discussions, index, version });

  return index;
};

export const useBlockDiscussionItems = (blockPath: Path) => {
  const editor = useEditor();
  const discussions = usePluginOption(discussionPlugin, 'discussions');
  const version = useEditorRuntimeState(
    editor,
    (state) => state.runtime.snapshot().version
  );

  return React.useMemo(() => {
    const index = getDiscussionIndex(editor, discussions, version);
    const blockKey = getBlockKey(blockPath);

    return {
      resolvedDiscussions: index.discussionsByBlock.get(blockKey) ?? [],
      resolvedSuggestions: index.suggestionsByBlock.get(blockKey) ?? [],
    };
  }, [blockPath, discussions, editor, version]);
};
