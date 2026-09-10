import { clsx } from 'clsx';
import React from 'react';

import {
  type Descendant,
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
import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { getPlateDecorationSources } from '../../internal/plugin/getPlateDecorationSources';
import type { Editor, RenderElementSlots } from '../../lib';
import type {
  PliteDecoration,
  PliteDecorationAttributes,
  PliteDecorationSource,
} from '../internal/plite-react';
import { pipeRenderElementStatic } from '../pipeRenderElementStatic.internal';
import { pipeRenderLeafStatic } from '../pluginRenderLeafStatic.internal';
import { pipeRenderTextStatic } from '../pluginRenderTextStatic.internal';
import type { PliteRenderElementProps } from '../types';

const EMPTY_PATH: Path = [];
const EMPTY_ROOT_STACK: readonly string[] = [];

type StaticDecorationSlice = Readonly<{
  attributes: PliteDecorationAttributes;
  end: number;
  key: string;
  start: number;
}>;

const areStaticDecorationsEqual = (
  left: readonly PliteDecoration[],
  right: readonly PliteDecoration[]
) =>
  left === right ||
  (left.length === right.length &&
    left.every((decoration, index) => {
      const other = right[index];

      return (
        decoration.key === other?.key &&
        RangeApi.equals(decoration.range, other.range) &&
        JSON.stringify(decoration.attributes) ===
          JSON.stringify(other.attributes)
      );
    }));

const getStaticDecorationSlices = (
  text: Text,
  decorations: readonly PliteDecoration[]
): readonly StaticDecorationSlice[] =>
  decorations.flatMap(({ attributes, key, range }) => {
    const start = RangeApi.start(range);
    const end = RangeApi.end(range);

    if (start.path.join('.') !== end.path.join('.')) return [];

    return [
      {
        attributes,
        end: Math.min(text.text.length, end.offset),
        key,
        start: Math.max(0, start.offset),
      },
    ];
  });

const splitStaticText = (
  text: Text,
  decorations: readonly PliteDecoration[]
) => {
  const slices = getStaticDecorationSlices(text, decorations);

  if (text.text.length === 0) {
    return [{ decorations: [], end: 0, start: 0, text: '' }];
  }

  const boundaries = new Set<number>([0, text.text.length]);

  slices.forEach(({ end, start }) => {
    boundaries.add(start);
    boundaries.add(end);
  });
  const sorted = [...boundaries].sort((left, right) => left - right);

  return sorted.slice(0, -1).flatMap((start, index) => {
    const end = sorted[index + 1];

    if (start === end) return [];

    return [
      {
        decorations: slices.filter(
          (decoration) => decoration.start < end && decoration.end > start
        ),
        end,
        start,
        text: text.text.slice(start, end),
      },
    ];
  });
};

function BaseElementStatic({
  contentRootValues: _contentRootValues,
  sources,
  decorations,
  editor,
  element,
  path,
  rootNodes,
  rootStack,
}: {
  contentRootValues: ReadonlyArray<readonly Descendant[]>;
  sources: readonly PliteDecorationSource[];
  decorations: readonly PliteDecoration[];
  editor: Editor;
  element: Element;
  path: Path;
  rootNodes: readonly Descendant[];
  rootStack: readonly string[];
  style?: React.CSSProperties;
}) {
  const renderElement = pipeRenderElementStatic(editor);

  const attributes: PliteRenderElementProps['attributes'] = {
    'data-plite-node': 'element',
    'data-plite-path': path.join(','),
    'data-plite-root': rootStack.at(-1) ?? MAIN_ROOT_KEY,
  };

  const renderChildren = (range: { from?: number; to?: number } = {}) => (
    <Children
      sources={sources}
      decorations={decorations}
      editor={editor}
      from={range.from}
      nodes={element.children}
      parentPath={path}
      rootNodes={rootNodes}
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

      const nodes = editor.read.root(root);

      return (
        <Children
          sources={sources}
          decorations={[]}
          editor={editor}
          nodes={nodes}
          rootNodes={nodes}
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

  return <>{renderElement?.({ attributes, children, element, path, slots })}</>;
}

const ElementStatic = React.memo(
  BaseElementStatic,
  (prev, next) =>
    prev.element === next.element &&
    prev.contentRootValues.length === next.contentRootValues.length &&
    prev.contentRootValues.every(
      (children, index) => children === next.contentRootValues[index]
    ) &&
    areStaticDecorationsEqual(prev.decorations, next.decorations)
);

function BaseLeafStatic({
  decorations,
  editor,
  path,
  text,
}: {
  decorations: readonly PliteDecoration[];
  editor: Editor;
  path: Path;
  text: Text;
}) {
  const renderLeaf = pipeRenderLeafStatic(editor);
  const renderText = pipeRenderTextStatic(editor);

  const segments = splitStaticText(text, decorations);
  const leafElements = segments.map((segment, index) => {
    const leaf = { ...text, text: segment.text };
    const position =
      segments.length > 1
        ? {
            end: segment.end,
            isFirst: index === 0 ? (true as const) : undefined,
            isLast: index === segments.length - 1 ? (true as const) : undefined,
            start: segment.start,
          }
        : undefined;
    const content = segment.decorations.reduceRight(
      (children, decoration) => (
        <span key={decoration.key} {...decoration.attributes}>
          {children}
        </span>
      ),
      <span data-plite-string={true}>
        {segment.text === '' ? '\uFEFF' : segment.text}
      </span>
    );
    const leafElement = renderLeaf({
      attributes: { 'data-plite-leaf': true },
      children: content,
      leaf,
      leafPosition: position,
      path,
      text: leaf,
    });

    return (
      <React.Fragment
        key={`${position?.start ?? 0}:${position?.end ?? leaf.text.length}:${segment.decorations.map(({ key }) => key).join(':')}`}
      >
        {leafElement}
      </React.Fragment>
    );
  });

  return renderText({
    attributes: { 'data-plite-node': 'text' as const, ref: null },
    children: leafElements,
    path,
    text,
  });
}

const LeafStatic = React.memo(
  BaseLeafStatic,
  (prev, next) =>
    TextApi.equals(next.text, prev.text) &&
    areStaticDecorationsEqual(next.decorations, prev.decorations)
);

function Children({
  sources,
  decorations,
  editor,
  from,
  nodes,
  parentPath = EMPTY_PATH,
  rootNodes = nodes,
  rootStack = EMPTY_ROOT_STACK,
  to,
}: {
  sources: readonly PliteDecorationSource[];
  decorations: readonly PliteDecoration[];
  editor: Editor;
  from?: number;
  nodes: readonly Descendant[];
  parentPath?: Path;
  rootNodes?: readonly Descendant[];
  rootStack?: readonly string[];
  to?: number;
}) {
  const root: Element = {
    children: rootNodes,
    type: 'static-root',
  };

  return (
    <>
      {nodes.map((child, i) => {
        if (from !== undefined && (i < from || i > (to ?? from))) return null;

        const p = [...parentPath, i];

        let ds: PliteDecoration[] = [];

        const [first, firstPath] = NodeApi.first(root, p);
        const [last, lastPath] = NodeApi.last(root, p);
        const range =
          TextApi.isText(first) && TextApi.isText(last)
            ? {
                anchor: { offset: 0, path: firstPath },
                focus: { offset: last.text.length, path: lastPath },
              }
            : null;

        if (range) {
          const entry: NodeEntry = [child, p];

          ds = sources.flatMap((source) => source.read({ editor, entry }));

          for (const dec of decorations) {
            const intersection = RangeApi.intersection(dec.range, range);

            if (intersection) {
              ds.push({ ...dec, range: intersection });
            }
          }
        }

        return ElementApi.isElement(child) ? (
          <ElementStatic
            key={p.join('.')}
            contentRootValues={Object.values(
              editor.read.schema.getElementContentRoots(child)
            ).map((innerRoot) => editor.read.root(innerRoot))}
            sources={sources}
            decorations={ds}
            editor={editor}
            element={child}
            path={p}
            rootNodes={rootNodes}
            rootStack={rootStack}
          />
        ) : (
          <LeafStatic
            key={p.join('.')}
            decorations={ds}
            editor={editor}
            path={p}
            text={child}
          />
        );
      })}
    </>
  );
}

export type PlateStaticProps<E = Editor> = {
  /** Editor instance. */
  editor: E;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>;

export function PlateStatic<E = Editor>(props: PlateStaticProps<E>) {
  const { className, editor: editorInput, ...rest } = props;
  const editor = editorInput as Editor;

  const sources = getPlateDecorationSources(editor);

  const content = (
    <div
      className={clsx('plite-editor', className)}
      data-plite-editor
      data-plite-node="value"
      {...rest}
    >
      <Children
        sources={sources}
        decorations={[]}
        editor={editor}
        nodes={editor.read.children()}
        rootNodes={editor.read.children()}
        rootStack={[]}
      />
    </div>
  );

  let wrappedContent: React.ReactNode = content;

  getPlateRuntime(editor).pluginCache.slots.wrapContent.forEach((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');
    const WrapContent = plugin.slots.wrapContent;

    if (WrapContent) {
      wrappedContent = <WrapContent>{wrappedContent}</WrapContent>;
    }
  });

  return wrappedContent;
}
