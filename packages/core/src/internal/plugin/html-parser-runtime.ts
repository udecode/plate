import type { Descendant } from '@platejs/plite';
import { ElementApi, TextApi } from '@platejs/plite';
import { isLeaf, isNode, isVoid } from '@platejs/plite-dom/internal';
import { jsx } from '@platejs/plite-hyperscript';
import { type AnyObject, type Nullable, isDefined } from '@udecode/utils';
import castArray from 'lodash/castArray.js';

import type { HtmlDeserializer } from '../../lib/plugin/BasePlugin';
import type {
  DeserializeHtmlChildren,
  DeserializeHtmlNodeReturnType,
} from '../../lib/plugins/html/types';
import { collapseWhiteSpace } from '../../lib/plugins/html/utils/collapse-white-space';
import { htmlBrToNewLine } from '../../lib/plugins/html/utils/htmlBrToNewLine';
import { htmlStringToDOMNode } from '../../lib/plugins/html/utils/htmlStringToDOMNode';
import { htmlTextNodeToString } from '../../lib/plugins/html/utils/htmlTextNodeToString';
import { isHtmlElement } from '../../lib/plugins/html/utils/isHtmlElement';
import { mergeDeepToNodes } from '../../lib/utils/mergeDeepToNodes';
import { isPluginNodeClass } from '../../lib/utils/pluginNodeClass';
import {
  createParserPluginContext,
  type PreparedParserPlugin,
  type PreparedParserRuntime,
} from './prepareParserRegistry';

const getDefaultNodeProps = ({
  element,
  type,
}: {
  element: HTMLElement;
  type: string;
}) => {
  if (!isPluginNodeClass(element, type) && !isLeaf(element)) return;

  const dataAttributes: Record<string, any> = {};

  Object.entries(element.dataset).forEach(([key, value]) => {
    if (
      key.startsWith('plite') &&
      value &&
      !['pliteInline', 'pliteLeaf', 'pliteNode', 'pliteVoid'].includes(key)
    ) {
      const attributeKey = key.slice(5).charAt(0).toLowerCase() + key.slice(6);

      if (value === undefined) return;

      let parsedValue: any = value;

      if (value === 'true') parsedValue = true;
      else if (value === 'false') parsedValue = false;
      else if (!Number.isNaN(Number(value))) parsedValue = Number(value);

      dataAttributes[attributeKey] = parsedValue;
    }
  });

  if (Object.keys(dataAttributes).length > 0) return dataAttributes;
};

export const getDataNodePropsWithParserRuntime = ({
  element,
  plugin,
  runtime,
}: {
  element: HTMLElement;
  plugin: PreparedParserPlugin;
  runtime: PreparedParserRuntime;
}) => {
  const toNodeProps = plugin.html?.toNodeProps;
  const disableDefaultNodeProps = plugin.html?.disableDefaultNodeProps ?? false;
  const context = createParserPluginContext(plugin, runtime.state);
  const defaultNodeProps = disableDefaultNodeProps
    ? {}
    : getDefaultNodeProps({ ...context, element });

  if (!toNodeProps) return defaultNodeProps;

  return {
    ...defaultNodeProps,
    ...(toNodeProps({ ...context, element }) ?? {}),
  };
};

