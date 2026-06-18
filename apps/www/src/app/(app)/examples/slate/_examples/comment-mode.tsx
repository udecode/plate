import { cva } from 'class-variance-authority';
import {
  type Dispatch,
  type PointerEvent,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Bookmark, Editor, Range, Value } from '@platejs/slate';
import {
  Editable,
  type react,
  Slate,
  type SlateAnnotationStore,
  useEditorSelection,
  useSlateAnnotationStore,
  useSlateAnnotations,
  useSlateEditor,
  useSlateWidgetStore,
  useSlateWidgets,
} from '@platejs/slate-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import { Instruction } from './components';

type CommentStatus = 'open' | 'resolved';
type CommentTone = 'question' | 'review';

type CommentThread = {
  anchor: Bookmark;
  body: string;
  id: string;
  label: string;
  status: CommentStatus;
  tone: CommentTone;
};

type CommentData = {
  body: string;
  label: string;
  status: CommentStatus;
  tone: CommentTone;
};

type CommentProjection = {
  status: CommentStatus;
  tone: CommentTone;
};

type CommentVisualState = 'question' | 'resolved' | 'review';

type CommentEditor = Editor<Value, readonly [ReturnType<typeof react>]>;

const initialValue: Value = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Comment mode in Slate v2 uses bookmark-backed annotations instead of trying to smuggle durable state through decorate.',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Select text in comment mode, add a comment, then edit the document to watch the anchor, inline highlight, sidebar, and widget stay in sync.',
      },
    ],
  },
];

const cloneValue = (value: Value): Value =>
  JSON.parse(JSON.stringify(value)) as Value;

const isCollapsed = (range: Range | null) =>
  !range ||
  (range.anchor.path.join('.') === range.focus.path.join('.') &&
    range.anchor.offset === range.focus.offset);

const formatRange = (range: Range | null) =>
  range
    ? `${range.anchor.path.join('.')}:${range.anchor.offset}|${range.focus.path.join('.')}:${range.focus.offset}`
    : 'none';

const commentVisualState = (
  tone: CommentTone,
  status: CommentStatus
): CommentVisualState => (status === 'resolved' ? 'resolved' : tone);

const commentHighlightVariants = cva('slate-comment-mode-highlight', {
  variants: {
    overlap: {
      false: 'slate-comment-mode-highlight-single',
      true: 'slate-comment-mode-highlight-overlap',
    },
    state: {
      question: 'slate-comment-mode-highlight-question',
      resolved: 'slate-comment-mode-highlight-resolved',
      review: 'slate-comment-mode-highlight-review',
    },
  },
});

const commentToneBadgeVariants = cva('slate-comment-mode-tone-badge', {
  variants: {
    state: {
      question: 'is-question',
      resolved: 'is-resolved',
      review: 'is-review',
    },
  },
});

const createCommentAnnotations = (comments: readonly CommentThread[]) =>
  comments.map((comment) => ({
    anchor: comment.anchor,
    data: {
      body: comment.body,
      label: comment.label,
      status: comment.status,
      tone: comment.tone,
    },
    id: comment.id,
    projection: {
      status: comment.status,
      tone: comment.tone,
    },
  }));

const CommentedEditable = ({
  id,
  readOnly = false,
}: {
  id: string;
  readOnly?: boolean;
}) => (
  <Editable
    className="slate-comment-mode-editor"
    id={id}
    readOnly={readOnly}
    renderSegment={(segment, children) => {
      if (segment.slices.length === 0) {
        return children;
      }

      const firstSlice =
        (segment.slices[0]?.data as
          | {
              status?: CommentStatus;
              tone?: CommentTone;
            }
          | undefined) ?? null;

      return (
        <span
          className={cn(
            commentHighlightVariants({
              overlap: segment.slices.length > 1,
              state: commentVisualState(
                firstSlice?.tone ?? 'review',
                firstSlice?.status ?? 'open'
              ),
            })
          )}
          data-comment-count={String(segment.slices.length)}
          data-comment-status={firstSlice?.status ?? 'open'}
          data-comment-tone={firstSlice?.tone ?? 'review'}
        >
          {children}
        </span>
      );
    }}
  />
);

