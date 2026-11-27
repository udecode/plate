import { cva } from 'class-variance-authority';
import {
  type Anchor,
  NodeApi,
  type NodeKey,
  RangeApi,
  type Range,
  TextApi,
  type Value,
} from 'plitejs';
import { history } from 'plitejs/history';
import {
  Editable,
  EditorRoot,
  type DecorationSource,
  type Editor,
  useCreateEditor,
  useEditorContext,
  useEditorFocused,
  useEditorSelection,
} from 'plitejs/react';
import {
  type Dispatch,
  type PointerEvent,
  type SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

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

type ResolvedComment = Readonly<{
  body: string;
  id: string;
  label: string;
  nodeKeys: readonly NodeKey[];
  range: Range | null;
  status: CommentStatus;
  tone: CommentTone;
}>;

type CommentViewStore = Readonly<{
  getSnapshot: () => readonly ResolvedComment[];
  setComments: (next: readonly CommentThread[]) => void;
  setEditor: (next: CommentEditor) => void;
  subscribe: (listener: () => void) => () => void;
  subscribePaint: (
    listener: (nodeKeys: readonly NodeKey[]) => void
  ) => () => void;
  syncMovedAnchors: (movedAnchors: readonly unknown[]) => void;
}>;

const textNodeKeysInRange = (
  editor: CommentEditor,
  range: Range | null
): readonly NodeKey[] => {
  if (!range) return [];
  const keys = new Set<NodeKey>();
  for (const [node] of editor.read.nodes.entries({
    at: range,
    match: TextApi.isText,
  })) {
    const key = editor.key(node);
    if (key) keys.add(key);
  }
  return [...keys];
};

const resolveCommentEntry = (
  editor: CommentEditor,
  comment: CommentThread
): ResolvedComment => {
  const range = comment.anchor.resolve(editor);
  return {
    body: comment.body,
    id: comment.id,
    label: comment.label,
    nodeKeys: textNodeKeysInRange(editor, range),
    range,
    status: comment.status,
    tone: comment.tone,
  };
};

const createCommentViewStore = (
  initialEditor: CommentEditor,
  initialComments: readonly CommentThread[]
): CommentViewStore => {
  let currentEditor = initialEditor;
  let currentComments = initialComments;
  let snapshot: readonly ResolvedComment[] = initialComments.map((comment) =>
    resolveCommentEntry(currentEditor, comment)
  );
  const listeners = new Set<() => void>();
  const paintListeners = new Set<(nodeKeys: readonly NodeKey[]) => void>();
  const notify = (
    nextSnapshot: readonly ResolvedComment[],
    paintKeys: Set<NodeKey>
  ) => {
    snapshot = nextSnapshot;
    listeners.forEach((listener) => listener());
    if (paintKeys.size > 0) {
      const keys = [...paintKeys];
      paintListeners.forEach((listener) => listener(keys));
    }
  };
  const rebuildAll = () => {
    const previousById = new Map(snapshot.map((entry) => [entry.id, entry]));
    const nextSnapshot = currentComments.map((comment) =>
      resolveCommentEntry(currentEditor, comment)
    );
    const nextIds = new Set(nextSnapshot.map((entry) => entry.id));
    const paintKeys = new Set<NodeKey>();
    for (const next of nextSnapshot) {
      const prev = previousById.get(next.id);
      if (
        !prev ||
        prev.status !== next.status ||
        prev.tone !== next.tone ||
        !RangeApi.equals(prev.range, next.range)
      ) {
        for (const key of prev?.nodeKeys ?? []) paintKeys.add(key);
        for (const key of next.nodeKeys) paintKeys.add(key);
      }
    }
    for (const [id, prev] of previousById) {
      if (!nextIds.has(id)) {
        for (const key of prev.nodeKeys) paintKeys.add(key);
      }
    }
    notify(nextSnapshot, paintKeys);
  };

  return {
    getSnapshot: () => snapshot,
    setComments: (next) => {
      if (next === currentComments) return;
      currentComments = next;
      rebuildAll();
    },
    setEditor: (next) => {
      if (next === currentEditor) return;
      currentEditor = next;
      rebuildAll();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    subscribePaint: (listener) => {
      paintListeners.add(listener);
      return () => {
        paintListeners.delete(listener);
      };
    },
    syncMovedAnchors: (movedAnchors) => {
      const movedSet = new Set<unknown>(movedAnchors);
      const paintKeys = new Set<NodeKey>();
      let changed = false;
      const nextSnapshot = currentComments.map((comment, index) => {
        const prev = snapshot[index];
        if (prev && prev.id === comment.id && !movedSet.has(comment.anchor)) {
          return prev;
        }
        const next = resolveCommentEntry(currentEditor, comment);
        if (!prev || !RangeApi.equals(prev.range, next.range)) {
          changed = true;
          for (const key of prev?.nodeKeys ?? []) paintKeys.add(key);
          for (const key of next.nodeKeys) paintKeys.add(key);
        }
        return next;
      });
      if (changed) notify(nextSnapshot, paintKeys);
    },
  };
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
        text: 'Select text in comment mode, add a comment, then edit the document to watch the anchor, inline highlight, and sidebar stay in sync.',
      },
    ],
  },
];

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