/** Resolve one prepared HTML deserializer without retaining an editor. */
export const pluginDeserializeHtmlWithParserRuntime = (
  runtime: PreparedParserRuntime,
  plugin: PreparedParserPlugin,
  {
    deserializeLeaf,
    element: el,
  }: { element: HTMLElement; deserializeLeaf?: boolean }
): (Nullable<HtmlDeserializer> & { node: AnyObject }) | undefined => {
  const deserializer = plugin.html;

  if (!deserializer) return;

  const { attributeNames, query, rules } = deserializer;
  let { parse } = deserializer;

  if (
    (!deserializeLeaf && !plugin.isElement) ||
    (deserializeLeaf && !plugin.isLeaf)
  ) {
    return;
  }
  if (rules) {
    const isValid = rules.some(
      ({ validAttribute, validClassName, validNodeName = '*', validStyle }) => {
        if (validNodeName) {
          const validNodeNames = castArray<string>(validNodeName);

          if (
            validNodeNames.length > 0 &&
            !validNodeNames.includes(el.nodeName) &&
            validNodeName !== '*'
          ) {
            return false;
          }
        }
        if (validClassName && !el.classList.contains(validClassName)) {
          return false;
        }
        if (validStyle) {
          for (const [key, value] of Object.entries(validStyle)) {
            const values = castArray<string>(value);

            if (!values.includes((el.style as any)[key]) && value !== '*') {
              return false;
            }
            if (value === '*' && !(el.style as any)[key]) return false;
            if (
              plugin.defaultNodeValue &&
              plugin.defaultNodeValue === (el.style as any)[key]
            ) {
              return false;
            }
          }
        }
        if (validAttribute) {
          if (typeof validAttribute === 'string') {
            if (!el.getAttributeNames().includes(validAttribute)) return false;
          } else {
            for (const [attributeName, attributeValue] of Object.entries(
              validAttribute
            )) {
              const attributeValues = castArray<string>(attributeValue);
              const elAttribute = el.getAttribute(attributeName);

              if (
                !isDefined(elAttribute) ||
                !attributeValues.includes(elAttribute)
              ) {
                return false;
              }
            }
          }
        }

        return true;
      }
    );

    if (!isValid) return;
  }
  const context = createParserPluginContext(plugin, runtime.state);

  if (query && !query({ ...context, element: el })) return;
  if (!parse) {
    if (plugin.isElement) parse = ({ type }) => ({ type });
    else if (plugin.isLeaf) parse = ({ type }) => ({ [type!]: true });
    else return;
  }

  const parsedNode = isNode(el)
    ? {}
    : (parse({ ...context, element: el, node: {} }) ?? {});
  const dataNodeProps = getDataNodePropsWithParserRuntime({
    element: el,
    plugin,
    runtime,
  });
  let node: AnyObject = { ...parsedNode, ...dataNodeProps };

  if (Object.keys(node).length === 0) return;

  plugin.htmlInjections.forEach((injectedPlugin) => {
    const result = injectedPlugin.html?.parse?.({
      ...createParserPluginContext(injectedPlugin, runtime.state),
      element: el,
      node,
    });

    if (result && !isNode(el)) node = { ...node, ...result };
  });

  if (attributeNames) {
    const attributes: Record<string, string | null> = {};

    for (const name of el.getAttributeNames()) {
      if (attributeNames.includes(name))
        attributes[name] = el.getAttribute(name);
    }
    if (Object.keys(attributes).length > 0) node.attributes = attributes;
  }

  return { ...deserializer, node } as Nullable<HtmlDeserializer> & {
    node: AnyObject;
  };
};

export const pipeDeserializeHtmlElementWithParserRuntime = (
  runtime: PreparedParserRuntime,
  element: HTMLElement
) => {
  let result: (Nullable<HtmlDeserializer> & { node: AnyObject }) | undefined;

  [...runtime.registry.plugins].reverse().some((plugin) => {
    result = pluginDeserializeHtmlWithParserRuntime(runtime, plugin, {
      element,
    });

    return !!result;
  });

  return result;
};

export const pipeDeserializeHtmlLeafWithParserRuntime = (
  runtime: PreparedParserRuntime,
  element: HTMLElement
) => {
  let node: AnyObject = {};

  [...runtime.registry.plugins].reverse().forEach((plugin) => {
    const deserialized = pluginDeserializeHtmlWithParserRuntime(
      runtime,
      plugin,
      { deserializeLeaf: true, element }
    );

    if (deserialized) node = { ...node, ...deserialized.node };
  });

  return node;
};

const shouldBrBecomeEmptyParagraph = (node: Element): boolean => {
  if (node.nodeName !== 'BR') return false;
  if ((node as HTMLBRElement).className === 'Apple-interchange-newline') {
    return false;
  }

  const parent = node.parentElement;

  if (!parent || parent.tagName === 'P' || parent.tagName === 'SPAN') {
    return false;
  }

  let sibling: Node | null = node.previousSibling;

  while (sibling) {
    if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
      return false;
    }
    sibling = sibling.previousSibling;
  }
  sibling = node.nextSibling;
  while (sibling) {
    if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
      return false;
    }
    sibling = sibling.nextSibling;
  }

  return true;
};