const WriterPane = ({ editor }: { editor: CommentEditor }) => {
  const selection = useEditorSelection();
  const annotationSnapshot = useSlateAnnotations<
    CommentData,
    CommentProjection
  >();
  const firstAnnotation =
    annotationSnapshot.allIds[0] == null
      ? null
      : (annotationSnapshot.byId.get(annotationSnapshot.allIds[0]) ?? null);

  const insertPrefixBeforeFirstComment = () => {
    if (!firstAnnotation?.range) {
      return;
    }

    const path = firstAnnotation.range.anchor.path;

    editor.update((tx) => {
      tx.text.insert('>', {
        at: {
          offset: 0,
          path,
        },
      });
    });
  };

  const insertParagraphBeforeFirstComment = () => {
    if (!firstAnnotation?.range) {
      return;
    }

    const at = {
      offset: 0,
      path: firstAnnotation.range.anchor.path,
    };

    editor.update((tx) => {
      tx.selection.set({
        anchor: at,
        focus: at,
      });
      tx.nodes.insert(
        [
          {
            type: 'paragraph',
            children: [
              { text: 'Inserted review context before the first comment.' },
            ],
          },
        ],
        { at }
      );
    });
  };

  return (
    <div className="slate-comment-mode-pane slate-comment-mode-writer-pane">
      <div className="slate-comment-mode-pane-header">
        <span className="slate-comment-mode-title">Edit mode</span>
        <span className="slate-comment-mode-muted">
          document writes enabled
        </span>
      </div>
      <CommentedEditable id="comment-mode-document" />
      <div className="slate-comment-mode-controls">
        <Button
          disabled={!firstAnnotation?.range}
          onClick={insertPrefixBeforeFirstComment}
          type="button"
          variant="outline"
        >
          Insert prefix before first comment
        </Button>
        <Button
          disabled={!firstAnnotation?.range}
          onClick={insertParagraphBeforeFirstComment}
          type="button"
          variant="outline"
        >
          Insert paragraph before first comment
        </Button>
        <span className="slate-comment-mode-code">
          selection:{formatRange(selection)}
        </span>
      </div>
    </div>
  );
};

