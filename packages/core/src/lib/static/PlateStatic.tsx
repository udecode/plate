/* eslint-disable react/no-children-prop */
import React from 'react';

import type { RenderElementFn, RenderLeafFn } from '@udecode/slate-react';
import type {
  EditableProps,
  RenderElementProps,
  RenderLeafProps,
} from 'slate-react/dist/components/editable';

import {
  type TDescendant,
  type TElement,
  type TText,
  isElement,
} from '@udecode/slate';

import type { SlateEditor } from '..';

import { pipeRenderStaticElement } from './pipeRenderStaticElement';
import { pipeRenderStaticLeaf } from './pipeRenderStaticLeaf';

export type ChildrenProps = {
  children: TDescendant[];
  editor: SlateEditor;
};

export type ElementProps = {
  editor: SlateEditor;
  element: TElement;
};

export type LeafProps = {
  editor: SlateEditor;
  leaf: TText;
};

export type PlateViewContextProps = {
  editor: SlateEditor;
  renderElement: RenderElementFn;
  renderLeaf: RenderLeafFn;
};

export type PlateViewProps = {
  editor: SlateEditor;
  renderElement?: EditableProps['renderElement'];
  renderLeaf?: EditableProps['renderLeaf'];
};

function Element({
  editor,
  element = { children: [], type: '' },
}: ElementProps) {
  const renderElement = pipeRenderStaticElement(editor);

  return (
    <React.Fragment>
      {renderElement?.({
        attributes: { 'data-slate-node': 'element' } as any,
        children: (
          <PlateViewContent children={element.children} editor={editor} />
        ),
        element,
      })}
    </React.Fragment>
  );
}

function Leaf({ editor, leaf = { text: '' } }: LeafProps) {
  const renderLeaf = pipeRenderStaticLeaf(editor);

  return renderLeaf!({
    attributes: { 'data-slate-leaf': true } as any,
    children: createStaticString({ text: leaf.text }),
    leaf,
    text: leaf,
  });
}

function PlateViewContent({ children = [], editor }: ChildrenProps) {
  return (
    <React.Fragment>
      {children.map((child, i) => {
        return isElement(child) ? (
          <Element key={i} editor={editor} element={child} />
        ) : (
          <Leaf key={i} editor={editor} leaf={child} />
        );
      })}
    </React.Fragment>
  );
}

export function PlateStatic(props: PlateViewProps) {
  const { editor } = props;

  return <PlateViewContent children={editor.children} editor={editor} />;
}

export function DefaultStaticElement({
  attributes,
  children,
}: RenderElementProps) {
  return <div {...attributes}>{children}</div>;
}

export function DefaultStaticLeaf({ attributes, children }: RenderLeafProps) {
  return <span {...attributes}>{children}</span>;
}

export function createStaticString({ text }: { text: string }) {
  return React.createElement(
    'span',
    { 'data-slate-string': true },
    text === '' ? '\uFEFF' : text
  );
}

// export function PlateStaticLeaf({ as, attributes, children }: StaticLeafProps) {
//   const Leaf = (as ?? 'span') as any;

//   return <Leaf {...attributes}>{children}</Leaf>;
// }

// export const PlateStaticElement = ({
//   attributes,
//   children,
// }: StaticElementProps) => {
//   return <div {...attributes}>{children}</div>;
// };
