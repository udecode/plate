import React from 'react';

import {
  type DecoratedRange,
  type Descendant,
  type Element,
  type NodeEntry,
  type Path,
  type Text,
  ElementApi,
  RangeApi,
  TextApi,
} from '@platejs/plite';
import {
  isElementDecorationsEqual,
  isTextDecorationsEqual,
} from '@platejs/plite-dom';
import clsx from 'clsx';

import type { EditableProps, BaseEditor } from '../../lib';
import type { PliteRenderElementProps } from '../types';

import { pipeRenderElementStatic } from '../pipeRenderElementStatic';
import { pipeRenderLeafStatic } from '../pluginRenderLeafStatic';
import { pipeRenderTextStatic } from '../pluginRenderTextStatic';
import { pipeDecorate } from '../utils/pipeDecorate';

function BaseElementStatic({
  decorate,
  decorations,
  editor,
  element = { children: [], type: '' },
  path,
}: {
  decorate: EditableProps['decorate'];
  decorations: DecoratedRange[];
  editor: BaseEditor;
  element: Element;
  path: Path;
  style?: React.CSSProperties;
}) {
  const renderElement = pipeRenderElementStatic(editor);

  const attributes: PliteRenderElementProps['attributes'] = {
    'data-plite-node': 'element',
  };

  let children: React.ReactNode = (
    <Children
      decorate={decorate}
      decorations={decorations}
      editor={editor}
      nodes={element.children}
      parentPath={path}
    />
  );

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
        <Children
          decorate={decorate}
          decorations={decorations}
          editor={editor}
          nodes={element.children}
          parentPath={path}
        />
      </span>
    );
  }
  if (editor.read.schema.isInline(element)) {
    attributes['data-plite-inline'] = true;
  }

  return <>{renderElement?.({ attributes, children, element, path })}</>;
}

export const ElementStatic = React.memo(
  BaseElementStatic,
  (prev, next) =>
    prev.element === next.element &&
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
  nodes = [],
  parentPath = [],
}: {
  decorate: EditableProps['decorate'];
  decorations: DecoratedRange[];
  editor: BaseEditor;
  nodes: readonly Descendant[];
  parentPath?: Path;
}) {
  return (
    <>
      {nodes.map((child, i) => {
        const p = [...parentPath, i];

        let ds: DecoratedRange[] = [];

        const range = editor.read.ranges.get(p);

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
            decorate={decorate}
            decorations={ds}
            editor={editor}
            element={child}
            path={p}
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

export type PlateStaticProps = {
  /** Editor instance. */
  editor: BaseEditor;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>;

export function PlateStatic(props: PlateStaticProps) {
  const { className, editor, ...rest } = props;

  const decorate = pipeDecorate(editor);

  let afterEditable: React.ReactNode = null;
  let beforeEditable: React.ReactNode = null;

  editor.runtime.pluginCache.render.beforeEditable.forEach((key) => {
    const plugin = editor.getPlugin({ key });
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

  editor.runtime.pluginCache.render.afterEditable.forEach((key) => {
    const plugin = editor.getPlugin({ key });
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
  editor.runtime.pluginCache.render.aboveEditable.forEach((key) => {
    const plugin = editor.getPlugin({ key });
    const AboveEditable = plugin.render.aboveEditable;

    if (AboveEditable) {
      aboveEditable = <AboveEditable>{aboveEditable}</AboveEditable>;
    }
  });

  return aboveEditable;
}
