import {
  type Ancestor,
  type Descendant,
  NodeApi,
  type Path,
  type Range,
} from 'plitejs';
import {
  Editable,
  Plite,
  type PliteDecoration,
  type PliteDecorationSource,
  useEditor,
} from 'plitejs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const INITIAL_TEXT = 'This is some text here about. there';
const ASYNC_DECORATION_DELAY_MS = 500;

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

  const decorations: PliteDecoration[] = [];
  const pattern = /\b(?:here|there)\b/g;
  let match = pattern.exec(node.text);

  while (match) {
    const start = match.index;
    const end = start + match[0].length;

    if (end <= decoratedLength) {
      decorations.push({
        attributes: {
          className: 'plite-decorations-async-highlight',
          'data-cy': 'async-decoration-highlight',
        },
        key: `async-highlight:${path.join('.')}:${start}:${end}`,
        range: createRange(path, start, end),
      });
    }

    match = pattern.exec(node.text);
  }

  return decorations;
};

const AsyncDecorationsExample = () => {
  const editor = useEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: INITIAL_TEXT }],
      },
    ],
  });
  const [decoratedLength, setDecoratedLength] = useState(INITIAL_TEXT.length);
  const timeoutRef = useRef<number | null>(null);

  const decorationSource = useMemo<PliteDecorationSource<typeof editor>>(
    () => ({
      id: 'async-decoration',
      read: ({ entry: [node, path] }) =>
        NodeApi.isDescendant(node)
          ? collectAsyncHighlightDecorations(node, path, decoratedLength)
          : [],
    }),
    [decoratedLength]
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
    <div className="plite-decorations-async-container">
      <h1 className="example-page-title plite-decorations-async-title">
        Async Decorations
      </h1>
      <div
        className="plite-decorations-async-status"
        data-testid="async-decoration-status"
      >
        decorated-length:{decoratedLength}
      </div>
      <Plite
        decorations={[decorationSource]}
        editor={editor}
        onValueChange={({ value }) => {
          scheduleAsyncDecorations(value);
        }}
      >
        <Editable
          className="plite-decorations-async-editor"
          id="decorations-async"
        />
      </Plite>
    </div>
  );
};

export default AsyncDecorationsExample;
