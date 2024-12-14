import React from 'react';

import {
  type TDescendant,
  type TElement,
  type TText,
  isElement,
} from '@udecode/slate';

import type { NodeComponent, SlateEditor } from '../../editor';

import { pipeRenderStaticElement } from '../pipeRenderStaticElement';
import { pipeRenderStaticLeaf } from '../pipeRenderStaticLeaf';
import { createStaticString } from '../utils/createStaticString';

export type StaticComponents = Record<string, NodeComponent>;

export type ChildrenProps = {
  children: TDescendant[];
  editor: SlateEditor;
  staticComponents: StaticComponents;
};

export type ElementProps = {
  editor: SlateEditor;
  element: TElement;
  staticComponents: StaticComponents;
};

export type LeafProps = {
  editor: SlateEditor;
  leaf: TText;
  staticComponents: StaticComponents;
};

export type PlateViewProps = {
  editor: SlateEditor;
  staticComponents: StaticComponents;
};

function Element({
  editor,
  element = { children: [], type: '' },
  staticComponents,
}: ElementProps) {
  const renderElement = pipeRenderStaticElement(editor, staticComponents);

  return (
    <React.Fragment>
      {renderElement?.({
        attributes: { 'data-slate-node': 'element', ref: null },
        children: (
          <PlateViewContent editor={editor} staticComponents={staticComponents}>
            {element.children}
          </PlateViewContent>
        ),
        element,
      })}
    </React.Fragment>
  );
}

function Leaf({ editor, leaf = { text: '' }, staticComponents }: LeafProps) {
  const renderLeaf = pipeRenderStaticLeaf(editor, staticComponents);

  return (
    <span data-slate-node="text">
      {renderLeaf!({
        attributes: { 'data-slate-leaf': true },
        children: createStaticString({ text: leaf.text }),
        leaf,
        text: leaf,
      })}
    </span>
  );
}

function PlateViewContent({
  children = [],
  editor,
  staticComponents,
}: ChildrenProps) {
  return (
    <React.Fragment>
      {children.map((child, i) => {
        return isElement(child) ? (
          <Element
            key={i}
            editor={editor}
            element={child}
            staticComponents={staticComponents}
          />
        ) : (
          <Leaf
            key={i}
            editor={editor}
            leaf={child}
            staticComponents={staticComponents}
          />
        );
      })}
    </React.Fragment>
  );
}

export function PlateStatic(props: PlateViewProps) {
  const { editor, staticComponents } = props;

  return (
    <PlateViewContent editor={editor} staticComponents={staticComponents}>
      {editor.children}
    </PlateViewContent>
  );
}
