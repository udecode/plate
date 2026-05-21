'use client';

import { acceptSuggestion, rejectSuggestion } from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { CheckIcon, XIcon } from 'lucide-react';
import { useEditorPlugin, usePluginOption } from 'platejs/react';
import * as React from 'react';
import {
  discussionPlugin,
  type TDiscussion,
} from '@/components/editor/plugins/discussion-kit';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  BLOCK_SUGGESTION_TOKEN,
  type ResolvedSuggestion,
} from '@/lib/block-discussion-index';
import { Comment, CommentCreateForm, formatCommentDate } from './comment';

export function BlockSuggestionCard({
  idx,
  isLast,
  suggestion,
}: {
  idx: number;
  isLast: boolean;
  suggestion: ResolvedSuggestion;
}) {
  const { api, editor } = useEditorPlugin(SuggestionPlugin);

  const userInfo = usePluginOption(discussionPlugin, 'user', suggestion.userId);

  const accept = (suggestion: ResolvedSuggestion) => {
    api.suggestion.withoutSuggestions(() => {
      acceptSuggestion(editor, suggestion);
    });
  };

  const reject = (suggestion: ResolvedSuggestion) => {
    api.suggestion.withoutSuggestions(() => {
      rejectSuggestion(editor, suggestion);
    });
  };

  const [hovering, setHovering] = React.useState(false);

  const suggestionText2Array = (text: string) => {
    if (text === BLOCK_SUGGESTION_TOKEN) return ['line breaks'];

    return text.split(BLOCK_SUGGESTION_TOKEN).filter(Boolean);
  };

  const getRemoveSummaryItems = (text: string) => {
    const items = suggestionText2Array(text).map((item) => {
      if (item === 'column_group') return 'Column';
      if (item === 'code_block') return 'Code Block';

      return item;
    });

    if (items.includes('Table')) return ['Table'];
    if (items.includes('Code Block')) return ['Code Block'];
    if (items.includes('Column')) return ['Column'];

    return items;
  };

  const [editingId, setEditingId] = React.useState<string | null>(null);

  return (
    <div
      className="relative"
      key={`${suggestion.suggestionId}-${idx}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex flex-col p-4">
        <div className="relative flex items-center">
          {/* Replace to your own backend or refer to potion */}
          <Avatar className="size-5">
            <AvatarImage alt={userInfo?.name} src={userInfo?.avatarUrl} />
            <AvatarFallback>{userInfo?.name?.[0]}</AvatarFallback>
          </Avatar>
          <h4 className="mx-2 font-semibold text-sm leading-none">
            {userInfo?.name}
          </h4>
          <div className="text-muted-foreground/80 text-xs leading-none">
            <span className="mr-1">
              {formatCommentDate(new Date(suggestion.createdAt))}
            </span>
          </div>
        </div>

        <div className="relative mt-1 mb-4 pl-[32px]">
          <div className="flex flex-col gap-2">
            {suggestion.type === 'remove' &&
              getRemoveSummaryItems(suggestion.text!).map((text, index) => (
                <div className="flex items-center gap-2" key={index}>
                  <span className="text-muted-foreground text-sm">Delete:</span>

                  <span className="text-sm" key={index}>
                    {text}
                  </span>
                </div>
              ))}

            {suggestion.type === 'insert' &&
              suggestionText2Array(suggestion.newText!).map((text, index) => (
                <div className="flex items-center gap-2" key={index}>
                  <span className="text-muted-foreground text-sm">Add:</span>

                  <span className="text-sm" key={index}>
                    {text || 'line breaks'}
                  </span>
                </div>
              ))}

            {suggestion.type === 'replace' && (
              <div className="flex flex-col gap-2">
                {suggestionText2Array(suggestion.newText!).map(
                  (text, index) => (
                    <React.Fragment key={index}>
                      <div
                        className="flex items-start gap-2 text-brand/80"
                        key={index}
                      >
                        <span className="text-sm">with:</span>
                        <span className="text-sm">{text || 'line breaks'}</span>
                      </div>
                    </React.Fragment>
                  )
                )}

                {suggestionText2Array(suggestion.text!).map((text, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-start gap-2" key={index}>
                      <span className="text-muted-foreground text-sm">
                        {index === 0 ? 'Replace:' : 'Delete:'}
                      </span>
                      <span className="text-sm">{text || 'line breaks'}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}

            {suggestion.type === 'update' && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  {Object.keys(suggestion.properties).map((key) => (
                    <span key={key}>Un{key}</span>
                  ))}

                  {Object.keys(suggestion.newProperties).map((key) => (
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
            comment={comment}
            discussionLength={suggestion.comments.length}
            documentContent="__suggestion__"
            editingId={editingId}
            index={index}
            key={comment.id ?? index}
            setEditingId={setEditingId}
          />
        ))}

        {hovering && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              className="size-6 p-1 text-muted-foreground"
              onClick={() => accept(suggestion)}
              variant="ghost"
            >
              <CheckIcon className="size-4" />
            </Button>

            <Button
              className="size-6 p-1 text-muted-foreground"
              onClick={() => reject(suggestion)}
              variant="ghost"
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
): suggestion is ResolvedSuggestion => 'suggestionId' in suggestion;
