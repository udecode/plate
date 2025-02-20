'use client';

import React, { useEffect, useMemo } from 'react';

import { cn, withProps } from '@udecode/cn';
import { type Value, nanoid, NodeApi } from '@udecode/plate';
import { AIPlugin } from '@udecode/plate-ai/react';
import {
  BasicMarksPlugin,
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { getCommentKey, getDraftCommentKey } from '@udecode/plate-comments';
import { CommentsPlugin, useCommentId } from '@udecode/plate-comments/react';
import { DatePlugin } from '@udecode/plate-date/react';
import { EmojiInputPlugin } from '@udecode/plate-emoji/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { InlineEquationPlugin } from '@udecode/plate-math/react';
import {
  MentionInputPlugin,
  MentionPlugin,
} from '@udecode/plate-mention/react';
import { Plate, useEditorRef, useStoreSelect } from '@udecode/plate/react';
import { type CreatePlateEditorOptions, PlateLeaf } from '@udecode/plate/react';
import { ArrowUpIcon } from 'lucide-react';

import { useCreateEditor } from '@/components/editor/use-create-editor';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/plate-ui/avatar';

import type { TDiscussion } from './block-discussion';
import type { TComment } from './comment';

import { AILeaf } from './ai-leaf';
import {
  discussionStore,
  useFakeCurrentUserId,
  useFakeUserInfo,
} from './block-discussion';
import { Button } from './button';
import { DateElement } from './date-element';
import { Editor, EditorContainer } from './editor';
import { EmojiInputElement } from './emoji-input-element';
import { InlineEquationElement } from './inline-equation-element';
import { LinkElement } from './link-element';
import { MentionElement } from './mention-element';
import { MentionInputElement } from './mention-input-element';

export const useCommentEditor = (
  options: Omit<CreatePlateEditorOptions, 'plugins'> = {},
  deps: any[] = []
) => {
  const commentEditor = useCreateEditor(
    {
      id: 'comment',
      override: {
        components: {
          [AIPlugin.key]: AILeaf,
          [BoldPlugin.key]: withProps(PlateLeaf, { as: 'strong' }),
          [DatePlugin.key]: DateElement,
          [EmojiInputPlugin.key]: EmojiInputElement,
          [InlineEquationPlugin.key]: InlineEquationElement,
          [ItalicPlugin.key]: withProps(PlateLeaf, { as: 'em' }),
          [LinkPlugin.key]: LinkElement,
          [MentionInputPlugin.key]: MentionInputElement,
          [MentionPlugin.key]: MentionElement,
          [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: 's' }),
          [UnderlinePlugin.key]: withProps(PlateLeaf, { as: 'u' }),
          // [SlashInputPlugin.key]: SlashInputElement,
        },
      },
      plugins: [BasicMarksPlugin],
      value: [],
      ...options,
    },
    deps
  );

  return commentEditor;
};