const CommentModePane = ({
  annotationStore,
  comments,
  editor,
  onCommentWrite,
  setComments,
  writerEditor,
}: {
  annotationStore: SlateAnnotationStore<CommentData, CommentProjection>;
  comments: readonly CommentThread[];
  editor: CommentEditor;
  onCommentWrite: () => void;
  setComments: Dispatch<SetStateAction<CommentThread[]>>;
  writerEditor: CommentEditor;
}) => {
  const nextCommentId = useRef(1);
  const selection = useEditorSelection();
  const annotationSnapshot = useSlateAnnotations<
    CommentData,
    CommentProjection
  >();
  const widgetStore = useSlateWidgetStore(editor, {
    annotationStore,
    deps: [comments],
    project: () =>
      comments.map((comment) => ({
        anchor: {
          annotationId: comment.id,
          type: 'annotation' as const,
        },
        data: {
          label: comment.label,
          tone: comment.tone,
        },
        id: `${comment.id}-widget`,
      })),
  });
  const widgetSnapshot = useSlateWidgets(widgetStore);
  const commentsRef = useRef(comments);

  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  useEffect(
    () => () => {
      commentsRef.current.forEach((comment) => {
        comment.anchor.unref();
      });
    },
    []
  );

  const createComment = (range: Range) => {
    const id = `comment-${nextCommentId.current}`;
    const tone: CommentTone =
      nextCommentId.current % 2 === 0 ? 'question' : 'review';
    const snippet =
      writerEditor
        .read((state) => state.text.string(range))
        .replace(/\s+/g, ' ')
        .trim() || 'selection';
    const anchor = writerEditor.read((state) => state.ranges.bookmark(range));

    nextCommentId.current += 1;
    onCommentWrite();
    setComments((current) => [
      ...current,
      {
        anchor,
        body: `Discuss: ${snippet.slice(0, 56)}`,
        id,
        label: `Comment ${current.length + 1}`,
        status: 'open',
        tone,
      },
    ]);
  };

  const addComment = () => {
    if (!selection || isCollapsed(selection)) {
      return;
    }

    createComment(selection);
  };

  const seedComment = () => {
    createComment({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 24 },
    });
  };

  const removeComment = (id: string) => {
    onCommentWrite();
    setComments((current) => {
      const target = current.find((comment) => comment.id === id);

      target?.anchor.unref();

      return current.filter((comment) => comment.id !== id);
    });
  };

  const clearComments = () => {
    onCommentWrite();
    setComments((current) => {
      current.forEach((comment) => {
        comment.anchor.unref();
      });

      return [];
    });
  };

  const retoneFirstComment = () => {
    if (comments.length === 0) {
      return;
    }

    onCommentWrite();
    setComments((current) =>
      current.map((comment, index) =>
        index === 0
          ? {
              ...comment,
              tone: comment.tone === 'review' ? 'question' : 'review',
            }
          : comment
      )
    );
  };

  const updateFirstCommentBody = () => {
    if (comments.length === 0) {
      return;
    }

    onCommentWrite();
    setComments((current) =>
      current.map((comment, index) =>
        index === 0
          ? {
              ...comment,
              body: `${comment.body} Updated from the comment channel.`,
            }
          : comment
      )
    );
  };

  const toggleFirstCommentStatus = () => {
    if (comments.length === 0) {
      return;
    }

    onCommentWrite();
    setComments((current) =>
      current.map((comment, index) =>
        index === 0
          ? {
              ...comment,
              status: comment.status === 'open' ? 'resolved' : 'open',
            }
          : comment
      )
    );
  };

  return (
    <div className="slate-comment-mode-pane slate-comment-mode-comment-pane">
      <div className="slate-comment-mode-pane-header">
        <span className="slate-comment-mode-title">Comment mode</span>
        <span className="slate-comment-mode-muted">
          read-only document, writable comments
        </span>
      </div>
      <CommentedEditable id="comment-mode" readOnly />
      <div className="slate-comment-mode-controls">
        <Button
          disabled={isCollapsed(selection)}
          onClick={addComment}
          onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
            event.preventDefault();
          }}
          type="button"
          variant="outline"
        >
          Add comment on selection
        </Button>
        <Button onClick={seedComment} type="button" variant="outline">
          Seed example comment
        </Button>
        <Button
          disabled={comments.length === 0}
          onClick={retoneFirstComment}
          type="button"
          variant="outline"
        >
          Retone first comment
        </Button>
        <Button
          disabled={comments.length === 0}
          onClick={updateFirstCommentBody}
          type="button"
          variant="outline"
        >
          Update first comment
        </Button>
        <Button
          disabled={comments.length === 0}
          onClick={toggleFirstCommentStatus}
          type="button"
          variant="outline"
        >
          Toggle resolved
        </Button>
        <Button
          disabled={comments.length === 0}
          onClick={clearComments}
          type="button"
          variant="outline"
        >
          Clear comments
        </Button>
        <span className="slate-comment-mode-code" id="comment-mode-selection">
          selection:{formatRange(selection)}
        </span>
      </div>
      <div className="slate-comment-mode-sidebar">
        {annotationSnapshot.allIds.length === 0 ? (
          <span className="slate-comment-mode-code" id="comments-empty">
            comments:none
          </span>
        ) : (
          annotationSnapshot.allIds.map((id) => {
            const annotation = annotationSnapshot.byId.get(id)!;

            return (
              <div
                className="slate-comment-mode-comment-card"
                id={`comment-card-${annotation.id}`}
                key={annotation.id}
              >
                <span
                  className={cn(
                    commentToneBadgeVariants({
                      state: commentVisualState(
                        annotation.data?.tone ?? 'review',
                        annotation.data?.status ?? 'open'
                      ),
                    })
                  )}
                >
                  {annotation.data?.label ?? annotation.id} -{' '}
                  {annotation.data?.status ?? 'open'}
                </span>
                <strong>{annotation.data?.body}</strong>
                <span className="slate-comment-mode-code">
                  range:{formatRange(annotation.range)}
                </span>
                <Button
                  onClick={() => removeComment(annotation.id)}
                  type="button"
                  variant="outline"
                >
                  Remove comment
                </Button>
              </div>
            );
          })
        )}
        <div className="slate-comment-mode-widget-row">
          {widgetSnapshot.allIds.length === 0 ? (
            <span className="slate-comment-mode-code" id="widgets-empty">
              widgets:none
            </span>
          ) : (
            widgetSnapshot.allIds.map((id) => {
              const widget = widgetSnapshot.byId.get(id)!;

              return widget.visible ? (
                <span className="slate-comment-mode-code" key={widget.id}>
                  {widget.id}:{widget.data?.label ?? 'none'}
                </span>
              ) : null;
            })
          )}
        </div>
      </div>
    </div>
  );
};

