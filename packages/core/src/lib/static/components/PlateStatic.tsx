import React from 'react';

import {
  type TDescendant,
  type TElement,
  type TText,
  isElement,
} from '@udecode/slate';
import clsx from 'clsx';

import type { SlateEditor } from '../../editor';
import type { NodeComponents } from '../../plugin';

import { pipeRenderElementStatic } from '../pipeRenderElementStatic';
import { pipeRenderLeafStatic } from '../pluginRenderLeafStatic';
import { createStaticString } from '../utils/createStaticString';

function ElementStatic({
  components,
  editor,
  element = { children: [], type: '' },
}: {
  components: NodeComponents;
  editor: SlateEditor;
  element: TElement;
}) {
  const renderElement = pipeRenderElementStatic(editor, {
    components,
  });

  return (
    <React.Fragment>
      {renderElement?.({
        attributes: { 'data-slate-node': 'element', ref: null },
        children: (
          <Children components={components} editor={editor}>
            {element.children}
          </Children>
        ),
        element,
      })}
    </React.Fragment>
  );
}

function LeafStatic({
  components,
  editor,
  leaf = { text: '' },
}: {
  components: NodeComponents;
  editor: SlateEditor;
  leaf: TText;
}) {
  const renderLeaf = pipeRenderLeafStatic(editor, {
    components,
  });

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

function Children({
  children = [],
  components,
  editor,
}: {
  children: TDescendant[];
  components: NodeComponents;
  editor: SlateEditor;
}) {
  return (
    <React.Fragment>
      {children.map((child, i) => {
        return isElement(child) ? (
          <ElementStatic
            key={i}
            components={components}
            editor={editor}
            element={child}
          />
        ) : (
          <LeafStatic
            key={i}
            components={components}
            editor={editor}
            leaf={child}
          />
        );
      })}
    </React.Fragment>
  );
}

export type PlateStaticProps = {
  components: NodeComponents;
  editor: SlateEditor;
  disableDefaultStyles?: boolean;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>;

export function PlateStatic(props: PlateStaticProps) {
  const {
    className,
    components,
    disableDefaultStyles,
    editor,
    style: userStyle,
    ...rest
  } = props;

  let afterEditable: React.ReactNode = null;
  let beforeEditable: React.ReactNode = null;

  editor.pluginList.forEach((plugin) => {
    const {
      render: { afterEditable: AfterEditable, beforeEditable: BeforeEditable },
    } = plugin;

    if (AfterEditable) {
      afterEditable = (
        <>
          {afterEditable}
          <AfterEditable />
        </>
      );
    }
    if (BeforeEditable) {
      beforeEditable = (
        <>
          {beforeEditable}
          <BeforeEditable />
        </>
      );
    }
  });

  const content = (
    <div
      className={clsx('slate-editor', className)}
      style={{
        ...(disableDefaultStyles
          ? {}
          : {
              position: 'relative',
              userSelect: 'text',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              zIndex: -1,
            }),
        ...userStyle,
      }}
      data-slate-editor
      data-slate-node="value"
      {...rest}
    >
      <Children components={components} editor={editor}>
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

  editor.pluginList.forEach((plugin) => {
    const {
      render: { aboveEditable: AboveEditable },
    } = plugin;

    if (AboveEditable) {
      aboveEditable = <AboveEditable>{aboveEditable}</AboveEditable>;
    }
  });

  return aboveEditable;
}
