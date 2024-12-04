import React from 'react';

import type {
  TRenderElementProps,
  TRenderLeafProps,
} from '@udecode/plate-common/react';

import {
  type SlateEditor,
  type SlatePlugin,
  type TDescendant,
  isText,
} from '@udecode/plate-common';
import { decode, encode } from 'html-entities';
import ReactDOMServer from 'react-dom/server';

import { newLinesToHtmlBr } from './newLinesToHtmlBr';
import { stripClassNames } from './stripClassNames';

// 处理叶子节点
const leafToHtml = (
  editor: SlateEditor,
  { props }: { props: TRenderLeafProps }
): string => {
  const { children, leaf } = props;

  let html = '';

  editor.pluginList.some((plugin: SlatePlugin) => {
    if (!plugin.node.isLeaf) return false;

    console.log(plugin, 'fj');

    if (leaf[plugin.key]) {
      const Component = plugin.node.staticComponent!;

      const elementProps = {
        attributes: props.attributes,
        children,
        leaf,
      };

      html = decode(
        ReactDOMServer.renderToStaticMarkup(
          React.createElement(Component, elementProps)
        )
      );

      return true;
    }

    return false;
  });

  return html || `<span>${leaf.text}</span>`;
};

// 处理元素节点
const elementToHtml = (
  editor: SlateEditor,
  {
    preserveClassNames,
    props,
  }: {
    props: TRenderElementProps;
    preserveClassNames?: string[];
  }
): string => {
  const { children, element } = props;

  if (!element.type) {
    return ReactDOMServer.renderToStaticMarkup(
      React.createElement('div', null, children)
    );
  }

  let html = '';

  editor.pluginList.some((plugin: SlatePlugin) => {
    if (
      !plugin.node.staticComponent ||
      props.element.type !== plugin.node.type
    ) {
      return false;
    }

    try {
      const Component = plugin.node.staticComponent;
      const elementProps = {
        attributes: props.attributes,
        children,
        element,
      };

      html = decode(
        ReactDOMServer.renderToStaticMarkup(
          React.createElement(Component, elementProps)
        )
      );

      if (preserveClassNames) {
        html = stripClassNames(html, { preserveClassNames });
      }

      return true;
    } catch (error) {
      console.error(
        `Error rendering plugin component for type ${element.type}:`,
        error
      );

      return false;
    }
  });

  return (
    html ||
    ReactDOMServer.renderToStaticMarkup(
      React.createElement('div', null, children)
    )
  );
};

// 主序列化函数
export const serializeHtml = (
  editor: SlateEditor,
  {
    convertNewLinesToHtmlBr = true,
    nodes,
    preserveClassNames,
    stripWhitespace = true,
  }: {
    convertNewLinesToHtmlBr: boolean;
    nodes: TDescendant[];
    stripWhitespace: boolean;
    preserveClassNames?: string[];
  }
): string => {
  try {
    const result = nodes
      .map((node) => {
        if (isText(node)) {
          const textContent = encode(node.text);
          const children = convertNewLinesToHtmlBr
            ? newLinesToHtmlBr(textContent)
            : textContent;

          return leafToHtml(editor, {
            props: {
              attributes: { 'data-slate-leaf': true },
              children,
              leaf: node,
              text: node,
            },
          });
        }

        const childrenHtml = serializeHtml(editor, {
          convertNewLinesToHtmlBr,
          nodes: node.children as TDescendant[],
          preserveClassNames,
          stripWhitespace,
        });

        return elementToHtml(editor, {
          preserveClassNames,
          props: {
            attributes: {
              'data-slate-node': 'element',
              ref: null,
            },
            children: childrenHtml,
            element: node,
          },
        });
      })
      .join('');

    return stripWhitespace ? result.trim() : result;
  } catch (error) {
    console.error('Error in serializeHtml:', error);

    return '';
  }
};