const CommentModeExample = () => {
  const writerEditor = useSlateEditor<Value>({
    initialSelection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    initialValue: cloneValue(initialValue),
  });
  const commentEditor = useSlateEditor<Value>({
    initialSelection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    initialValue: cloneValue(initialValue),
  });
  const [comments, setComments] = useState<CommentThread[]>([]);
  const [documentWrites, setDocumentWrites] = useState(0);
  const [commentWrites, setCommentWrites] = useState(0);
  const writerAnnotationStore = useSlateAnnotationStore<
    CommentData,
    CommentProjection
  >(writerEditor, {
    deps: [comments],
    project: () => createCommentAnnotations(comments),
  });
  const commentAnnotationStore = useSlateAnnotationStore<
    CommentData,
    CommentProjection
  >(commentEditor, {
    deps: [comments],
    project: () => createCommentAnnotations(comments),
  });

  const syncCommentModeFromDocument = (value: Value) => {
    commentEditor.update((tx) => {
      tx.value.replace({
        children: cloneValue(value),
        selection: null,
      });
    });
  };

  const handleWriterValueChange = (value: Value) => {
    setDocumentWrites((count) => count + 1);
    syncCommentModeFromDocument(value);
  };

  return (
    <div className="slate-comment-mode-panel">
      <Instruction>
        Edit mode owns document writes. Comment mode renders the same document
        read-only, creates bookmark-backed comments, and writes only to the
        external comment channel.
      </Instruction>
      <div className="slate-comment-mode-proof-grid">
        <div className="slate-comment-mode-proof-cell">
          <strong>document writes</strong>
          <br />
          <span
            className="slate-comment-mode-code"
            id="comment-mode-document-writes"
          >
            {documentWrites}
          </span>
        </div>
        <div className="slate-comment-mode-proof-cell">
          <strong>comment writes</strong>
          <br />
          <span
            className="slate-comment-mode-code"
            id="comment-mode-comment-writes"
          >
            {commentWrites}
          </span>
        </div>
        <div className="slate-comment-mode-proof-cell">
          <strong>read-only document writes</strong>
          <br />
          <span
            className="slate-comment-mode-code"
            id="comment-mode-read-only-writes"
          >
            0
          </span>
        </div>
      </div>
      <div className="slate-comment-mode-layout">
        <Slate annotationStore={commentAnnotationStore} editor={commentEditor}>
          <CommentModePane
            annotationStore={commentAnnotationStore}
            comments={comments}
            editor={commentEditor}
            onCommentWrite={() => setCommentWrites((count) => count + 1)}
            setComments={setComments}
            writerEditor={writerEditor}
          />
        </Slate>
        <Slate
          annotationStore={writerAnnotationStore}
          editor={writerEditor}
          onValueChange={handleWriterValueChange}
        >
          <WriterPane editor={writerEditor} />
        </Slate>
      </div>
    </div>
  );
};

export default CommentModeExample;
