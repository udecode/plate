'use client';

import React, { useContext, useEffect, useMemo } from 'react';

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
import { Plate, useEditorRef } from '@udecode/plate/react';
import { type CreatePlateEditorOptions, PlateLeaf } from '@udecode/plate/react';
import { ArrowUpIcon } from 'lucide-react';

import type { TDiscussion } from './block-discussion';

import { useCreateEditor } from '../components/editor/use-create-editor';
import { AILeaf } from './ai-leaf';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { ForceUpdateContext } from './block-discussion';
import { mockUsers } from './block-suggestion';
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
  const forceUpdate = useContext(ForceUpdateContext);
  const editor = useEditorRef();
  const discussionId = useCommentId() ?? discussionIdProp;
  const [resetKey, setResetKey] = React.useState(0);

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
      const discussions = JSON.parse(
        sessionStorage.getItem('discussions') || '[]'
      );
      const discussion = discussions.find((d: any) => d.id === discussionId);

      if (!discussion) return;

      // Create reply comment
      const reply = {
        id: nanoid(),
        contentRich: commentValue,
        createdAt: new Date(),
        discussionId,
        isEdited: false,
        userId: '1',
      };

      // Add reply to discussion comments
      discussion.comments.push(reply);
      sessionStorage.setItem('discussions', JSON.stringify(discussions));

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
          userId: '1',
        },
      ],
      createdAt: new Date(),
      documentContent,
      isResolved: false,
      userId: '1',
    };

    const discussions = JSON.parse(
      sessionStorage.getItem('discussions') || '[]'
    );
    discussions.push(newDiscussion);
    sessionStorage.setItem('discussions', JSON.stringify(discussions));

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
  }, [discussionId, editor, commentValue]);

  const onAddSuggestion = React.useCallback(async () => {
    if (!discussionId) return;

    // Mock creating suggestion
    const suggestion = {
      id: discussionId,
      comments: [
        {
          id: nanoid(),
          contentRich: commentValue!,
          createdAt: new Date(),
          discussionId,
          isEdited: false,
          userId: '1',
        },
      ],
      createdAt: new Date(),
      documentContent: commentValue,
      isResolved: false,
      userId: '1',
    };

    const discussions = JSON.parse(
      sessionStorage.getItem('discussions') || '[]'
    );
    discussions.push(suggestion);
    sessionStorage.setItem('discussions', JSON.stringify(discussions));
  }, [discussionId, commentValue]);

  return (
    <div className={cn('flex w-full', className)}>
      <div className="mt-1 mr-1 shrink-0">
        {/* Replace to your own backend or refer to potion */}
        <Avatar className="size-6">
          <AvatarImage
            alt={mockUsers.find((user: any) => user.id === '1')?.name}
            src={mockUsers.find((user: any) => user.id === '1')?.avatarUrl}
          />
          <AvatarFallback>
            {mockUsers.find((user: any) => user.id === '1')?.name?.[0]}
          </AvatarFallback>
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
                forceUpdate?.();
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
