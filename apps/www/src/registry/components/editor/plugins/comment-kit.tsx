'use client';

import type { ExtendConfig, Path } from 'platejs';

import {
  type BaseCommentConfig,
  BaseCommentPlugin,
  getDraftCommentKey,
} from '@platejs/comment';
import { toTPlatePlugin } from 'platejs/react';

import { getAnnotationClickTarget } from '@/registry/lib/get-annotation-click-target';
import { CommentLeaf } from '@/registry/ui/comment-node';

type CommentConfig = ExtendConfig<
  BaseCommentConfig,
  {
    activeId: string | null;
    commentingBlock: Path | null;
    hoverId: string | null;
  }
>;

export const commentPlugin = toTPlatePlugin<CommentConfig>(BaseCommentPlugin, {
  handlers: {
    onClick: ({ api, event, setOption, type }) => {
      const activeTarget = getAnnotationClickTarget({
        target: event.target,
        type,
      });

      if (!activeTarget) {
        setOption('activeId', null);
        return;
      }

      const commentEntry = api.comment?.node();

      setOption(
        'activeId',
        commentEntry ? (api.comment?.nodeId(commentEntry[0]) ?? null) : null
      );
    },
  },
  options: {
    activeId: null,
    commentingBlock: null,
    hoverId: null,
  },
})
  .extendTransforms(
    ({
      editor,
      setOption,
      tf: {
        comment: { setDraft },
      },
    }) => ({
      setDraft: () => {
        if (editor.api.isCollapsed()) {
          editor.tf.select(editor.api.block()![1]);
        }

        setDraft();

        editor.tf.collapse();
        setOption('activeId', getDraftCommentKey());
        setOption('commentingBlock', editor.selection!.focus.path.slice(0, 1));
      },
    })
  )
  .configure({
    node: { component: CommentLeaf },
    shortcuts: {
      setDraft: { keys: 'mod+shift+m' },
    },
  });

export const CommentKit = [commentPlugin];
