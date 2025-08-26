'use client';

import { cn } from '@/lib/utils';
import {
  applyAIReview,
  useEditorCompletion,
  useAIEditorReview,
  getAIReviewCommentKey,
} from '@platejs/ai/react';
import { useMemo, useState, useEffect } from 'react';
import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';
import { PlateEditor, useEditorRef, usePlateViewEditor } from 'platejs/react';
import {
  convertChildrenDeserialize,
  MarkdownPlugin,
  MdMdxJsxTextElement,
  parseAttributes,
} from '@platejs/markdown';
import {
  getPluginType,
  KEYS,
  NodeApi,
  PathApi,
  SlateEditor,
  TCommentText,
  TElement,
  Text,
  TextApi,
  nanoid,
  type Value,
} from 'platejs';
import { EditorStatic } from './editor-static';
import { EditorView } from './editor';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Loader2Icon, XIcon } from 'lucide-react';
import { discussionPlugin } from '@/registry/components/editor/plugins/discussion-kit';
import { getCommentKey } from '@platejs/comment';

export function AIReviewPreview() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const editor = useEditorRef();
  const { isLoading, completion, stop } = useEditorCompletion();

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const previewEditor = usePlateViewEditor({
    plugins: BaseEditorKit,
  });

  useAIEditorReview(previewEditor, completion);

  const handleReject = () => {
    setIsExpanded(false);
    setIsVisible(false);
  };

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
    }
  }, [isLoading]);

  const isFinished = useMemo(() => {
    return !isLoading && !!completion;
  }, [isLoading, completion]);

  useEffect(() => {
    if (isFinished && isVisible) {
      setIsExpanded(true);

      console.log('completion', completion);
    }
  }, [isFinished]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-0 rounded-xl border border-border/50 bg-background/95 p-3 text-sm text-muted-foreground shadow-xl backdrop-blur-sm transition-all duration-300 ease-in-out',
        isExpanded && 'max-w-4xl min-w-[600px]',
        'hover:border-border/70 hover:shadow-2xl'
      )}
    >
      {/* Header with controls */}
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isFinished && (
            <Button
              onClick={() =>
                applyAIReview(editor, previewEditor, {
                  onComment({ content, range, text }) {
                    // 获取当前讨论数据
                    const discussions = editor.getOption(discussionPlugin, 'discussions') || [];
                    
                    // 生成新的讨论ID
                    const discussionId = nanoid();
                      
                    // 创建新的评论
                    const comment = {
                      id: nanoid(),
                      contentRich: [{ type: 'p', children: [{ text: content }] }],
                      createdAt: new Date(),
                      discussionId,
                      isEdited: false,
                      userId: editor.getOption(discussionPlugin, 'currentUserId'),
                    };

                    // 创建新的讨论
                    const newDiscussion = {
                      id: discussionId,
                      comments: [comment],
                      createdAt: new Date(),
                      documentContent: text,
                      isResolved: false,
                      userId: editor.getOption(discussionPlugin, 'currentUserId'),
                    };

                    // 更新讨论数据
                    const updatedDiscussions = [...discussions, newDiscussion];
                    editor.setOption(discussionPlugin, 'discussions', updatedDiscussions);


                    // 在编辑器中应用评论标记
                    editor.tf.setNodes(
                      {
                        [KEYS.comment]: true,
                        [getCommentKey(newDiscussion.id)]: true,
                      },
                      {
                        at: range,
                        match: TextApi.isText,
                        split: true,
                      }
                    );
                  },
                })
              }
              size="sm"
              disabled={isLoading}
            >
              Accept
            </Button>
          )}

          {isFinished && (
            <Button onClick={handleReject} size="sm" disabled={isLoading}>
              Reject
            </Button>
          )}

          {!isFinished && (
            <div className="flex grow items-center gap-2 p-2 text-sm text-muted-foreground select-none">
              <Loader2Icon className="size-4 animate-spin" />
              AI Review in Progress
            </div>
          )}
        </div>

        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105 hover:bg-muted/50"
            aria-label={isExpanded ? 'Collapse preview' : 'Expand preview'}
          >
            {!isExpanded ? (
              <ChevronUp className="h-4 w-4 transition-transform duration-200" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isFinished) {
                handleReject();
              } else {
                stop();
                setIsVisible(false);
                setIsExpanded(false);
              }
            }}
            className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105 hover:bg-muted/50"
            aria-label={isExpanded ? 'Collapse preview' : 'Expand preview'}
          >
            <XIcon className="h-4 w-4 transition-transform duration-200" />
          </Button>
        </div>
      </div>

      {/* Expandable content */}
      <div
        className={cn(
          'w-full overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {isExpanded && (
          <div className="mt-4 w-full">
            <div className="rounded-lg border border-border/50 bg-muted/20 p-4 shadow-inner">
              <EditorView variant="aiChat" editor={previewEditor} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
