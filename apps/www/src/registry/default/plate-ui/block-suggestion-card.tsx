import React, { useMemo, useState } from 'react';

import {
  type NodeEntry,
  type Path,
  type TElement,
  ElementApi,
  PathApi,
  TextApi,
} from '@udecode/plate';
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
  type TSuggestionText,
  acceptSuggestion,
  findInlineSuggestionNode,
  getAllSuggestionData,
  getAllSuggestionId,
  getInlineSuggestionDataList,
  getInlineSuggestionId,
  getSuggestionData,
  getSuggestionId,
  getSuggestionKey,
  keyId2SuggestionId,
  rejectSuggestion,
} from '@udecode/plate-suggestion';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import {
  type PlateEditor,
  ParagraphPlugin,
  useEditorPlugin,
} from '@udecode/plate/react';
import { CheckIcon, XIcon } from 'lucide-react';

import type { Discussion, TCommentItem } from './block-comments-card';

import { Button } from './button';
import { CommentAvatar, mockUsers } from './comment-avatar';
import { CommentCreateForm } from './comment-create-form';
import { CommentItem, formatCommentDate } from './comment-item';

export interface ResolvedSuggestion extends TResolvedSuggestion {
  comments: TCommentItem[];
}

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

  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div
      key={`${suggestion.suggestionId}-${idx}`}
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex flex-col p-4">
        <div className="relative flex items-center">
          {/* Replace to your own backend or refer to potion */}
          <CommentAvatar userId="1" />
          <h4 className="mx-2 text-sm leading-none font-semibold">
            {mockUsers.find((user: any) => user.id === '1')?.name}
          </h4>
          <div className="text-xs leading-none text-muted-foreground/80">
            <span className="mr-1">
              {formatCommentDate(suggestion.createdAt)}
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

        {suggestion.comments.map((comment, index) => (
          <CommentItem
            key={comment.id ?? index}
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

        <CommentCreateForm
          discussionId={suggestion.suggestionId}
          isSuggesting={suggestion.comments.length === 0}
        />
      </div>

      {!isLast && <div className="h-px w-full bg-muted" />}
    </div>
  );
};

export const useResolveSuggestion = (
  editor: PlateEditor,
  suggestionNodes: NodeEntry<TElement | TSuggestionText>[],
  blockPath: Path
) => {
  const { getOption, setOption } = useEditorPlugin(SuggestionPlugin);

  suggestionNodes.forEach(([node]) => {
    const id = getAllSuggestionId(node);
    const map = getOption('uniquePathMap');

    if (!id) return;

    const previousPath = map.get(id);

    // If there are no suggestion nodes in the corresponding path in the map, then update it.
    if (PathApi.isPath(previousPath)) {
      const nodes = findInlineSuggestionNode(editor, { at: previousPath });
      const parentNode = editor.api.node(previousPath);
      let lineBreakId = null;

      if (parentNode && ElementApi.isElement(parentNode[0])) {
        lineBreakId = getSuggestionId(parentNode[0]);
      }

      if (!nodes && lineBreakId !== id) {
        return setOption('uniquePathMap', new Map(map).set(id, blockPath));
      }

      return;
    }
    setOption('uniquePathMap', new Map(map).set(id, blockPath));
  });

  const resolvedSuggestion: ResolvedSuggestion[] = useMemo(() => {
    const map = getOption('uniquePathMap');

    if (suggestionNodes.length === 0) return [];

    const suggestionIds = new Set(
      suggestionNodes
        .flatMap(([node]) => {
          if (TextApi.isText(node)) {
            const dataList = getInlineSuggestionDataList(node);
            const includeUpdate = dataList.some(
              (data) => data.type === 'update'
            );

            if (!includeUpdate) return getInlineSuggestionId(node);

            return dataList
              .filter((data) => data.type === 'update')
              .map((d) => d.id);
          }
          if (ElementApi.isElement(node)) {
            return getSuggestionId(node);
          }
        })
        .filter(Boolean)
    );

    const res: ResolvedSuggestion[] = [];

    suggestionIds.forEach((id) => {
      if (!id) return;

      const path = map.get(id);

      if (!path || !PathApi.isPath(path)) return;
      if (!PathApi.equals(path, blockPath)) return;

      const entries = [
        ...editor.api.nodes<TElement | TSuggestionText>({
          at: [],
          mode: 'all',
          match: (n) =>
            (n[SuggestionPlugin.key] && n[getSuggestionKey(id)]) ||
            getSuggestionId(n as TElement) === id,
        }),
      ];

      // move line break to the end
      entries.sort(([, path1], [, path2]) => {
        return PathApi.isChild(path1, path2) ? -1 : 1;
      });

      let newText = '';
      let text = '';
      let properties: any = {};
      let newProperties: any = {};

      // overlapping suggestion
      entries.forEach(([node]) => {
        if (TextApi.isText(node)) {
          const dataList = getInlineSuggestionDataList(node);

          dataList.forEach((data) => {
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
                properties = {
                  ...properties,
                  ...data.properties,
                };

                newProperties = {
                  ...newProperties,
                  ...data.newProperties,
                };

                newText += node.text;

                break;
              }
              // No default
            }
          });
        } else {
          const lineBreakData = getSuggestionData(node);

          if (lineBreakData?.id !== keyId2SuggestionId(id)) return;
          if (lineBreakData.type === 'insert') {
            newText += lineBreakData.isLineBreak
              ? BLOCK_SUGGESTION
              : BLOCK_SUGGESTION + TYPE_TEXT_MAP[node.type](node);
          } else if (lineBreakData.type === 'remove') {
            text += lineBreakData.isLineBreak
              ? BLOCK_SUGGESTION
              : BLOCK_SUGGESTION + TYPE_TEXT_MAP[node.type](node);
          }
        }
      });

      if (entries.length === 0) return;

      const nodeData = getAllSuggestionData(entries[0][0]);

      if (!nodeData) return;

      // const comments = data?.discussions.find((d) => d.id === id)?.comments;
      const comments =
        JSON.parse(sessionStorage.getItem('discussions') || '[]').find(
          (s: any) => s.id === id
        )?.comments || [];
      const createdAt = new Date(nodeData.createdAt);

      const keyId = getSuggestionKey(id);

      if (nodeData.type === 'update') {
        return res.push({
          comments,
          createdAt,
          keyId,
          newProperties,
          newText,
          properties,
          suggestionId: keyId2SuggestionId(id),
          type: 'update',
          userId: nodeData.userId,
        });
      }
      if (newText.length > 0 && text.length > 0) {
        return res.push({
          comments,
          createdAt,
          keyId,
          newText,
          suggestionId: keyId2SuggestionId(id),
          text,
          type: 'replace',
          userId: nodeData.userId,
        });
      }
      if (newText.length > 0) {
        return res.push({
          comments,
          createdAt,
          keyId,
          newText,
          suggestionId: keyId2SuggestionId(id),
          type: 'insert',
          userId: nodeData.userId,
        });
      }
      if (text.length > 0) {
        return res.push({
          comments,
          createdAt,
          keyId,
          suggestionId: keyId2SuggestionId(id),
          text,
          type: 'remove',
          userId: nodeData.userId,
        });
      }
    });

    return res;
  }, [blockPath, editor.api, getOption, suggestionNodes]);

  return resolvedSuggestion;
};

export const isResolvedSuggestion = (
  suggestion: Discussion | ResolvedSuggestion
): suggestion is ResolvedSuggestion => {
  return 'suggestionId' in suggestion;
};
