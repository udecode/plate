import { Value } from '@udecode/slate';
import { AnyObject, isDefined } from '@udecode/utils';
import castArray from 'lodash/castArray';
import { Nullable } from '../../../types';
import { PlateEditor } from '../../../types/PlateEditor';
import { DeserializeHtml } from '../../../types/plugin/DeserializeHtml';
import { WithPlatePlugin } from '../../../types/plugin/PlatePlugin';
import { getInjectedPlugins } from '../../../utils/getInjectedPlugins';

/**
 * Get a deserializer by type, node names, class names and styles.
 */
export const pluginDeserializeHtml = <V extends Value>(
  editor: PlateEditor<V>,
  plugin: WithPlatePlugin<{}, V>,
  {
    element: el,
    deserializeLeaf,
  }: { element: HTMLElement; deserializeLeaf?: boolean }
): (Nullable<DeserializeHtml> & { node: AnyObject }) | undefined => {
  const {
    deserializeHtml,
    isElement: isElementRoot,
    isLeaf: isLeafRoot,
    type,
  } = plugin;

  if (!deserializeHtml) return;

  const {
    attributeNames,
    query,
    isLeaf: isLeafRule,
    isElement: isElementRule,
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
      ({ validNodeName = '*', validStyle, validClassName, validAttribute }) => {
        if (validNodeName) {
          const validNodeNames = castArray<string>(validNodeName);

          // Ignore if el nodeName is not included in rule validNodeNames (except *).
          if (
            validNodeNames.length &&
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
            if (!values.includes(el.style[key]) && value !== '*') return;

            // Ignore if el style value is falsy (for value *)
            if (value === '*' && !el.style[key]) return;

            const defaultNodeValue = plugin.inject.props?.defaultNodeValue;

            // Ignore if the style value = plugin.inject.props.defaultNodeValue
            if (defaultNodeValue && defaultNodeValue === el.style[key]) {
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
  if (!Object.keys(node).length) return;

  const injectedPlugins = getInjectedPlugins<{}, V>(editor, plugin);

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
        elementAttributes[elementAttributeName] =
          el.getAttribute(elementAttributeName);
      }
    }

    if (Object.keys(elementAttributes).length) {
      node.attributes = elementAttributes;
    }
  }

  return { ...deserializeHtml, node };
};
