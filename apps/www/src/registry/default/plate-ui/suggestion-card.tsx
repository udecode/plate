import React, { useState } from 'react';

import type {
  EditorNodesOptions,
  SlateEditor,
  TElement,
  ValueOf,
} from '@udecode/plate';

import {
  type TResolvedSuggestion,
  type TSuggestionText,
  acceptSuggestion,
  rejectSuggestion,
  SUGGESTION_KEYS,
} from '@udecode/plate-suggestion';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import { useEditorPlugin } from '@udecode/plate/react';
import { CheckIcon, XIcon } from 'lucide-react';

import { Button } from './button';

export interface ResolvedSuggestion extends TResolvedSuggestion {}

export const LINE_BREAK_SUGGESTION = '__line_break__';

export const getAllSuggestionNodes = <E extends SlateEditor>(
  editor: E,
  { at = [], ...options }: EditorNodesOptions<ValueOf<E>> = {}
) =>
  editor.api.nodes<TElement | TSuggestionText>({
    at,
    mode: 'all',
    match: (n) => n[SuggestionPlugin.key] || n[SUGGESTION_KEYS.lineBreak],
    ...options,
  });

export const BlockSuggestionCard = ({
  idx,
  isLast,
  suggestion,
}: {
  idx: number;
  isLast: boolean;
  suggestion: ResolvedSuggestion;
}) => {
  // const { data: userData } = useQuery(
  //   trpc.user.getUser.queryOptions({ id: suggestion.userId })
  // );

  const { api, editor } = useEditorPlugin(SuggestionPlugin);

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

  const [hovering, setHovering] = useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  return (
    <div
      key={`${suggestion.suggestionId}_${idx}`}
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex flex-col p-4">
        <div className="relative flex items-center">
          {/* <CommentAvatar user={userData} /> */}
          <h4 className="text-sm leading-none font-semibold">
            {/* {userData?.name} */}
          </h4>
          <div className="ml-1.5 text-xs leading-none text-muted-foreground/80">
            <span className="mr-1">
              {suggestion.createdAt.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="relative mt-1 mb-4 pl-[32px]">
          <div className="flex flex-col gap-2">
            {suggestion.type === 'remove' && (
              <React.Fragment>
                {suggestion.text
                  ?.split(LINE_BREAK_SUGGESTION)
                  .map((text, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Delete:
                      </span>

                      <span key={index} className="text-sm">
                        {text || 'line breaks'}
                      </span>
                    </div>
                  ))}
              </React.Fragment>
            )}

            {suggestion.type === 'insert' && (
              <React.Fragment>
                {suggestion.newText
                  ?.split(LINE_BREAK_SUGGESTION)
                  .map((text, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Add:
                      </span>

                      <span key={index} className="text-sm">
                        {text || 'line breaks'}
                      </span>
                    </div>
                  ))}
              </React.Fragment>
            )}

            {suggestion.type === 'replace' && (
              <div className="flex flex-col gap-2">
                {suggestion.newText
                  ?.split(LINE_BREAK_SUGGESTION)
                  .map((text, index) => (
                    <React.Fragment key={index}>
                      <div
                        key={index}
                        className="flex items-center text-brand/80"
                      >
                        <span className="text-sm">with:</span>
                        <span className="text-sm">{text || 'line breaks'}</span>
                      </div>
                    </React.Fragment>
                  ))}

                {suggestion.text
                  ?.split(LINE_BREAK_SUGGESTION)
                  .map((text, index) => (
                    <React.Fragment key={index}>
                      <div key={index} className="flex items-center">
                        <span className="text-sm text-muted-foreground">
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
                <span className="text-sm text-muted-foreground">
                  {Object.keys(suggestion.updateProps).map((key) => (
                    <span key={key}>
                      {suggestion.updateProps[key] ? key : 'Un' + key}
                    </span>
                  ))}
                </span>
                <span className="text-sm">{suggestion.newText}</span>
              </div>
            )}
          </div>
        </div>

        {/* {suggestion.comments.map((comment, index) => (
          <CommentItem
            key={comment.id ?? index}
            comment={comment}
            discussionLength={suggestion.comments.length}
            documentContent="__suggestion__"
            editingId={editingId}
            index={index}
            setEditingId={setEditingId}
          />
        ))} */}

        {hovering && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              className="h-6 p-1 text-muted-foreground"
              onClick={() => accept(suggestion)}
            >
              <CheckIcon className="size-4" />
            </Button>

            <Button
              variant="ghost"
              className="h-6 p-1 text-muted-foreground"
              onClick={() => reject(suggestion)}
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        )}

        {/* <CommentCreateForm
          discussionId={suggestion.suggestionId}
          isSuggesting={suggestion.comments.length === 0}
        /> */}
      </div>

      {!isLast && <div className="h-px w-full bg-muted" />}
    </div>
  );
};
