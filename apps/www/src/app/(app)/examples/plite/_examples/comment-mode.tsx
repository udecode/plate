import { cva } from 'class-variance-authority';
import {
  type Anchor,
  NodeApi,
  RangeApi,
  type Range,
  type Value,
} from 'plitejs';
import {
  Editable,
  Plite,
  PliteAnnotationProvider,
  type PliteAnnotationStore,
  type PliteDecorationSource,
  type Editor,
  useEditorSelection,
  usePliteAnnotationStore,
  usePliteAnnotations,
  useEditor,
  usePliteWidgetStore,
  usePliteWidgets,
} from 'plitejs/react';
import {
  type Dispatch,
  type PointerEvent,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import { failInvariant } from '../../../../../lib/failInvariant';
import { Instruction } from './components';

type CommentStatus = 'open' | 'resolved';
type CommentTone = 'question' | 'review';

type CommentThread = {
  anchor: Anchor<Range>;
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

type CommentVisualState = 'question' | 'resolved' | 'review';

type CommentEditor = Editor;

const initialValue: Value = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Comment mode in Plite uses anchored annotations instead of trying to smuggle durable state through decorate.',
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
    ? `${range.anchor.path.join('.')}:${
        range.anchor.offset
      }|${range.focus.path.join('.')}:${range.focus.offset}`
    : 'none';

const commentVisualState = (
  tone: CommentTone,
  status: CommentStatus
): CommentVisualState => (status === 'resolved' ? 'resolved' : tone);

const commentHighlightVariants = cva('plite-comment-mode-highlight', {
  variants: {
    overlap: {
      false: 'plite-comment-mode-highlight-single',
      true: 'plite-comment-mode-highlight-overlap',
    },
    state: {
      question: 'plite-comment-mode-highlight-question',
      resolved: 'plite-comment-mode-highlight-resolved',
      review: 'plite-comment-mode-highlight-review',
    },
  },
});

const commentToneBadgeVariants = cva('plite-comment-mode-tone-badge', {
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
  }));

const createCommentDecorationSource = (
  store: PliteAnnotationStore<CommentData>
): PliteDecorationSource<CommentEditor> => ({
  id: 'comments',
  observe: ({ refresh }) =>
    store.subscribeChanges(({ nodeKeys }) => {
      if (nodeKeys.length > 0) refresh({ nodeKeys });
    }),
  read: ({ editor, entry: [node, path] }) => {
    if (!NodeApi.isText(node)) return [];

    const nodeKey = editor.key(path);

    if (!nodeKey) return [];

    const textRange: Range = {
      anchor: { offset: 0, path },
      focus: { offset: node.text.length, path },
    };
    const annotations = store
      .getAnnotationsAt(nodeKey)
      .flatMap((annotation) => {
        const { id } = annotation;
        const intersection = annotation.range
          ? RangeApi.intersection(annotation.range, textRange)
          : null;

        if (!intersection) return [];

        const [start, end] = RangeApi.edges(intersection);

        return start.offset === end.offset
          ? []
          : [
              {
                data: annotation.data,
                end: end.offset,
                id,
                start: start.offset,
              },
            ];
      })
      .sort((left, right) => left.id.localeCompare(right.id));
    const boundaries = [
      ...new Set(annotations.flatMap(({ end, start }) => [start, end])),
    ].sort((left, right) => left - right);

    return boundaries.slice(0, -1).flatMap((start, index) => {
      const end = boundaries[index + 1];
      const active = annotations.filter(
        (annotation) => annotation.start < end && annotation.end > start
      );
      const first = active[0];

      if (!first || start === end) return [];

      const status = first.data?.status ?? 'open';
      const tone = first.data?.tone ?? 'review';

      return [
        {
          attributes: {
            className: commentHighlightVariants({
              overlap: active.length > 1,
              state: commentVisualState(tone, status),
            }),
            'data-comment-count': active.length,
            'data-comment-status': status,
            'data-comment-tone': tone,
          },
          key: `comments:${path.join('.')}:${start}:${end}:${active
            .map(({ id }) => id)
            .join(',')}`,
          range: {
            anchor: { offset: start, path },
            focus: { offset: end, path },
          },
        },
      ];
    });
  },
});

const CommentedEditable = ({
  id,
  readOnly = false,
}: {
  id: string;
  readOnly?: boolean;
}) => (
  <Editable className="plite-comment-mode-editor" id={id} readOnly={readOnly} />
);

const WriterPane = ({ editor }: { editor: CommentEditor }) => {
  const selection = useEditorSelection();
  const annotationSnapshot = usePliteAnnotations<CommentData>();
  const firstAnnotation =
    annotationSnapshot.allIds[0] == null
      ? null
      : (annotationSnapshot.byId.get(annotationSnapshot.allIds[0]) ?? null);

  const insertPrefixBeforeFirstComment = () => {
    if (!firstAnnotation?.range) {
      return;
    }

    const { path } = firstAnnotation.range.anchor;

    editor.update.text.insert('>', {
      at: {
        offset: 0,
        path,
      },
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
    <div className="plite-comment-mode-pane plite-comment-mode-writer-pane">
      <div className="plite-comment-mode-pane-header">
        <span className="plite-comment-mode-title">Edit mode</span>
        <span className="plite-comment-mode-muted">
          document writes enabled
        </span>
      </div>
      <CommentedEditable id="comment-mode-document" />
      <div className="plite-comment-mode-controls">
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
        <span className="plite-comment-mode-code">
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
  annotationStore: PliteAnnotationStore<CommentData>;
  comments: readonly CommentThread[];
  editor: CommentEditor;
  onCommentWrite: () => void;
  setComments: Dispatch<SetStateAction<CommentThread[]>>;
  writerEditor: CommentEditor;
}) => {
  const nextCommentId = useRef(1);
  const selection = useEditorSelection();
  const annotationSnapshot = usePliteAnnotations<CommentData>();
  const widgets = useMemo(
    () =>
      comments.map((comment) => ({
        target: {
          annotationId: comment.id,
          type: 'annotation' as const,
        },
        data: {
          label: comment.label,
          tone: comment.tone,
        },
        id: `${comment.id}-widget`,
      })),
    [comments]
  );
  const widgetStore = usePliteWidgetStore(editor, widgets, {
    annotationStore,
  });
  const widgetSnapshot = usePliteWidgets(widgetStore);
  const commentsRef = useRef(comments);

  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  useEffect(
    () => () => {
      commentsRef.current.forEach((comment) => {
        comment.anchor.release();
      });
    },
    []
  );

  const createComment = (range: Range) => {
    const id = `comment-${nextCommentId.current}`;
    const tone: CommentTone =
      nextCommentId.current % 2 === 0 ? 'question' : 'review';
    const snippet =
      writerEditor.read.text.string(range).replace(/\s+/g, ' ').trim() ||
      'selection';
    const anchor = writerEditor.anchor(range, {
      association: 'inward',
      deletion: 'drop',
    });

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

      target?.anchor.release();

      return current.filter((comment) => comment.id !== id);
    });
  };

  const clearComments = () => {
    onCommentWrite();
    setComments((current) => {
      current.forEach((comment) => {
        comment.anchor.release();
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
    <div className="plite-comment-mode-pane plite-comment-mode-comment-pane">
      <div className="plite-comment-mode-pane-header">
        <span className="plite-comment-mode-title">Comment mode</span>
        <span className="plite-comment-mode-muted">
          read-only document, writable comments
        </span>
      </div>
      <CommentedEditable id="comment-mode" readOnly />
      <div className="plite-comment-mode-controls">
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
        <span className="plite-comment-mode-code" id="comment-mode-selection">
          selection:{formatRange(selection)}
        </span>
      </div>
      <div className="plite-comment-mode-sidebar">
        {annotationSnapshot.allIds.length === 0 ? (
          <span className="plite-comment-mode-code" id="comments-empty">
            comments:none
          </span>
        ) : (
          annotationSnapshot.allIds.map((id) => {
            const annotation =
              annotationSnapshot.byId.get(id) ??
              failInvariant('Expected value to be defined');

            return (
              <div
                className="plite-comment-mode-comment-card"
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
                <span className="plite-comment-mode-code">
                  range:{formatRange(annotation.range)}
                </span>
                <Button
                  onClick={() => {
                    removeComment(annotation.id);
                  }}
                  type="button"
                  variant="outline"
                >
                  Remove comment
                </Button>
              </div>
            );
          })
        )}
        <div className="plite-comment-mode-widget-row">
          {widgetSnapshot.allIds.length === 0 ? (
            <span className="plite-comment-mode-code" id="widgets-empty">
              widgets:none
            </span>
          ) : (
            widgetSnapshot.allIds.map((id) => {
              const widget =
                widgetSnapshot.byId.get(id) ??
                failInvariant('Expected value to be defined');

              return widget.available ? (
                <span className="plite-comment-mode-code" key={widget.id}>
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
  const writerEditor = useEditor({
    initialSelection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    initialValue: cloneValue(initialValue),
  });
  const commentEditor = useEditor({
    initialSelection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    initialValue: cloneValue(initialValue),
  });
  const [comments, setComments] = useState<CommentThread[]>([]);
  const [documentWrites, setDocumentWrites] = useState(0);
  const [commentWrites, setCommentWrites] = useState(0);
  const annotations = useMemo(
    () => createCommentAnnotations(comments),
    [comments]
  );
  const writerAnnotationStore = usePliteAnnotationStore<CommentData>(
    writerEditor,
    annotations
  );
  const commentAnnotationStore = usePliteAnnotationStore<CommentData>(
    commentEditor,
    annotations
  );
  const writerDecorations = useMemo(
    () => createCommentDecorationSource(writerAnnotationStore),
    [writerAnnotationStore]
  );
  const commentDecorations = useMemo(
    () => createCommentDecorationSource(commentAnnotationStore),
    [commentAnnotationStore]
  );

  const syncCommentModeFromDocument = (value: Value) => {
    commentEditor.update.value.replace({
      children: cloneValue(value),
      selection: null,
    });
  };

  const handleWriterValueChange = (value: Value) => {
    setDocumentWrites((count) => count + 1);
    syncCommentModeFromDocument(value);
  };

  return (
    <div className="plite-comment-mode-panel">
      <Instruction>
        Edit mode owns document writes. Comment mode renders the same document
        read-only, creates anchored comments, and writes only to the external
        comment channel.
      </Instruction>
      <div className="plite-comment-mode-proof-grid">
        <div className="plite-comment-mode-proof-cell">
          <strong>document writes</strong>
          <br />
          <span
            className="plite-comment-mode-code"
            id="comment-mode-document-writes"
          >
            {documentWrites}
          </span>
        </div>
        <div className="plite-comment-mode-proof-cell">
          <strong>comment writes</strong>
          <br />
          <span
            className="plite-comment-mode-code"
            id="comment-mode-comment-writes"
          >
            {commentWrites}
          </span>
        </div>
        <div className="plite-comment-mode-proof-cell">
          <strong>read-only document writes</strong>
          <br />
          <span
            className="plite-comment-mode-code"
            id="comment-mode-read-only-writes"
          >
            0
          </span>
        </div>
      </div>
      <div className="plite-comment-mode-layout">
        <Plite decorations={[commentDecorations]} editor={commentEditor}>
          <PliteAnnotationProvider store={commentAnnotationStore}>
            <CommentModePane
              annotationStore={commentAnnotationStore}
              comments={comments}
              editor={commentEditor}
              onCommentWrite={() => {
                setCommentWrites((count) => count + 1);
              }}
              setComments={setComments}
              writerEditor={writerEditor}
            />
          </PliteAnnotationProvider>
        </Plite>
        <Plite
          decorations={[writerDecorations]}
          editor={writerEditor}
          onValueChange={({ value }) => {
            handleWriterValueChange(value);
          }}
        >
          <PliteAnnotationProvider store={writerAnnotationStore}>
            <WriterPane editor={writerEditor} />
          </PliteAnnotationProvider>
        </Plite>
      </div>
    </div>
  );
};

export default CommentModeExample;