export function CommentCreateForm({
  autoFocus = false,
  className,
  discussionId: discussionIdProp,
  focusOnMount = false,
  isSuggesting,
}: {
  autoFocus?: boolean;
  className?: string;
  discussionId?: string;
  focusOnMount?: boolean;
  isSuggesting?: boolean;
}) {
  const discussions = useStoreSelect(
    discussionStore,
    (state) => state.discussions
  );

  const editor = useEditorRef();
  const discussionId = useCommentId() ?? discussionIdProp;
  const [resetKey, setResetKey] = React.useState(0);

  const currentUserId = useFakeCurrentUserId();
  const userInfo = useFakeUserInfo(currentUserId);
  const [commentValue, setCommentValue] = React.useState<Value | undefined>();
  const commentContent = useMemo(
    () =>
      commentValue
        ? NodeApi.string({ children: commentValue as any, type: 'p' })
        : '',
    [commentValue]
  );
  const commentEditor = useCommentEditor({}, [resetKey]);

  useEffect(() => {
    if (commentEditor && focusOnMount) {
      commentEditor.tf.focus();
    }
  }, [commentEditor, focusOnMount]);

  const onAddComment = React.useCallback(async () => {
    setResetKey((prev) => prev + 1);

    if (discussionId) {
      // Get existing discussion
      const discussion = discussions.find((d: any) => d.id === discussionId);

      if (!discussion || !commentValue) return;

      // Create reply comment
      const comment: TComment = {
        id: nanoid(),
        contentRich: commentValue,
        createdAt: new Date(),
        discussionId,
        isEdited: false,
        // mock user id
        userId: currentUserId,
      };

      // Add reply to discussion comments
      const updatedDiscussion = {
        ...discussion,
        comments: [...discussion.comments, comment],
      };

      // Filter out old discussion and add updated one
      const updatedDiscussions = discussions
        .filter((d: any) => d.id !== discussionId)
        .concat(updatedDiscussion);

      discussionStore.set('discussions', updatedDiscussions);

      return;
    }

    const commentsNodeEntry = editor
      .getApi(CommentsPlugin)
      .comment.nodes({ at: [], isDraft: true });

    if (commentsNodeEntry.length === 0) return;

    const documentContent = commentsNodeEntry
      .map(([node]) => node.text)
      .join('');

    const _discussionId = nanoid();
    // Mock creating new discussion
    const newDiscussion: TDiscussion = {
      id: _discussionId,
      comments: [
        {
          id: nanoid(),
          contentRich: commentValue!,
          createdAt: new Date(),
          discussionId: _discussionId,
          isEdited: false,
          userId: currentUserId,
        },
      ],
      createdAt: new Date(),
      documentContent,
      isResolved: false,
      userId: currentUserId,
    };

    // Update discussions store
    discussionStore.set('discussions', [...discussions, newDiscussion]);

    const id = newDiscussion.id;

    commentsNodeEntry.forEach(([_, path]) => {
      editor.tf.setNodes(
        {
          [getCommentKey(id)]: true,
        },
        { at: path, split: true }
      );
      editor.tf.unsetNodes([getDraftCommentKey()], { at: path });
    });
  }, [discussionId, editor, commentValue, currentUserId, discussions]);

  const onAddSuggestion = React.useCallback(async () => {
    if (!discussionId) return;

    if (!commentValue) return;

    // Mock creating suggestion
    const suggestion: TDiscussion = {
      id: discussionId,
      comments: [
        {
          id: nanoid(),
          contentRich: commentValue!,
          createdAt: new Date(),
          discussionId,
          isEdited: false,
          userId: 'user1',
        },
      ],
      createdAt: new Date(),
      isResolved: false,
      userId: 'user1',
    };

    // Update discussions store
    discussionStore.set('discussions', [...discussions, suggestion]);
  }, [discussionId, commentValue, discussions]);

  return (
    <div className={cn('flex w-full', className)}>
      <div className="mt-1 mr-1 shrink-0">
        {/* Replace to your own backend or refer to potion */}
        <Avatar className="size-6">
          <AvatarImage alt={userInfo?.name} src={userInfo?.avatarUrl} />
          <AvatarFallback>{userInfo?.name?.[0]}</AvatarFallback>
        </Avatar>
      </div>

      <div className="relative flex grow gap-2">
        <Plate
          onChange={({ value }) => {
            setCommentValue(value);
          }}
          editor={commentEditor}
        >
          <EditorContainer variant="comment">
            <Editor
              variant="comment"
              className="min-h-[25px] grow pt-0.5 pr-8"
              placeholder="Reply..."
              autoComplete="off"
              autoFocus={autoFocus}
            />

            <Button
              size="icon"
              variant="ghost"
              className="absolute right-0 bottom-0 ml-auto shrink-0"
              disabled={commentContent.trim().length === 0}
              onClick={(e) => {
                e.stopPropagation();

                if (isSuggesting) {
                  void onAddSuggestion();
                } else {
                  void onAddComment();
                }
              }}
            >
              <div className="flex size-6 items-center justify-center rounded-full">
                <ArrowUpIcon />
              </div>
            </Button>
          </EditorContainer>
        </Plate>
      </div>
    </div>
  );
}
