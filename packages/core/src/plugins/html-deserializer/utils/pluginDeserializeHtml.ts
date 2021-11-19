import castArray from 'lodash/castArray';
import { DeserializeHtml } from '../../../types/plugins/DeserializeHtml';
import { WithPlatePlugin } from '../../../types/plugins/PlatePlugin';
import { AnyObject } from '../../../types/utility/AnyObject';
import { Nullable } from '../../../types/utility/Nullable';

/**
 * Get a deserializer by type, node names, class names and styles.
 */
export const pluginDeserializeHtml = <T = {}, P = {}>(
  plugin: WithPlatePlugin<T, P>,
  { element: el, isLeaf }: { element: HTMLElement; isLeaf?: boolean }
): (Nullable<DeserializeHtml> & { node: AnyObject }) | undefined => {
  const {
    deserializeHtml: _deserializeHtml,
    isElement: isElementRoot,
    isLeaf: isLeafRoot,
    type,
  } = plugin;

  if (!_deserializeHtml) return;

  let node: AnyObject | undefined;

  const deserializeHtmls = castArray(_deserializeHtml);

  const deserialized = deserializeHtmls.find((deserializeHtml) => {
    const {
      validNodeName: nodeName = '*',
      validStyle,
      validClassName,
      validAttribute,
      attributeNames,
      query,
      isLeaf: _isLeaf,
      isElement,
    } = deserializeHtml;
    let { getNode } = deserializeHtml;

    if (isLeaf && !_isLeaf && !isLeafRoot) {
      return;
    }

    if (query && !query(el)) {
      return;
    }

    if (!getNode) {
      if (isElement || isElementRoot) {
        getNode = () => ({ type });
      } else if (isLeaf) {
        getNode = () => ({ [type]: true });
      } else {
        return;
      }
    }

    if (nodeName) {
      const validNodeName = castArray<string>(nodeName);

      // Ignore if el nodeName is not included in rule validNodeName (except *).
      if (
        validNodeName.length &&
        !validNodeName.includes(el.nodeName) &&
        nodeName !== '*'
      )
        return false;
    }

    // Ignore if the rule className is not in el class list.
    if (validClassName && !el.className.includes(validClassName)) return false;

    if (validStyle) {
      for (const [key, value] of Object.entries(validStyle)) {
        const values = castArray<string>(value);

        // Ignore if el style value is not included in rule style values (except *)
        if (!values.includes(el.style[key]) && value !== '*') return false;

        // Ignore if el style value is falsy (for value *)
        if (value === '*' && !el.style[key]) return false;
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

          if (!elAttribute || !attributeValues.includes(elAttribute))
            return false;
        }
      }
    }

    node = getNode(el);
    if (!node) return;

    if (attributeNames) {
      const elementAttributes = {};

      const elementAttributeNames = el.getAttributeNames();

      for (const elementAttributeName of elementAttributeNames) {
        if (attributeNames.includes(elementAttributeName)) {
          elementAttributes[elementAttributeName] = el.getAttribute(
            elementAttributeName
          );
        }
      }

      if (Object.keys(elementAttributes).length) {
        node.attributes = elementAttributes;
      }
    }

    return true;
  });

  if (deserialized) {
    return { ...deserialized, node: node as AnyObject };
  }
};
