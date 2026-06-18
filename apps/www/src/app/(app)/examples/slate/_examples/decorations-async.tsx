import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type Ancestor,
  type Descendant,
  NodeApi,
  type Path,
  type Range,
} from '@platejs/slate';
import {
  Editable,
  type EditableDecorate,
  Slate,
  type SlateDecoration,
  useSlateDecorationSource,
  useSlateEditor,
} from '@platejs/slate-react';
import { replaceQueryOptions } from './query-controls';

type AsyncHighlightData = {
  asyncHighlight: true;
};

const INITIAL_TEXT = 'This is some text here about. there';
const ASYNC_DECORATION_DELAY_MS = 500;
const decorationModes = ['prop', 'hook'] as const;

const getDocumentText = (value: readonly Descendant[]) =>
  NodeApi.string({ children: value } as Ancestor);

const createRange = (path: Path, start: number, end: number): Range => ({
  anchor: { path, offset: start },
  focus: { path, offset: end },
});

const collectAsyncHighlightDecorations = (
  node: Descendant,
  path: Path,
  decoratedLength: number
) => {
  if (!NodeApi.isText(node)) {
    return [];
  }

  const decorations: SlateDecoration<AsyncHighlightData>[] = [];
  const pattern = /\b(?:here|there)\b/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(node.text))) {
    const start = match.index;
    const end = start + match[0].length;

    if (end > decoratedLength) {
      continue;
    }

    decorations.push({
      data: { asyncHighlight: true },
      key: `async-highlight:${path.join('.')}:${start}:${end}`,
      range: createRange(path, start, end),
    });
  }

  return decorations;
};

const AsyncDecorationsExample = () => {
  const [decorationMode] = useQueryState(
    'source',
    parseAsStringLiteral(decorationModes)
      .withDefault('prop')
      .withOptions(replaceQueryOptions)
  );
  const editor = useSlateEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: INITIAL_TEXT }],
      },
    ],
  });
  const [decoratedLength, setDecoratedLength] = useState(INITIAL_TEXT.length);
  const timeoutRef = useRef<number | null>(null);

  const decorate = useCallback<EditableDecorate<AsyncHighlightData>>(
    ([node, path]) =>
      collectAsyncHighlightDecorations(node, path, decoratedLength),
    [decoratedLength]
  );
  const hookDecorationSource = useSlateDecorationSource<AsyncHighlightData>(
    editor,
    {
      deps: [decoratedLength],
      id: 'async-decoration-hook',
      read: ({ snapshot }) => {
        const root = { children: snapshot.children } as Ancestor;
        const decorations: SlateDecoration<AsyncHighlightData>[] = [];

        for (const [node, path] of NodeApi.nodes(root)) {
          if (path.length === 0) {
            continue;
          }

          decorations.push(
            ...collectAsyncHighlightDecorations(
              node as Descendant,
              path,
              decoratedLength
            )
          );
        }

        return decorations;
      },
    }
  );

  const scheduleAsyncDecorations = useCallback(
    (value: readonly Descendant[]) => {
      const nextLength = getDocumentText(value).length;

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setDecoratedLength(nextLength);
        timeoutRef.current = null;
      }, ASYNC_DECORATION_DELAY_MS);
    },
    []
  );

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return (
    <div className="slate-decorations-async-container">
      <h1 className="example-page-title slate-decorations-async-title">
        Async Decorations
      </h1>
      <div
        className="slate-decorations-async-status"
        data-testid="async-decoration-status"
      >
        decorated-length:{decoratedLength}
      </div>
      <Slate
        decorationSources={
          decorationMode === 'hook' ? [hookDecorationSource] : undefined
        }
        editor={editor}
        onValueChange={scheduleAsyncDecorations}
      >
        <Editable
          className="slate-decorations-async-editor"
          decorate={decorationMode === 'prop' ? decorate : undefined}
          id="decorations-async"
          renderSegment={(segment, children) =>
            segment.slices.some(
              (slice) =>
                (slice.data as AsyncHighlightData | undefined)?.asyncHighlight
            ) ? (
              <span
                className="slate-decorations-async-highlight"
                data-cy="async-decoration-highlight"
              >
                {children}
              </span>
            ) : (
              children
            )
          }
        />
      </Slate>
    </div>
  );
};

export default AsyncDecorationsExample;
