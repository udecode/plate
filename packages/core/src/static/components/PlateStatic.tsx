import React from 'react';

import {
  type DecoratedRange,
  type Descendant,
  type Element,
  type NodeEntry,
  type Path,
  type Text,
  ElementApi,
  NodeApi,
  RangeApi,
  TextApi,
} from '@platejs/plite';
import {
  isElementDecorationsEqual,
  isTextDecorationsEqual,
} from '@platejs/plite-dom';
import { MAIN_ROOT_KEY } from '@platejs/plite/internal';
import clsx from 'clsx';

import type { EditableProps, BaseEditor, RenderElementSlots } from '../../lib';
import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import type { PliteRenderElementProps } from '../types';

import { pipeRenderElementStatic } from '../pipeRenderElementStatic';
import { pipeRenderLeafStatic } from '../pluginRenderLeafStatic';
import { pipeRenderTextStatic } from '../pluginRenderTextStatic';
import { pipeDecorate } from '../utils/pipeDecorate';

function BaseElementStatic({
  contentRootValues: _contentRootValues,
  decorate,
  decorations,
  editor,
  element = { children: [], type: '' },
  path,
  rootNodes,
  rootStack,
}: {
  contentRootValues: readonly (readonly Descendant[])[];
  decorate: EditableProps['decorate'];
  decorations: DecoratedRange[];
  editor: BaseEditor;
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
      decorate={decorate}
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
          decorate={decorate}
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
          outline: 'none',
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

export const ElementStatic = React.memo(
  BaseElementStatic,
  (prev, next) =>
    prev.element === next.element &&
    prev.contentRootValues.length === next.contentRootValues.length &&
    prev.contentRootValues.every(
      (children, index) => children === next.contentRootValues[index]
    ) &&
    isElementDecorationsEqual(prev.decorations, next.decorations)
);

function BaseLeafStatic({
  decorations,
  editor,
  path,
  text = { text: '' },
}: {
  decorations: DecoratedRange[];
  editor: BaseEditor;
  path: Path;
  text: Text;
}) {
  const renderLeaf = pipeRenderLeafStatic(editor);
  const renderText = pipeRenderTextStatic(editor);

  const decoratedLeaves = TextApi.decorations(text, decorations);

  const leafElements = decoratedLeaves.map(({ leaf, position }, index) => {
    const leafElement = renderLeaf({
      attributes: { 'data-plite-leaf': true },
      children: (
        <span data-plite-string={true}>
          {leaf.text === '' ? '\uFEFF' : leaf.text}
        </span>
      ),
      leaf,
      leafPosition: position,
      path,
      text: leaf,
    });

    return <React.Fragment key={index}>{leafElement}</React.Fragment>;
  });

  return renderText({
    attributes: { 'data-plite-node': 'text' as const, ref: null },
    children: leafElements,
    path,
    text,
  });
}

export const LeafStatic = React.memo(BaseLeafStatic, (prev, next) => {
  return (
    // prev.text === next.text &&
    TextApi.equals(next.text, prev.text) &&
    isTextDecorationsEqual(next.decorations, prev.decorations)
  );
});

const defaultDecorate: (entry: NodeEntry) => DecoratedRange[] = () => [];

function Children({
  decorate = defaultDecorate,
  decorations = [],
  editor,
  from,
  nodes = [],
  parentPath = [],
  rootNodes = nodes,
  rootStack = [],
  to,
}: {
  decorate: EditableProps['decorate'];
  decorations: DecoratedRange[];
  editor: BaseEditor;
  from?: number;
  nodes: readonly Descendant[];
  parentPath?: Path;
  rootNodes?: readonly Descendant[];
  rootStack?: readonly string[];
  to?: number;
}) {
  const root: Element = {
    children: rootNodes as Descendant[],
    type: 'static-root',
  };

  return (
    <>
      {nodes.map((child, i) => {
        if (from !== undefined && (i < from || i > (to ?? from))) return null;

        const p = [...parentPath, i];

        let ds: DecoratedRange[] = [];

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
            key={i}
            contentRootValues={Object.values(
              editor.read.schema.getElementContentRoots(child)
            ).map((root) => editor.read.root(root))}
            decorate={decorate}
            decorations={ds}
            editor={editor}
            element={child}
            path={p}
            rootNodes={rootNodes}
            rootStack={rootStack}
          />
        ) : (
          <LeafStatic
            key={i}
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

export type PlateStaticProps<E = BaseEditor> = {
  /** Editor instance. */
  editor: E;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>;

export function PlateStatic<E = BaseEditor>(props: PlateStaticProps<E>) {
  const { className, editor: editorInput, ...rest } = props;
  const editor = editorInput as BaseEditor;

  const decorate = pipeDecorate(editor);

  let afterEditable: React.ReactNode = null;
  let beforeEditable: React.ReactNode = null;

  getPlateRuntime(editor).pluginCache.render.beforeEditable.forEach((name) => {
    const plugin = getCompiledPlatePlugin(editor, name)!;
    const BeforeEditable = plugin.render.beforeEditable;

    if (BeforeEditable) {
      beforeEditable = (
        <>
          {beforeEditable}
          <BeforeEditable />
        </>
      );
    }
  });

  getPlateRuntime(editor).pluginCache.render.afterEditable.forEach((name) => {
    const plugin = getCompiledPlatePlugin(editor, name)!;
    const AfterEditable = plugin.render.afterEditable;

    if (AfterEditable) {
      afterEditable = (
        <>
          {afterEditable}
          <AfterEditable />
        </>
      );
    }
  });

  const content = (
    <div
      className={clsx('plite-editor', className)}
      data-plite-editor
      data-plite-node="value"
      {...rest}
    >
      <Children
        decorate={decorate}
        decorations={[]}
        editor={editor}
        nodes={editor.read.children()}
        rootNodes={editor.read.children()}
        rootStack={[]}
      />
    </div>
  );

  let aboveEditable: React.ReactNode = (
    <>
      {beforeEditable}
      {content}
      {afterEditable}
    </>
  );

  // Use pre-computed arrays for aboveEditable components
  getPlateRuntime(editor).pluginCache.render.aboveEditable.forEach((name) => {
    const plugin = getCompiledPlatePlugin(editor, name)!;
    const AboveEditable = plugin.render.aboveEditable;

    if (AboveEditable) {
      aboveEditable = <AboveEditable>{aboveEditable}</AboveEditable>;
    }
  });

  return aboveEditable;
}
