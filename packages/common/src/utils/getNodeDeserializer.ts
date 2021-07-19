import {
  DeserializeNode,
  GetNodeDeserializerOptions,
} from '@udecode/plate-core';
import castArray from 'lodash/castArray';

/**
 * Get a deserializer by type, node names, class names and styles.
 */
export const getNodeDeserializer = ({
  type,
  getNode,
  attributeNames,
  rules,
  withoutChildren,
}: GetNodeDeserializerOptions) => {
  const deserializers: DeserializeNode[] = [];

  rules.forEach(({ nodeNames = '*', style, className, attribute }) => {
    nodeNames = castArray<string>(nodeNames);

    nodeNames.forEach((nodeName) => {
      deserializers.push({
        type,
        withoutChildren,
        deserialize: (el) => {
          if (
            nodeNames.length &&
            !nodeNames.includes(el.nodeName) &&
            nodeName !== '*'
          )
            return;

          if (className && !el.classList.contains(className)) return;

          if (style) {
            for (const [key, value] of Object.entries(style)) {
              const values = castArray<string>(value);

              if (!values.includes(el.style[key]) && value !== '*') return;
            }
          }

          if (attribute) {
            if (typeof attribute === 'string') {
              if (!el.getAttributeNames().includes(attribute)) return;
            } else {
              for (const [attributeName, attributeValue] of Object.entries(
                attribute
              )) {
                const attributeValues = castArray<string>(attributeValue);
                const elAttribute = el.getAttribute(attributeName);

                if (!elAttribute || !attributeValues.includes(elAttribute))
                  return;
              }
            }
          }

          const elementAttributes = {};
          if (attributeNames) {
            const elementAttributeNames = el.getAttributeNames();

            for (const elementAttributeName of elementAttributeNames) {
              if (attributeNames.includes(elementAttributeName)) {
                elementAttributes[elementAttributeName] = el.getAttribute(
                  elementAttributeName
                );
              }
            }
          }

          const slateNode = getNode(el);
          if (slateNode && Object.keys(elementAttributes).length) {
            slateNode.attributes = elementAttributes;
          }

          return slateNode;
        },
      });
    });
  });

  return deserializers;
};
