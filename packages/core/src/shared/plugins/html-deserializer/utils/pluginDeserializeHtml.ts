import { type AnyObject, isDefined } from '@udecode/utils';
import castArray from 'lodash/castArray.js';

import type { Nullable } from '../../../types';
import type { PlateEditor } from '../../../types/PlateEditor';
import type { DeserializeHtml } from '../../../types/plugin/DeserializeHtml';
import type { PlatePlugin } from '../../../types/plugin/PlatePlugin';

import { getInjectedPlugins } from '../../../utils/getInjectedPlugins';

/** Get a deserializer by type, node names, class names and styles. */
export const pluginDeserializeHtml = (
  editor: PlateEditor,
  plugin: PlatePlugin,
  {
    deserializeLeaf,
    element: el,
  }: { deserializeLeaf?: boolean; element: HTMLElement }
): ({ node: AnyObject } & Nullable<DeserializeHtml>) | undefined => {
  const {
    deserializeHtml,
    isElement: isElementRoot,
    isLeaf: isLeafRoot,
    type,
  } = plugin;

  if (!deserializeHtml) return;

  const {
    attributeNames,
    isElement: isElementRule,
    isLeaf: isLeafRule,
    query,
    rules,
  } = deserializeHtml;
  let { getNode } = deserializeHtml;

  const isElement = isElementRule || isElementRoot;
  const isLeaf = isLeafRule || isLeafRoot;

  if (!deserializeLeaf && !isElement) {
    return;
  }
  if (deserializeLeaf && !isLeaf) {
    return;
  }
  if (rules) {
    const isValid = rules.some(
      ({ validAttribute, validClassName, validNodeName = '*', validStyle }) => {
        if (validNodeName) {
          const validNodeNames = castArray<string>(validNodeName);

          // Ignore if el nodeName is not included in rule validNodeNames (except *).
          if (
            validNodeNames.length > 0 &&
            !validNodeNames.includes(el.nodeName) &&
            validNodeName !== '*'
          )
            return false;
        }
        // Ignore if the rule className is not in el class list.
        if (validClassName && !el.classList.contains(validClassName))
          return false;
        if (validStyle) {
          for (const [key, value] of Object.entries(validStyle)) {
            const values = castArray<string>(value);

            // Ignore if el style value is not included in rule style values (except *)
            if (!values.includes((el.style as any)[key]) && value !== '*')
              return;
            // Ignore if el style value is falsy (for value *)
            if (value === '*' && !(el.style as any)[key]) return;

            const defaultNodeValue = plugin.inject.props?.defaultNodeValue;

            // Ignore if the style value = plugin.inject.props.defaultNodeValue
            if (
              defaultNodeValue &&
              defaultNodeValue === (el.style as any)[key]
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
              )
                return false;
            }
          }
        }

        return true;
      }
    );

    if (!isValid) return;
  }
  if (query && !query(el)) {
    return;
  }
  if (!getNode) {
    if (isElement) {
      getNode = () => ({ type });
    } else if (isLeaf) {
      getNode = () => ({ [type]: true });
    } else {
      return;
    }
  }

  let node = getNode(el, {}) ?? {};

  if (Object.keys(node).length === 0) return;

  const injectedPlugins = getInjectedPlugins(editor, plugin);

  injectedPlugins.forEach((injectedPlugin) => {
    const res = injectedPlugin.deserializeHtml?.getNode?.(el, node);

    if (res) {
      node = {
        ...node,
        ...res,
      };
    }
  });

  if (attributeNames) {
    const elementAttributes = {};

    const elementAttributeNames = el.getAttributeNames();

    for (const elementAttributeName of elementAttributeNames) {
      if (attributeNames.includes(elementAttributeName)) {
        (elementAttributes as any)[elementAttributeName] =
          el.getAttribute(elementAttributeName);
      }
    }

    if (Object.keys(elementAttributes).length > 0) {
      node.attributes = elementAttributes;
    }
  }

  return { ...deserializeHtml, node };
};
