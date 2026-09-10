import { clsx } from 'clsx';
import React from 'react';

import {
  isElementDecorationsEqual,
  isTextDecorationsEqual,
} from '../../dom/plite-dom.internal';
import {
  type DecoratedRange,
  type Descendant,
  type EditorDocumentValue,
  type Element,
  type NodeEntry,
  type Path,
  type Text,
  ElementApi,
  NodeApi,
  RangeApi,
  TextApi,
  MAIN_ROOT_KEY,
} from '../../facade';
import { failInvariant } from '../../internal/failInvariant';
import type { EditableProps, Editor, RenderElementSlots } from '../../lib';
import { createStaticDocument, type StaticDocument } from '../document';
import {
  observeStaticDocument,
  staticReadsEqual,
} from '../internal/observeStaticDocument';
import { writeStaticSelectionClipboardData } from '../internal/writeStaticSelectionClipboardData';
import { pipeRenderElementStatic } from '../pipeRenderElementStatic';
import { pipeRenderLeafStatic } from '../pluginRenderLeafStatic';
import { pipeRenderTextStatic } from '../pluginRenderTextStatic';
import { getStaticRenderRuntime, type StaticRenderers } from '../renderers';
import type { PliteRenderElementProps } from '../types';
import { pipeDecorate } from '../utils/pipeDecorate';

const EMPTY_PATH: Path = [];
const EMPTY_ROOT_STACK: readonly string[] = [];

function BaseElementStatic({
  contentRootValues: _contentRootValues,
  decorate,
  decorations,
  editor,
  document: staticDocument,
  controlled,
  renderers,
  element,
  path,
  rootStack,
}: {
  contentRootValues: ReadonlyArray<readonly Descendant[]>;
  decorate: EditableProps['decorate'];
  decorations: DecoratedRange[];
  editor: Editor;
  document?: StaticDocument;
  controlled?: boolean;
  renderers?: StaticRenderers;
  element: Element;
  path: Path;
  rootStack: readonly string[];
  style?: React.CSSProperties;
}) {
  const document =
    staticDocument ??
    createStaticDocument(editor.read.value(), editor.read.schema);
  const renderElement = pipeRenderElementStatic(editor, { renderers });

  const attributes: PliteRenderElementProps['attributes'] = {
    'data-plite-node': 'element',
    'data-plite-path': path.join(','),
    'data-plite-root': rootStack.at(-1) ?? MAIN_ROOT_KEY,
  };

  const renderChildren = (range: { from?: number; to?: number } = {}) => (
    <Children
      decorate={decorate}
      decorations={decorations}
      editor={editor}
      document={document}
      controlled={controlled}
      renderers={renderers}
      from={range.from}
      nodes={element.children}
      parentPath={path}
      rootStack={rootStack}
      to={range.to ?? range.from}
    />
  );
  let children: React.ReactNode = renderChildren();

  const slots = {
    children: renderChildren,
    contentBoundary: ({ children: boundaryChildren, scope }) =>
      boundaryChildren ??
      (scope.type === 'self'
        ? renderChildren()
        : renderChildren({ from: scope.from, to: scope.to })),
    contentRoot: (slot) => {
      const root = editor.read.schema.getElementContentRoots(element)[slot];

      if (!root) {
        throw new Error(
          `Element "${element.type}" does not own content root slot "${slot}".`
        );
      }
      if (rootStack.includes(root)) {
        throw new Error(
          `Content root "${root}" cannot recursively render itself.`
        );
      }

      const nodes = document.forRoot(root).children();

      return (
        <Children
          decorate={decorate}
          decorations={[]}
          editor={editor}
          document={document.forRoot(root)}
          controlled={controlled}
          renderers={renderers}
          nodes={nodes}
          rootStack={[...rootStack, root]}
        />
      );
    },
  } satisfies RenderElementSlots;

  if (editor.read.schema.isVoid(element)) {
    attributes['data-plite-void'] = true;
    children = (
      <span
        style={{
          color: 'transparent',
          height: '0',
          position: 'absolute',
        }}
        data-plite-spacer
      >
        {renderChildren()}
      </span>
    );
  }
  if (editor.read.schema.isInline(element)) {
    attributes['data-plite-inline'] = true;
  }

  return (
    <>
      {renderElement?.({
        attributes,
        children,
        element,
        path,
        slots,
        ...{ document },
      })}
    </>
  );
}