const commentHighlightVariants = cva('editor-comment-mode-highlight', {
  variants: {
    overlap: {
      false: 'editor-comment-mode-highlight-single',
      true: 'editor-comment-mode-highlight-overlap',
    },
    state: {
      question: 'editor-comment-mode-highlight-question',
      resolved: 'editor-comment-mode-highlight-resolved',
      review: 'editor-comment-mode-highlight-review',
    },
  },
});

const commentToneBadgeVariants = cva('editor-comment-mode-tone-badge', {
  variants: {
    state: {
      question: 'is-question',
      resolved: 'is-resolved',
      review: 'is-review',
    },
  },
});

const commentAnchorOptions = {
  association: 'inward',
  deletion: 'nearest',
} as const;

const createCommentDecorationSource = (
  store: CommentViewStore
): DecorationSource<CommentEditor> => ({
  id: 'comments',
  observe: ({ refresh }) =>
    store.subscribePaint((nodeKeys) => {
      refresh({ nodeKeys });
    }),
  read: ({ entry: [node, path] }) => {
    if (!NodeApi.isText(node)) return [];

    const textRange: Range = {
      anchor: { offset: 0, path },
      focus: { offset: node.text.length, path },
    };
    const resolved = store
      .getSnapshot()
      .flatMap((comment) => {
        const intersection = comment.range
          ? RangeApi.intersection(comment.range, textRange)
          : null;

        if (!intersection) return [];

        const [start, end] = RangeApi.edges(intersection);

        return start.offset === end.offset
          ? []
          : [
              {
                end: end.offset,
                id: comment.id,
                start: start.offset,
                status: comment.status,
                tone: comment.tone,
              },
            ];
      })
      .sort((left, right) => left.id.localeCompare(right.id));
    const boundaries = [
      ...new Set(resolved.flatMap(({ end, start }) => [start, end])),
    ].sort((left, right) => left - right);

    return boundaries.slice(0, -1).flatMap((start, index) => {
      const end = boundaries[index + 1];
      const active = resolved.filter(
        (comment) => comment.start < end && comment.end > start
      );
      const first = active[0];

      if (!first || start === end) return [];

      return [
        {
          attributes: {
            className: commentHighlightVariants({
              overlap: active.length > 1,
              state: commentVisualState(first.tone, first.status),
            }),
            'data-comment-count': active.length,
            'data-comment-status': first.status,
            'data-comment-tone': first.tone,
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
  <Editable
    className="editor-comment-mode-editor"
    id={id}
    readOnly={readOnly}
  />
);

const WriterPane = ({
  editor,
  store,
}: {
  editor: CommentEditor;
  store: CommentViewStore;
}) => {
  const modelSelection = useEditorSelection();
  const selection = useEditorFocused() ? modelSelection : null;
  const resolvedComments = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
  const firstComment = resolvedComments[0] ?? null;

  const insertPrefixBeforeFirstComment = () => {
    if (!firstComment?.range) {
      return;
    }

    const { path } = firstComment.range.anchor;

    editor.update.text.insert('>', {
      at: {
        offset: 0,
        path,
      },
    });
  };

  const insertParagraphBeforeFirstComment = () => {
    if (!firstComment?.range) {
      return;
    }

    const at = {
      offset: 0,
      path: firstComment.range.anchor.path,
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
    <div className="editor-comment-mode-pane editor-comment-mode-writer-pane">
      <div className="editor-comment-mode-pane-header">
        <span className="editor-comment-mode-title">Edit mode</span>
        <span className="editor-comment-mode-muted">
          document writes enabled
        </span>
      </div>
      <CommentedEditable id="comment-mode-document" />
      <div className="editor-comment-mode-controls">
        <Button
          disabled={!firstComment?.range}
          onClick={insertPrefixBeforeFirstComment}
          type="button"
          variant="outline"
        >
          Insert prefix before first comment
        </Button>
        <Button
          disabled={!firstComment?.range}
          onClick={insertParagraphBeforeFirstComment}
          type="button"
          variant="outline"
        >
          Insert paragraph before first comment
        </Button>
        <span className="editor-comment-mode-code">
          selection:{formatRange(selection)}
        </span>
      </div>
    </div>
  );
};

const CommentModePane = ({
  comments,
  editor,
  onCommentWrite,
  setComments,
  store,
}: {
  comments: readonly CommentThread[];
  editor: CommentEditor;
  onCommentWrite: () => void;
  setComments: Dispatch<SetStateAction<CommentThread[]>>;
  store: CommentViewStore;
}) => {
  const nextCommentId = useRef(1);
  const paneRef = useRef<HTMLDivElement>(null);
  const [ownsSelection, setOwnsSelection] = useState(false);
  const modelSelection = useEditorSelection();
  const selection = ownsSelection ? modelSelection : null;
  const resolvedComments = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );

  useEffect(() => {
    const document = paneRef.current?.ownerDocument;

    if (!document) return undefined;
    const onSelectionChange = () => {
      const anchor = document.getSelection()?.anchorNode;

      setOwnsSelection(
        !!anchor &&
          !!paneRef.current?.querySelector('[data-editor]')?.contains(anchor)
      );
    };

    document.addEventListener('selectionchange', onSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, []);

  const createComment = (range: Range) => {
    const id = `comment-${nextCommentId.current}`;
    const tone: CommentTone =
      nextCommentId.current % 2 === 0 ? 'question' : 'review';
    const snippet =
      editor.read.text.string(range).replace(/\s+/g, ' ').trim() || 'selection';
    const anchor = editor.anchor(range, commentAnchorOptions);

    nextCommentId.current += 1;
    onCommentWrite();
    setComments((current) => [
      ...current,
      {
        anchor,
        body: `Discuss: ${snippet.slice(0, 56)}`,
        id,
        label: `Comment ${comments.length + 1}`,
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
    const target = comments.find((comment) => comment.id === id);

    target?.anchor.release();
    onCommentWrite();
    setComments((current) => current.filter((comment) => comment.id !== id));
  };

  const clearComments = () => {
    comments.forEach((comment) => {
      comment.anchor.release();
    });
    onCommentWrite();
    setComments([]);
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
    <div
      className="editor-comment-mode-pane editor-comment-mode-comment-pane"
      ref={paneRef}
    >
      <div className="editor-comment-mode-pane-header">
        <span className="editor-comment-mode-title">Comment mode</span>
        <span className="editor-comment-mode-muted">
          read-only document, writable comments
        </span>
      </div>
      <CommentedEditable id="comment-mode" readOnly />
      <div className="editor-comment-mode-controls">
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
        <span className="editor-comment-mode-code" id="comment-mode-selection">
          selection:{formatRange(selection)}
        </span>
      </div>
      <div className="editor-comment-mode-sidebar">
        {resolvedComments.length === 0 ? (
          <span className="editor-comment-mode-code" id="comments-empty">
            comments:none
          </span>
        ) : (
          resolvedComments.map((comment) => (
            <div
              className="editor-comment-mode-comment-card"
              id={`comment-card-${comment.id}`}
              key={comment.id}
            >
              <span
                className={cn(
                  commentToneBadgeVariants({
                    state: commentVisualState(comment.tone, comment.status),
                  })
                )}
              >
                {comment.label} - {comment.status}
              </span>
              <strong>{comment.body}</strong>
              <span className="editor-comment-mode-code">
                range:{formatRange(comment.range)}
              </span>
              <Button
                onClick={() => {
                  removeComment(comment.id);
                }}
                type="button"
                variant="outline"
              >
                Remove comment
              </Button>
            </div>
          ))
        )}
        <div className="editor-comment-mode-annotation-row">
          {resolvedComments.length === 0 ? (
            <span className="editor-comment-mode-code" id="annotations-empty">
              annotations:none
            </span>
          ) : (
            resolvedComments.map((comment) => (
              <span className="editor-comment-mode-code" key={comment.id}>
                {comment.id}:{comment.label}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const useCommentView = (
  comments: readonly CommentThread[],
  onDecorationSource: (source: DecorationSource<CommentEditor> | null) => void
) => {
  const editor = useEditorContext();
  const [store] = useState(() => createCommentViewStore(editor, comments));

  useLayoutEffect(() => {
    store.setEditor(editor);
  }, [editor, store]);

  useLayoutEffect(() => {
    store.setComments(comments);
  }, [comments, store]);

  useEffect(
    () =>
      editor.subscribeCommit((commit) => {
        const moved = commit.changed.anchors();
        if (moved.length > 0) {
          store.syncMovedAnchors(moved);
        }
      }),
    [editor, store]
  );

  const decorationSource = useMemo(
    () => createCommentDecorationSource(store),
    [store]
  );

  useEffect(() => {
    onDecorationSource(decorationSource);

    return () => onDecorationSource(null);
  }, [decorationSource, onDecorationSource]);

  return { editor, store };
};

const CommentReviewView = ({
  comments,
  onCommentWrite,
  onDecorationSource,
  setComments,
}: {
  comments: readonly CommentThread[];
  onCommentWrite: () => void;
  onDecorationSource: (source: DecorationSource<CommentEditor> | null) => void;
  setComments: Dispatch<SetStateAction<CommentThread[]>>;
}) => {
  const { editor, store } = useCommentView(comments, onDecorationSource);

  return (
    <CommentModePane
      comments={comments}
      editor={editor}
      onCommentWrite={onCommentWrite}
      setComments={setComments}
      store={store}
    />
  );
};

const WriterView = ({
  comments,
  onDecorationSource,
}: {
  comments: readonly CommentThread[];
  onDecorationSource: (source: DecorationSource<CommentEditor> | null) => void;
}) => {
  const { editor, store } = useCommentView(comments, onDecorationSource);

  return <WriterPane editor={editor} store={store} />;
};

const CommentModeExample = () => {
  const editor = useCreateEditor({
    plugins: [history()],
    initialSelection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    initialValue,
  });
  const [comments, setComments] = useState<CommentThread[]>([]);
  const [documentWrites, setDocumentWrites] = useState(0);
  const [commentWrites, setCommentWrites] = useState(0);
  const [writerDecorationSource, setWriterDecorationSource] =
    useState<DecorationSource<CommentEditor> | null>(null);
  const [commentDecorationSource, setCommentDecorationSource] =
    useState<DecorationSource<CommentEditor> | null>(null);
  const commentsRef = useRef(comments);
  const publishWriterDecorationSource = useCallback(
    (source: DecorationSource<CommentEditor> | null) => {
      setWriterDecorationSource(source);
    },
    []
  );
  const publishCommentDecorationSource = useCallback(
    (source: DecorationSource<CommentEditor> | null) => {
      setCommentDecorationSource(source);
    },
    []
  );

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

  return (
    <div className="editor-comment-mode-panel">
      <Instruction>
        Edit mode owns document writes. Comment mode renders the same document
        read-only, creates anchored comments, and writes only to the external
        comment channel.
      </Instruction>
      <div className="editor-comment-mode-proof-grid">
        <div className="editor-comment-mode-proof-cell">
          <strong>document writes</strong>
          <br />
          <span
            className="editor-comment-mode-code"
            id="comment-mode-document-writes"
          >
            {documentWrites}
          </span>
        </div>
        <div className="editor-comment-mode-proof-cell">
          <strong>comment writes</strong>
          <br />
          <span
            className="editor-comment-mode-code"
            id="comment-mode-comment-writes"
          >
            {commentWrites}
          </span>
        </div>
        <div className="editor-comment-mode-proof-cell">
          <strong>read-only document writes</strong>
          <br />
          <span
            className="editor-comment-mode-code"
            id="comment-mode-read-only-writes"
          >
            0
          </span>
        </div>
      </div>
      <div className="editor-comment-mode-layout">
        <EditorRoot
          decorations={commentDecorationSource ? [commentDecorationSource] : []}
          editor={editor}
          readOnly
        >
          <CommentReviewView
            comments={comments}
            onCommentWrite={() => {
              setCommentWrites((count) => count + 1);
            }}
            onDecorationSource={publishCommentDecorationSource}
            setComments={setComments}
          />
        </EditorRoot>
        <EditorRoot
          decorations={writerDecorationSource ? [writerDecorationSource] : []}
          editor={editor}
          onValueChange={() => {
            setDocumentWrites((count) => count + 1);
          }}
        >
          <WriterView
            comments={comments}
            onDecorationSource={publishWriterDecorationSource}
          />
        </EditorRoot>
      </div>
    </div>
  );
};

export default CommentModeExample;
