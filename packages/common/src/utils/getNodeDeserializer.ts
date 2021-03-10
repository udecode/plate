import { DeserializeNode } from '@udecode/slate-plugins-core';
import castArray from 'lodash/castArray';
import { GetNodeDeserializerOptions } from '../types/Deserialize';

/**
 * Get a deserializer by type, node names, class names and styles.
 */
export const getNodeDeserializer = ({
  type,
  node,
  attributes,
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

              if (!values.includes(el.style[key])) return;
            }
          }

          if (attribute) {
            if (typeof attribute === 'string') {
              if (!el.getAttributeNames().includes(attribute)) return;
            } else {
              for (const [key, value] of Object.entries(attribute)) {
                const values = castArray<string>(value);
                const attr = el.getAttribute(key);

                if (!attr || !values.includes(attr)) return;
              }
            }
          }

          const htmlAttributes = {};
          if (attributes) {
            const attributeNames = el.getAttributeNames();
            for (const attr of attributes) {
              if (attributeNames.includes(attr))
                htmlAttributes[attr] = el.getAttribute(attr);
            }
          }

          const slateNode = node(el);
          if (slateNode && Object.keys(htmlAttributes).length)
            slateNode.attributes = htmlAttributes;
          return slateNode;
        },
      });
    });
  });

  return deserializers;
};