export const ElementStatic = React.memo(
  BaseElementStatic,
  (prev, next) =>
    prev.element === next.element &&
    prev.editor === next.editor &&
    prev.path.join(',') === next.path.join(',') &&
    prev.renderers === next.renderers &&
    (!next.controlled || staticReadsEqual(prev.document, next.document)) &&
    prev.contentRootValues.length === next.contentRootValues.length &&
    prev.contentRootValues.every(
      (children, index) => children === next.contentRootValues[index]
    ) &&
    isElementDecorationsEqual(prev.decorations, next.decorations)
);

function BaseLeafStatic({
  decorations,
  editor,
  document: staticDocument,
  renderers,
  path,
  text,
}: {
  decorations: DecoratedRange[];
  editor: Editor;
  document?: StaticDocument;
  controlled?: boolean;
  renderers?: StaticRenderers;
  path: Path;
  text: Text;
}) {
  const document =
    staticDocument ??
    createStaticDocument(editor.read.value(), editor.read.schema);
  const renderLeaf = pipeRenderLeafStatic(editor, { renderers });
  const renderText = pipeRenderTextStatic(editor, { renderers });

  const decoratedLeaves = TextApi.decorations(text, decorations);

  const leafElements = decoratedLeaves.map(({ leaf, position }) => {
    const leafElement = renderLeaf({
      attributes: { 'data-plite-leaf': true },
      children: (
        <span data-plite-string={true}>
          {leaf.text === '' ? '\uFEFF' : leaf.text}
        </span>
      ),
      ...{ document },
      leaf,
      leafPosition: position,
      path,
      text: leaf,
    });

    return (
      <React.Fragment
        key={`${position?.start ?? 0}:${position?.end ?? leaf.text.length}`}
      >
        {leafElement}
      </React.Fragment>
    );
  });

  return renderText({
    attributes: {
      'data-plite-node': 'text' as const,
      'data-plite-path': path.join(','),
      'data-plite-root': document.root ?? MAIN_ROOT_KEY,
      ref: null,
    },
    children: leafElements,
    path,
    text,
    ...{ document },
  });
}

export const LeafStatic = React.memo(
  BaseLeafStatic,
  (prev, next) =>
    prev.editor === next.editor &&
    prev.path.join(',') === next.path.join(',') &&
    (!next.controlled || staticReadsEqual(prev.document, next.document)) &&
    prev.renderers === next.renderers &&
    TextApi.equals(next.text, prev.text) &&
    isTextDecorationsEqual(next.decorations, prev.decorations)
);

const defaultDecorate: (entry: NodeEntry) => DecoratedRange[] = () => [];

