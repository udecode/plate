import {
  type EditorNodesOptions,
  type NodeEntry,
  type Path,
  type PluginConfig,
  createTSlatePlugin,
  TextApi,
} from '@udecode/plate';

import type { TCommentText } from './types';

import { getDraftCommentKey } from './utils';
import { withComments } from './withComments';

export type CommentsPluginConfig = PluginConfig<
  'comment',
  {
    activeId: string | null;
    hotkey: string[] | string;
    hoverId: string | null;
    isOverlapWithEditor: boolean;
    uniquePathMap: Map<string, Path>;
    updateTimestamp: number | null;
  },
  {
    comment: {
      draftCommentNode: (
        options?: EditorNodesOptions
      ) => NodeEntry<TCommentText> | undefined;
      node: (
        options?: EditorNodesOptions
      ) => NodeEntry<TCommentText> | undefined;
      nodes: (options?: EditorNodesOptions) => NodeEntry<TCommentText>[];
    };
  }
>;

export const BaseCommentsPlugin = createTSlatePlugin<CommentsPluginConfig>({
  key: 'comment',
  node: { isLeaf: true },
  options: {
    activeId: null,
    hotkey: ['meta+shift+m', 'ctrl+shift+m'],
    hoverId: null,
    isOverlapWithEditor: false,
    uniquePathMap: new Map(),
    updateTimestamp: null,
  },
})
  .overrideEditor(withComments)
  .extendApi<CommentsPluginConfig['api']['comment']>(({ editor, type }) => ({
    draftCommentNode: (options = {}) => {
      return editor.api.node<TCommentText>({
        ...options,
        match: (n) => TextApi.isText(n) && n[type] && n[getDraftCommentKey()],
      });
    },
    node: (options = {}) => {
      return editor.api.node<TCommentText>({
        ...options,
        match: (n) => n[BaseCommentsPlugin.key],
      });
    },
    nodes: (options = {}) => {
      return [
        ...editor.api.nodes<TCommentText>({
          ...options,
          match: (n) => n[BaseCommentsPlugin.key],
        }),
      ];
    },
  }));
