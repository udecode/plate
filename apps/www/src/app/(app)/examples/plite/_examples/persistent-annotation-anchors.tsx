import {
  type Anchor,
  type createEditor,
  type Path,
  type Point,
  RangeApi,
  type Range,
  type Value,
} from 'plitejs';
import { history } from 'plitejs/history';
import {
  EditorRoot,
  useCreateEditor,
  useEditor,
  useEditorSelector,
} from 'plitejs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

import { Instruction } from './components';

const createChildren = (left = 'alpha', right = 'beta'): Value => [
  {
    type: 'paragraph',
    children: [{ text: left }],
  },
  {
    type: 'paragraph',
    children: [{ text: right }],
  },
];

type BlockRowDescriptor = {
  childTexts: string[];
  path: Path;
  text: string;
};

type AnnotationData = {
  kind: string;
  label: string;
  tone?: string;
};

const getBlockRows = (
  value: ReadonlyArray<Value[number]>
): BlockRowDescriptor[] =>
  value.flatMap((node, index) => {
    if (!('children' in node)) {
      return [];
    }

    const childTexts = node.children.flatMap((child) =>
      'text' in child ? [String(child.text)] : []
    );

    if (childTexts.length === 0) {
      return [];
    }

    return [
      {
        childTexts,
        path: [index],
        text: childTexts.join(''),
      },
    ];
  });

const getLeafPathByText = (
  editor: ReturnType<typeof createEditor>,
  match: (text: string) => boolean
) => {
  const value = editor.read.children();

  for (const [blockIndex, node] of value.entries()) {
    if (!('children' in node)) {
      continue;
    }

    for (const [childIndex, child] of node.children.entries()) {
      if ('text' in child && match(String(child.text))) {
        return [blockIndex, childIndex] as Path;
      }
    }
  }

  throw new Error('Missing matching text leaf');
};

const getPointBeforeText = (
  editor: ReturnType<typeof createEditor>,
  textToFind: string
): Point => {
  const value = editor.read.children();

  for (const [blockIndex, node] of value.entries()) {
    if (!('children' in node)) {
      continue;
    }

    for (const [childIndex, child] of node.children.entries()) {
      if (!('text' in child)) {
        continue;
      }

      const offset = String(child.text).indexOf(textToFind);

      if (offset !== -1) {
        return { path: [blockIndex, childIndex], offset };
      }
    }
  }

  throw new Error(`Missing text: ${textToFind}`);
};

const getRangeInsideText = (
  editor: ReturnType<typeof createEditor>,
  textToFind: string,
  startOffset: number,
  endOffset: number
): Range => {
  const value = editor.read.children();

  for (const [blockIndex, node] of value.entries()) {
    if (!('children' in node)) {
      continue;
    }

    for (const [childIndex, child] of node.children.entries()) {
      if (!('text' in child)) {
        continue;
      }

      const offset = String(child.text).indexOf(textToFind);

      if (offset !== -1) {
        const path = [blockIndex, childIndex];

        return {
          anchor: { path, offset: offset + startOffset },
          focus: { path, offset: offset + endOffset },
        };
      }
    }
  }

  throw new Error(`Missing text: ${textToFind}`);
};

const getBlockRowByText = (
  value: ReadonlyArray<Value[number]>,
  match: (text: string) => boolean
) => getBlockRows(value).find((row) => match(row.text)) ?? null;

const getOutline = (value: ReadonlyArray<Value[number]>) =>
  getBlockRows(value)
    .map((row) => row.text)
    .join('|');

const toBlockOffset = (row: BlockRowDescriptor, point: Point) => {
  const childIndex = point.path[1] ?? 0;
  const leadingLength = row.childTexts
    .slice(0, childIndex)
    .reduce((sum, text) => sum + text.length, 0);

  return leadingLength + point.offset;
};

type ResolvedAnchorEntry = Readonly<{
  data: AnnotationData;
  id: string;
  range: Range | null;
}>;