export const deserializeHtmlNodeWithParserRuntime =
  (runtime: PreparedParserRuntime) =>
  (node: ChildNode | HTMLElement): DeserializeHtmlNodeReturnType => {
    const textNode = htmlTextNodeToString(node);

    if (textNode) return textNode;
    if (!isHtmlElement(node)) return null;
    if (shouldBrBecomeEmptyParagraph(node)) {
      return {
        children: [{ text: '' }],
        type: runtime.registry.public.getType('p'),
      };
    }
    if (
      node.nodeName === 'BR' &&
      (node as HTMLBRElement).className === 'Apple-interchange-newline'
    ) {
      return null;
    }

    const breakLine = htmlBrToNewLine(node);

    if (breakLine) return breakLine;

    const fragment = htmlBodyToFragmentWithParserRuntime(
      runtime,
      node as HTMLElement
    );

    if (fragment) return fragment;

    const element = htmlElementToElementWithParserRuntime(
      runtime,
      node as HTMLElement,
      isNode(node as HTMLElement)
    );

    return (
      element ??
      htmlElementToLeafWithParserRuntime(runtime, node as HTMLElement)
    );
  };

export const deserializeHtmlNodeChildrenWithParserRuntime = (
  runtime: PreparedParserRuntime,
  node: ChildNode | HTMLElement,
  isPliteParent = false
): DeserializeHtmlChildren[] =>
  Array.from(node.childNodes).flatMap((child) => {
    if (
      child.nodeType === 1 &&
      !isNode(child as HTMLElement) &&
      isPliteParent
    ) {
      return deserializeHtmlNodeChildrenWithParserRuntime(
        runtime,
        child as HTMLElement,
        isPliteParent
      );
    }

    return deserializeHtmlNodeWithParserRuntime(runtime)(child);
  }) as DeserializeHtmlChildren[];

export const htmlBodyToFragmentWithParserRuntime = (
  runtime: PreparedParserRuntime,
  element: HTMLElement
): Descendant[] | undefined => {
  if (element.nodeName !== 'BODY') return;

  return jsx(
    'fragment',
    {},
    deserializeHtmlNodeChildrenWithParserRuntime(runtime, element)
  ) as Descendant[];
};

export const htmlElementToElementWithParserRuntime = (
  runtime: PreparedParserRuntime,
  element: HTMLElement,
  isPlite = false
) => {
  const deserialized = pipeDeserializeHtmlElementWithParserRuntime(
    runtime,
    element
  );

  if (!deserialized) return;

  const { node, withoutChildren } = deserialized;
  let descendants =
    node.children ??
    (deserializeHtmlNodeChildrenWithParserRuntime(
      runtime,
      element,
      isPlite
    ) as Descendant[]);

  if (descendants.length === 0 || withoutChildren || isVoid(element)) {
    descendants = [{ text: '' }];
  }

  return jsx('element', node, descendants) as Descendant;
};

export const htmlElementToLeafWithParserRuntime = (
  runtime: PreparedParserRuntime,
  element: HTMLElement
) => {
  const node = pipeDeserializeHtmlLeafWithParserRuntime(runtime, element);

  return deserializeHtmlNodeChildrenWithParserRuntime(runtime, element).reduce(
    (children: Descendant[], child) => {
      if (!child) return children;
      if (ElementApi.isElement(child)) {
        if (Object.keys(node).length > 0) {
          mergeDeepToNodes<Descendant>({
            match: TextApi.isText,
            node: child,
            source: node,
          });
        }

        children.push(child);
      } else {
        const attributes = { ...node };

        if (TextApi.isText(child) && child.text) {
          Object.keys(attributes).forEach((key) => {
            if (attributes[key] && child[key]) attributes[key] = child[key];
          });
        }

        children.push(jsx('text', attributes, child) as any);
      }

      return children;
    },
    []
  ) as Descendant[];
};

export const deserializeHtmlElementWithParserRuntime = (
  runtime: PreparedParserRuntime,
  element: HTMLElement
): DeserializeHtmlNodeReturnType =>
  deserializeHtmlNodeWithParserRuntime(runtime)(element);

export const deserializeHtmlWithParserRuntime = (
  runtime: PreparedParserRuntime,
  {
    collapseWhiteSpace: shouldCollapseWhiteSpace = true,
    element,
  }: { collapseWhiteSpace?: boolean; element: HTMLElement | string }
): Descendant[] => {
  const root =
    typeof element === 'string' ? htmlStringToDOMNode(element) : element;

  return deserializeHtmlElementWithParserRuntime(
    runtime,
    shouldCollapseWhiteSpace ? collapseWhiteSpace(root) : root
  ) as Descendant[];
};