function Children({
  decorate = defaultDecorate,
  decorations,
  editor,
  document: staticDocument,
  controlled,
  renderers,
  from,
  nodes,
  parentPath = EMPTY_PATH,
  rootStack = EMPTY_ROOT_STACK,
  to,
}: {
  decorate: EditableProps['decorate'];
  decorations: DecoratedRange[];
  editor: Editor;
  document?: StaticDocument;
  controlled?: boolean;
  renderers?: StaticRenderers;
  from?: number;
  nodes: readonly Descendant[];
  parentPath?: Path;
  rootStack?: readonly string[];
  to?: number;
}) {
  const document =
    staticDocument ??
    createStaticDocument(editor.read.value(), editor.read.schema);

  return (
    <>
      {nodes.map((child, i) => {
        if (from !== undefined && (i < from || i > (to ?? from))) return null;

        const p = [...parentPath, i];

        let ds: DecoratedRange[] = [];

        const [first, firstPath] = NodeApi.first(child, EMPTY_PATH);
        const [last, lastPath] = NodeApi.last(child, EMPTY_PATH);
        const range =
          TextApi.isText(first) && TextApi.isText(last)
            ? {
                anchor: { offset: 0, path: [...p, ...firstPath] },
                focus: { offset: last.text.length, path: [...p, ...lastPath] },
              }
            : null;

        if (range) {
          ds = decorate([child, p]);

          for (const dec of decorations) {
            const d = RangeApi.intersection(dec, range);

            if (d) {
              ds.push(d);
            }
          }
        }

        return ElementApi.isElement(child) ? (
          <ElementStatic
            key={p.join('.')}
            contentRootValues={Object.values(
              editor.read.schema.getElementContentRoots(child)
            ).map((innerRoot) => document.forRoot(innerRoot).children())}
            decorate={decorate}
            decorations={ds}
            editor={editor}
            document={
              parentPath.length === 0 && controlled
                ? observeStaticDocument(document)
                : document
            }
            controlled={controlled}
            renderers={renderers}
            element={child}
            path={p}
            rootStack={rootStack}
          />
        ) : (
          <LeafStatic
            key={p.join('.')}
            decorations={ds}
            editor={editor}
            document={
              parentPath.length === 0 && controlled
                ? observeStaticDocument(document)
                : document
            }
            controlled={controlled}
            renderers={renderers}
            path={p}
            text={child}
          />
        );
      })}
    </>
  );
}

export type PlateStaticProps<E = Editor> = {
  /** Installed schema, codecs, and static renderer configuration. */
  editor: E;
  /** Immutable document to render. Defaults to the editor document. */
  value?: EditorDocumentValue;
  /** Explicit static presentation configuration when sharing a live editor. */
  renderers?: StaticRenderers;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>;

export function PlateStatic<E = Editor>(props: PlateStaticProps<E>) {
  const {
    className,
    editor: editorInput,
    value,
    onCopy,
    onPointerDownCapture,
    renderers,
    ...rest
  } = props;
  const editor = editorInput as Editor;

  const renderedValue = value ?? editor.read.value();
  const id = React.useId();
  const document = React.useMemo(
    () => createStaticDocument(renderedValue, editor.read.schema, { id }),
    [editor, renderedValue, id]
  );
  const decorate = pipeDecorate(
    editor,
    undefined,
    undefined,
    renderers ? getStaticRenderRuntime(editor, renderers) : undefined
  );

  const content = (
    <div
      className={clsx('plite-editor', className)}
      data-plite-editor
      data-plite-node="value"
      tabIndex={-1}
      {...rest}
      onPointerDownCapture={(event) => {
        onPointerDownCapture?.(event);
        if (!event.defaultPrevented) {
          event.currentTarget.focus({ preventScroll: true });
        }
      }}
      onCopy={(event) => {
        onCopy?.(event);
        if (
          !event.defaultPrevented &&
          writeStaticSelectionClipboardData(editor, event.clipboardData, {
            document,
            element: event.currentTarget,
          })
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <Children
        decorate={decorate}
        decorations={[]}
        editor={editor}
        document={document}
        controlled={value !== undefined}
        renderers={renderers}
        nodes={document.children()}
        rootStack={[]}
      />
    </div>
  );

  let aboveEditable: React.ReactNode = content;

  // Use pre-computed arrays for aboveEditable components
  getStaticRenderRuntime(
    editor,
    renderers
  ).pluginCache.render.aboveEditable.forEach((name) => {
    const plugin =
      getStaticRenderRuntime(editor, renderers).plugins[name] ??
      failInvariant('Expected value to be defined');
    const AboveEditable = plugin.render.aboveEditable;

    if (AboveEditable) {
      aboveEditable = <AboveEditable>{aboveEditable}</AboveEditable>;
    }
  });

  return aboveEditable;
}