const ProjectionRow = ({
  entry,
  row,
  slot,
}: {
  entry: ResolvedAnchorEntry | null;
  row: BlockRowDescriptor;
  slot: 'left' | 'right';
}) => {
  const projectionText =
    entry?.range &&
    entry.range.anchor.path[0] === row.path[0] &&
    entry.range.focus.path[0] === row.path[0]
      ? `${entry.id}:${toBlockOffset(
          row,
          entry.range.anchor
        )}-${toBlockOffset(row, entry.range.focus)}:${entry.data.kind}:${
          entry.data.tone ?? 'none'
        }`
      : 'none';

  return (
    <div className="editor-persistent-annotation-anchors-row">
      <span
        className="editor-persistent-annotation-anchors-code"
        id={`${slot}-text`}
      >
        {row.text}
      </span>
      <span
        className="editor-persistent-annotation-anchors-code"
        id={`${slot}-projection`}
      >
        {projectionText}
      </span>
    </div>
  );
};

const Outline = () => {
  const outline = useEditorSelector((editor) =>
    getOutline(editor.read.children())
  );

  return (
    <div className="editor-persistent-annotation-anchors-row">
      <strong>Document outline</strong>
      <span
        className="editor-persistent-annotation-anchors-code"
        id="document-outline"
      >
        {outline}
      </span>
    </div>
  );
};

const formatPointInRows = (rows: BlockRowDescriptor[], point: Point) => {
  const row = rows.find((innerRow) => innerRow.path[0] === point.path[0]);

  if (!row) {
    return `${point.path.join('.')}:${point.offset}`;
  }

  return `${row.path.join('.')}:${toBlockOffset(row, point)}`;
};

const formatAnnotationRange = (
  range: Range | null,
  rows: BlockRowDescriptor[]
) =>
  range
    ? `${formatPointInRows(rows, range.anchor)}|${formatPointInRows(
        rows,
        range.focus
      )}`
    : 'none';

const AnnotationSidebar = ({
  entry,
}: {
  entry: ResolvedAnchorEntry | null;
}) => {
  const rows = useEditorSelector((editor) =>
    getBlockRows(editor.read.children())
  );

  return (
    <div className="editor-persistent-annotation-anchors-row">
      <strong>Annotation sidebar</strong>
      <span
        className="editor-persistent-annotation-anchors-code"
        id="annotation-sidebar"
      >
        {entry
          ? `${entry.id}:${entry.data.label}:${formatAnnotationRange(
              entry.range,
              rows
            )}`
          : 'none'}
      </span>
    </div>
  );
};

