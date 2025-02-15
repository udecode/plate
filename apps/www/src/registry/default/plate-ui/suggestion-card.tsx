import React, { useState } from 'react';

import type { TElement } from '@udecode/plate';

import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CalloutPlugin } from '@udecode/plate-callout/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { TocPlugin } from '@udecode/plate-heading/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { INDENT_LIST_KEYS, ListStyleType } from '@udecode/plate-indent-list';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { ColumnPlugin } from '@udecode/plate-layout/react';
import { EquationPlugin } from '@udecode/plate-math/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  VideoPlugin,
} from '@udecode/plate-media/react';
import {
  type TResolvedSuggestion,
  acceptSuggestion,
  rejectSuggestion,
} from '@udecode/plate-suggestion';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { ParagraphPlugin, useEditorPlugin } from '@udecode/plate/react';
import { CheckIcon, XIcon } from 'lucide-react';

import { Button } from './button';
import { CommentAvatar } from './comment-avatar';

export interface ResolvedSuggestion extends TResolvedSuggestion {}

export const BLOCK_SUGGESTION = '__block__';

export const TYPE_TEXT_MAP: Record<string, (node?: TElement) => string> = {
  [AudioPlugin.key]: () => 'Audio',
  [BlockquotePlugin.key]: () => 'Blockquote',
  [CalloutPlugin.key]: () => 'Callout',
  [CodeBlockPlugin.key]: () => 'Code Block',
  [ColumnPlugin.key]: () => 'Column',
  [EquationPlugin.key]: () => 'Equation',
  [FilePlugin.key]: () => 'File',
  [HEADING_KEYS.h1]: () => `Heading 1`,
  [HEADING_KEYS.h2]: () => `Heading 2`,
  [HEADING_KEYS.h3]: () => `Heading 3`,
  [HEADING_KEYS.h4]: () => `Heading 4`,
  [HEADING_KEYS.h5]: () => `Heading 5`,
  [HEADING_KEYS.h6]: () => `Heading 6`,
  [HorizontalRulePlugin.key]: () => 'Horizontal Rule',
  [ImagePlugin.key]: () => 'Image',
  [MediaEmbedPlugin.key]: () => 'Media',
  [ParagraphPlugin.key]: (node) => {
    if (node?.[IndentListPlugin.key] === INDENT_LIST_KEYS.todo)
      return 'Todo List';
    if (node?.[IndentListPlugin.key] === ListStyleType.Decimal)
      return 'Ordered List';
    if (node?.[IndentListPlugin.key] === ListStyleType.Disc) return 'List';

    return 'Paragraph';
  },
  [TablePlugin.key]: () => 'Table',
  [TocPlugin.key]: () => 'Table of Contents',
  [TogglePlugin.key]: () => 'Toggle',
  [VideoPlugin.key]: () => 'Video',
};

const mockUsers = {
  1: {
    id: '1',
    avatarUrl: 'https://avatars.githubusercontent.com/u/19695832?s=96&v=4',
    name: 'zbeyens',
  },
  2: {
    id: '2',
    avatarUrl: 'https://avatars.githubusercontent.com/u/4272090?v=4',
    name: '12joan',
  },
};

export const BlockSuggestionCard = ({
  idx,
  isLast,
  suggestion,
}: {
  idx: number;
  isLast: boolean;
  suggestion: ResolvedSuggestion;
}) => {
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

  const suggestionText2Array = (text: string) => {
    if (text === BLOCK_SUGGESTION) return ['line breaks'];

    return text.split(BLOCK_SUGGESTION).filter(Boolean);
  };

  return (
    <div
      key={`${suggestion.suggestionId}_${idx}`}
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex flex-col p-4">
        <div className="relative flex items-center">
          <CommentAvatar userId={mockUsers['1'].id} />
          <h4 className="text-sm leading-none font-semibold"></h4>
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
                {suggestionText2Array(suggestion.text!).map((text, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Delete:
                    </span>

                    <span key={index} className="text-sm">
                      {text}
                    </span>
                  </div>
                ))}
              </React.Fragment>
            )}

            {suggestion.type === 'insert' && (
              <React.Fragment>
                {suggestionText2Array(suggestion.newText!).map(
                  (text, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Add:
                      </span>

                      <span key={index} className="text-sm">
                        {text || 'line breaks'}
                      </span>
                    </div>
                  )
                )}
              </React.Fragment>
            )}

            {suggestion.type === 'replace' && (
              <div className="flex flex-col gap-2">
                {suggestionText2Array(suggestion.newText!).map(
                  (text, index) => (
                    <React.Fragment key={index}>
                      <div
                        key={index}
                        className="flex items-center text-brand/80"
                      >
                        <span className="text-sm">with:</span>
                        <span className="text-sm">{text || 'line breaks'}</span>
                      </div>
                    </React.Fragment>
                  )
                )}

                {suggestionText2Array(suggestion.text!).map((text, index) => (
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
