import React from 'react';

import {
  type DecoratedRange,
  type Descendant,
  type NodeEntry,
  type TElement,
  type TText,
  type Value,
  ElementApi,
  isElementDecorationsEqual,
  isTextDecorationsEqual,
  RangeApi,
  TextApi,
} from '@platejs/slate';
import clsx from 'clsx';

import type { EditableProps, SlateEditor } from '../../lib';
import type { SlateRenderElementProps } from '../types';

import { pipeRenderElementStatic } from '../pipeRenderElementStatic';
import { pipeRenderLeafStatic } from '../pluginRenderLeafStatic';
import { pipeRenderTextStatic } from '../pluginRenderTextStatic';
import { pipeDecorate } from '../utils/pipeDecorate';

function BaseElementStatic({
  decorate,
  decorations,
  editor,
  element = { children: [], type: '' },
}: {
  decorate: EditableProps['decorate'];
  decorations: DecoratedRange[];
  editor: SlateEditor;
  element: TElement;
  style?: React.CSSProperties;
}) {
  const renderElement = pipeRenderElementStatic(editor);

  const attributes: SlateRenderElementProps['attributes'] = {
    'data-slate-node': 'element',
    ref: null,
  };

  let children: React.ReactNode = (
    <Children decorate={decorate} decorations={decorations} editor={editor}>
      {element.children}
    </Children>
  );

  if (editor.api.isVoid(element)) {
    attributes['data-slate-void'] = true;
    children = (
      <span
        style={{
          color: 'transparent',
          height: '0',
          outline: 'none',
          position: 'absolute',
        }}
        data-slate-spacer
      >
        <Children decorate={decorate} decorations={decorations} editor={editor}>
          {element.children}
        </Children>
      </span>
    );
  }
  if (editor.api.isInline(element)) {
    attributes['data-slate-inline'] = true;
  }

  return <>{renderElement?.({ attributes, children, element })}</>;
}

export const ElementStatic = React.memo(
  BaseElementStatic,
  (prev, next) =>
    (prev.element === next.element ||
      (prev.element._memo !== undefined &&
        prev.element._memo === next.element._memo)) &&
    isElementDecorationsEqual(prev.decorations, next.decorations)
);

function BaseLeafStatic({
  decorations,
  editor,
  text = { text: '' },
}: {
  decorations: DecoratedRange[];
  editor: SlateEditor;
  text: TText;
}) {
  const renderLeaf = pipeRenderLeafStatic(editor);
  const renderText = pipeRenderTextStatic(editor);

  const decoratedLeaves = TextApi.decorations(text, decorations);

  const leafElements = decoratedLeaves.map(({ leaf, position }, index) => {
    const leafElement = renderLeaf({
      attributes: { 'data-slate-leaf': true },
      children: (
        <span data-slate-string={true}>
          {leaf.text === '' ? '\uFEFF' : leaf.text}
        </span>
      ),
      leaf: leaf as TText,
      leafPosition: position,
      text: leaf as TText,
    });

    return <React.Fragment key={index}>{leafElement}</React.Fragment>;
  });

  return renderText({
    attributes: { 'data-slate-node': 'text' as const, ref: null },
    children: leafElements,
    text: text as TText,
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
  children = [],
  decorate = defaultDecorate,
  decorations = [],
  editor,
}: {
  children: Descendant[];
  decorate: EditableProps['decorate'];
  decorations: DecoratedRange[];
  editor: SlateEditor;
}) {
  return (
    <>
      {children.map((child, i) => {
        const p = editor.api.findPath(child);

        let ds: DecoratedRange[] = [];

        if (p) {
          const range = editor.api.range(p)!;
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
          />
        ) : (
          <LeafStatic key={i} decorations={ds} editor={editor} text={child} />
        );
      })}
    </>
  );
}

export type PlateStaticProps = {
  /** Editor instance. */
  editor: SlateEditor;
  style?: React.CSSProperties;
  /** Controlled value. Alias to `editor.children`. */
  value?: Value;
} & React.HTMLAttributes<HTMLDivElement>;

export function PlateStatic(props: PlateStaticProps) {
  const { className, editor, value, ...rest } = props;

  if (value) {
    editor.children = value;
  }

  const decorate = pipeDecorate(editor);

  let afterEditable: React.ReactNode = null;
  let beforeEditable: React.ReactNode = null;

  editor.meta.pluginCache.render.beforeEditable.forEach((key) => {
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

  editor.meta.pluginCache.render.afterEditable.forEach((key) => {
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
      className={clsx('slate-editor', className)}
      data-slate-editor
      data-slate-node="value"
      {...rest}
    >
      <Children decorate={decorate} decorations={[]} editor={editor}>
        {editor.children}
      </Children>
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
  editor.meta.pluginCache.render.aboveEditable.forEach((key) => {
    const plugin = editor.getPlugin({ key });
    const AboveEditable = plugin.render.aboveEditable;

    if (AboveEditable) {
      aboveEditable = <AboveEditable>{aboveEditable}</AboveEditable>;
    }
  });

  return aboveEditable;
}
