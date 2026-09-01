import type { Anchor, createEditor, Path, Point, Range, Value } from 'plitejs';
import {
  Plite,
  useEditorSelector,
  usePliteAnnotationStore,
  usePliteAnnotations,
  useEditor,
  usePliteWidgetStore,
  usePliteWidgets,
} from 'plitejs/react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';

import { failInvariant } from '../../../../../lib/failInvariant';
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

const ProjectionRow = ({
  row,
  slot,
}: {
  row: BlockRowDescriptor;
  slot: 'left' | 'right';
}) => {
  const snapshot = usePliteAnnotations<{
    kind: string;
    label: string;
    tone?: string;
  }>();
  const projectionText =
    snapshot.allIds.length === 0
      ? 'none'
      : snapshot.allIds
          .flatMap((id) => {
            const annotation = snapshot.byId.get(id);

            if (
              !annotation?.range ||
              annotation.range.anchor.path[0] !== row.path[0] ||
              annotation.range.focus.path[0] !== row.path[0]
            ) {
              return [];
            }

            return [
              `${id}:${toBlockOffset(
                row,
                annotation.range.anchor
              )}-${toBlockOffset(row, annotation.range.focus)}:${
                annotation.data?.kind ?? 'unknown'
              }:${annotation.data?.tone ?? 'none'}`,
            ];
          })
          .join('|') || 'none';

  return (
    <div className="plite-persistent-annotation-anchors-row">
      <span
        className="plite-persistent-annotation-anchors-code"
        id={`${slot}-text`}
      >
        {row.text}
      </span>
      <span
        className="plite-persistent-annotation-anchors-code"
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
    <div className="plite-persistent-annotation-anchors-row">
      <strong>Document outline</strong>
      <span
        className="plite-persistent-annotation-anchors-code"
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

const AnnotationSidebar = () => {
  const snapshot = usePliteAnnotations<{
    kind: string;
    label: string;
    tone?: string;
  }>();
  const rows = useEditorSelector((editor) =>
    getBlockRows(editor.read.children())
  );

  return (
    <div className="plite-persistent-annotation-anchors-row">
      <strong>Annotation sidebar</strong>
      <span
        className="plite-persistent-annotation-anchors-code"
        id="annotation-sidebar"
      >
        {snapshot.allIds.length === 0
          ? 'none'
          : snapshot.allIds
              .map((id) => {
                const annotation =
                  snapshot.byId.get(id) ??
                  failInvariant('Expected value to be defined');

                return `${annotation.id}:${
                  annotation.data?.label ?? 'none'
                }:${formatAnnotationRange(annotation.range, rows)}`;
              })
              .join('|')}
      </span>
    </div>
  );
};

const WidgetPanel = ({
  store,
}: {
  store: ReturnType<
    typeof usePliteWidgetStore<
      {
        label: string;
      },
      {
        kind: string;
        label: string;
        tone?: string;
      }
    >
  >;
}) => {
  const snapshot = usePliteWidgets(store);

  return (
    <div className="plite-persistent-annotation-anchors-row">
      <strong>Widget panel</strong>
      <span
        className="plite-persistent-annotation-anchors-code"
        id="widget-panel"
      >
        {snapshot.allIds.length === 0
          ? 'none'
          : snapshot.allIds
              .map((id) => {
                const widget =
                  snapshot.byId.get(id) ??
                  failInvariant('Expected value to be defined');

                return `${widget.id}:${widget.target.type}:${
                  widget.available ? 'visible' : 'hidden'
                }:${widget.data?.label ?? 'none'}`;
              })
              .join('|')}
      </span>
    </div>
  );
};

const AnchoredProjectionContent = ({
  annotation,
  editor,
  setAnnotation,
  widgetStore,
}: {
  annotation: Anchor<Range> | null;
  editor: ReturnType<typeof createEditor>;
  setAnnotation: React.Dispatch<React.SetStateAction<Anchor<Range> | null>>;
  widgetStore: ReturnType<
    typeof usePliteWidgetStore<
      {
        label: string;
      },
      {
        kind: string;
        label: string;
        tone?: string;
      }
    >
  >;
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
    <div className="plite-persistent-annotation-anchors-panel" id="editor-root">
      <Instruction>
        Persistent anchors keep the annotation slice attached to the same
        logical text even when the document shape changes.
      </Instruction>

      <div className="plite-persistent-annotation-anchors-controls">
        <Button
          disabled={!!annotation}
          id="add-anchor"
          onClick={() => {
            const path = getLeafPathByText(editor, (text) =>
              text.includes('alpha')
            );

            setAnnotation(
              (current) =>
                current ??
                editor.anchor(
                  {
                    anchor: { path, offset: 1 },
                    focus: { path, offset: 4 },
                  },
                  { association: 'inward', deletion: 'drop' }
                )
            );
          }}
          type="button"
          variant="outline"
        >
          Add anchor
        </Button>
        <Button
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
          disabled={!annotation}
          id="delete-anchor-text"
          onClick={() => {
            const range = getRangeInsideText(editor, 'alpha', 1, 4);

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
          onClick={() => {
            setAnnotation((current) => {
              current?.release();
              return null;
            });
          }}
          type="button"
          variant="outline"
        >
          Clear anchor
        </Button>
      </div>

      <Outline />
      {alphaRow ? <ProjectionRow row={alphaRow} slot="left" /> : null}
      {betaRow ? <ProjectionRow row={betaRow} slot="right" /> : null}
      <AnnotationSidebar />
      <WidgetPanel store={widgetStore} />
    </div>
  );
};

const PersistentAnnotationAnchorsExample = () => {
  const editor = useEditor({ initialValue: createChildren() });
  const [annotation, setAnnotation] = useState<Anchor<Range> | null>(null);
  const annotations = useMemo(
    () =>
      annotation
        ? [
            {
              anchor: annotation,
              data: {
                kind: 'annotation',
                label: 'Comment anchor',
                tone: 'persistent',
              },
              id: 'comment-anchor',
              projection: {
                kind: 'annotation',
                tone: 'persistent',
              },
            },
          ]
        : [],
    [annotation]
  );
  const annotationStore = usePliteAnnotationStore(editor, annotations);
  const widgets = useMemo(
    () =>
      annotation
        ? [
            {
              target: {
                annotationId: 'comment-anchor',
                type: 'annotation' as const,
              },
              data: {
                label: 'Comment widget',
              },
              id: 'comment-widget',
            },
          ]
        : [],
    [annotation]
  );
  const widgetStore = usePliteWidgetStore(editor, widgets, {
    annotationStore,
  });

  return (
    <Plite annotationStore={annotationStore} editor={editor}>
      <AnchoredProjectionContent
        annotation={annotation}
        editor={editor}
        setAnnotation={setAnnotation}
        widgetStore={widgetStore}
      />
    </Plite>
  );
};

export default PersistentAnnotationAnchorsExample;
