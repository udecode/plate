import type { NormalizePluginState } from '@platejs/core/internal';
import { getDateDisplayLabel, normalizeDateValue } from '@platejs/date';
import type {
  EditorCommit,
  Element,
  Node,
  NodeEntry,
  Path,
  Text,
} from '@platejs/plite';
import type { ResolvedSuggestion as BaseResolvedSuggestion } from '@platejs/suggestion';
import { ElementApi, NodeApi, PathApi, TextApi } from 'platejs';

import type { TComment } from '@/registry/components/editor/comment';
import type { TDiscussion } from '@/registry/components/editor/discussion';

export interface ResolvedSuggestion extends BaseResolvedSuggestion {
  comments: TComment[];
}

export const BLOCK_SUGGESTION_TOKEN = '__block__';

type BlockDiscussionEntry = NodeEntry<Element | Text>;
type DiscussionSnapshot = NormalizePluginState<TDiscussion>;
type SuggestionEntry = NodeEntry<Element | Text>;

type BlockDiscussionIndex = {
  discussionsByBlock: Map<string, TDiscussion[]>;
  suggestionsByBlock: Map<string, ResolvedSuggestion[]>;
};

type BuildBlockDiscussionIndexOptions = {
  entries: readonly BlockDiscussionEntry[];
  discussions: readonly DiscussionSnapshot[];
  getCommentId: (node: Text) => string | undefined;
  getBlockLabel?: (node: Element) => string;
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
  isDate?: (node: Element) => boolean;
  isInlineEquation?: (node: Element) => boolean;
  isBlockSuggestion: (node: Node) => boolean;
};

export const shouldRefreshBlockDiscussionIndex = (change?: EditorCommit) => {
  if (!change) return true;
  if (
    change.changed.hasAny('properties') ||
    change.changed.hasAny('structure') ||
    change.changed.hasAny('replace') ||
    change.changed.hasAny('root-order')
  ) {
    return true;
  }
  if (!change.changed.hasAny('text')) return false;

  const getSnapshotNode = (path: Path) => {
    let children: readonly Node[] = change.after.children;
    let node: Node | undefined;

    for (const index of path) {
      node = children[index];
      if (!node) return;
      children = ElementApi.isElement(node) ? node.children : [];
    }

    return node;
  };

  return change.changed.paths().some((path) => {
    for (let depth = path.length; depth > 0; depth--) {
      const node = getSnapshotNode(path.slice(0, depth));

      if (!node) continue;
      if (
        Object.keys(node).some(
          (key) => key.startsWith('comment_') || key.startsWith('suggestion_')
        )
      ) {
        return true;
      }
      if (ElementApi.isElement(node) && typeof node.suggestion === 'object') {
        return true;
      }
    }

    return false;
  });
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

const getInlineSuggestionElementText = (
  node: Element,
  isDate: (node: Element) => boolean,
  isInlineEquation: (node: Element) => boolean
) => {
  if (isDate(node) && typeof node.value === 'string' && node.value.length > 0) {
    return getDateDisplayLabel(normalizeDateValue(node.value) ?? node.value);
  }

  if (typeof node.label === 'string') return node.label;
  if (typeof node.ref === 'string') return node.ref;

  if (typeof node.value === 'string' && node.value.length > 0) {
    return node.value;
  }

  const { latex } = node;

  if (isInlineEquation(node) && typeof latex === 'string' && latex.length > 0) {
    return latex;
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
  getBlockLabel,
  getSuggestionKey,
  id,
  isBlockSuggestion,
  isDate,
  isInlineEquation,
}: {
  discussionsById: Map<string, TDiscussion>;
  entries: SuggestionEntry[];
  getSuggestionData: BuildBlockDiscussionIndexOptions['getSuggestionData'];
  getSuggestionDataList: BuildBlockDiscussionIndexOptions['getSuggestionDataList'];
  getBlockLabel?: BuildBlockDiscussionIndexOptions['getBlockLabel'];
  getSuggestionKey: BuildBlockDiscussionIndexOptions['getSuggestionKey'];
  id: string;
  isBlockSuggestion: BuildBlockDiscussionIndexOptions['isBlockSuggestion'];
  isDate: NonNullable<BuildBlockDiscussionIndexOptions['isDate']>;
  isInlineEquation: NonNullable<
    BuildBlockDiscussionIndexOptions['isInlineEquation']
  >;
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

    const inlineSuggestionText = getInlineSuggestionElementText(
      node,
      isDate,
      isInlineEquation
    );

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
      : `${BLOCK_SUGGESTION_TOKEN}${getBlockLabel?.(node) ?? node.type}`;

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
  getBlockLabel,
  getCommentId,
  getSuggestionData,
  getSuggestionDataList,
  getSuggestionId,
  getSuggestionKey,
  isBlockSuggestion,
  isDate = () => false,
  isInlineEquation = () => false,
}: BuildBlockDiscussionIndexOptions): BlockDiscussionIndex => {
  const materializedDiscussions = discussions.map(
    (discussion) => structuredClone(discussion) as TDiscussion
  );
  const commentOwnerById = new Map<string, Path>();
  const suggestionOwnerById = new Map<string, Path>();
  const commentIds = new Set<string>();
  const suggestionEntriesById = new Map<string, SuggestionEntry[]>();
  const discussionsById = new Map(
    materializedDiscussions.map((discussion) => [discussion.id, discussion])
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

  materializedDiscussions.forEach((discussion) => {
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
      getBlockLabel,
      getSuggestionKey,
      id: suggestionId,
      isBlockSuggestion,
      isDate,
      isInlineEquation,
    });

    if (!resolvedSuggestion) return;

    appendByKey(suggestionsByBlock, getBlockKey(ownerPath), resolvedSuggestion);
  });

  return {
    discussionsByBlock,
    suggestionsByBlock,
  };
};