const AnchoredProjectionContent = ({
  annotation,
  editor,
  entry,
  onAddAnnotation,
  onClearAnnotation,
}: {
  annotation: Anchor<Range> | null;
  editor: ReturnType<typeof createEditor>;
  entry: ResolvedAnchorEntry | null;
  onAddAnnotation: (annotation: Anchor<Range>) => void;
  onClearAnnotation: () => void;
}) => {
  const alphaRow = useEditorSelector(
    (innerEditor) =>
      getBlockRowByText(innerEditor.read.children(), (text) =>
        text.includes('alpha')
      ) ?? null,
    {
      equalityFn: (left, right) =>
        left != null &&
        right != null &&
        left.text === right.text &&
        left.path.join('.') === right.path.join('.'),
    }
  );
  const betaRow = useEditorSelector(
    (innerEditor2) =>
      getBlockRowByText(
        innerEditor2.read.children(),
        (text) => text === 'beta'
      ) ?? null,
    {
      equalityFn: (left, right) =>
        left != null &&
        right != null &&
        left.text === right.text &&
        left.path.join('.') === right.path.join('.'),
    }
  );

  return (
    <div
      className="editor-persistent-annotation-anchors-panel"
      id="editor-root"
    >
      <Instruction>
        Persistent anchors keep the annotation slice attached to the same
        logical text even when the document shape changes.
      </Instruction>

      <div className="editor-persistent-annotation-anchors-controls">
        <Button
          disabled={!!annotation || !alphaRow}
          id="add-anchor"
          onClick={() => {
            const range = getRangeInsideText(editor, 'alpha', 1, 4);

            onAddAnnotation(
              editor.anchor(range, { association: 'inward', deletion: 'drop' })
            );
          }}
          type="button"
          variant="outline"
        >
          Add anchor
        </Button>
        <Button
          disabled={!alphaRow}
          id="insert-fragment"
          onClick={() => {
            const path = getLeafPathByText(editor, (text) =>
              text.includes('alpha')
            );
            const at = { path, offset: 0 };

            editor.update((tx) => {
              tx.selection.set({
                anchor: at,
                focus: at,
              });
              tx.fragment.replace([
                {
                  type: 'paragraph',
                  children: [{ text: 'intro-a' }],
                },
                {
                  type: 'paragraph',
                  children: [{ text: 'intro-b' }],
                },
              ]);
            });
          }}
          type="button"
          variant="outline"
        >
          Insert fragment before anchor
        </Button>
        <Button
          disabled={!alphaRow}
          id="insert-prefix"
          onClick={() => {
            const at = getPointBeforeText(editor, 'alpha');

            editor.update.text.insert('>', {
              at,
            });
          }}
          type="button"
          variant="outline"
        >
          Insert prefix
        </Button>
        <Button
          disabled={!entry?.range}
          id="delete-anchor-text"
          onClick={() => {
            const range = annotation?.resolve(editor);

            if (!range) {
              return;
            }

            editor.update.text.delete({ at: range });
          }}
          type="button"
          variant="outline"
        >
          Delete anchor text
        </Button>
        <Button
          disabled={!annotation}
          id="clear-anchor"
          onClick={onClearAnnotation}
          type="button"
          variant="outline"
        >
          Clear anchor
        </Button>
      </div>

      <Outline />
      {alphaRow ? (
        <ProjectionRow entry={entry} row={alphaRow} slot="left" />
      ) : null}
      {betaRow ? (
        <ProjectionRow entry={entry} row={betaRow} slot="right" />
      ) : null}
      <AnnotationSidebar entry={entry} />
    </div>
  );
};

const MountedPersistentAnnotationAnchors = ({
  annotation,
  onAddAnnotation,
  onClearAnnotation,
}: {
  annotation: Anchor<Range> | null;
  onAddAnnotation: (annotation: Anchor<Range>) => void;
  onClearAnnotation: () => void;
}) => {
  const editor = useEditor();
  const range = useEditorSelector(
    (currentEditor) => annotation?.resolve(currentEditor) ?? null,
    {
      equalityFn: (left, right) => RangeApi.equals(left, right),
    }
  );
  const entry: ResolvedAnchorEntry | null = annotation
    ? {
        data: {
          kind: 'annotation',
          label: 'Comment anchor',
          tone: 'persistent',
        },
        id: 'comment-anchor',
        range,
      }
    : null;

  return (
    <AnchoredProjectionContent
      annotation={annotation}
      editor={editor}
      entry={entry}
      onAddAnnotation={onAddAnnotation}
      onClearAnnotation={onClearAnnotation}
    />
  );
};

const PersistentAnnotationAnchorsExample = () => {
  const editor = useCreateEditor({
    plugins: [history()],
    initialValue: createChildren(),
  });
  const [annotation, setAnnotation] = useState<Anchor<Range> | null>(null);
  const annotationRef = useRef<Anchor<Range> | null>(null);
  const addAnnotation = useCallback((next: Anchor<Range>) => {
    if (annotationRef.current) {
      next.release();
      return;
    }

    annotationRef.current = next;
    setAnnotation(next);
  }, []);
  const clearAnnotation = useCallback(() => {
    const { current } = annotationRef;

    annotationRef.current = null;
    current?.release();
    setAnnotation(null);
  }, []);

  useEffect(
    () => () => {
      annotationRef.current?.release();
      annotationRef.current = null;
    },
    []
  );

  return (
    <EditorRoot editor={editor}>
      <MountedPersistentAnnotationAnchors
        annotation={annotation}
        onAddAnnotation={addAnnotation}
        onClearAnnotation={clearAnnotation}
      />
    </EditorRoot>
  );
};

export default PersistentAnnotationAnchorsExample;
