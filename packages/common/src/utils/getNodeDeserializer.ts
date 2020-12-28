import { DeserializeNode } from '@udecode/slate-plugins-core';
import castArray from 'lodash/castArray';
import { GetNodeDeserializerOptions } from '../types/PluginOptions.types';

/**
 * Get a deserializer by type, node names, class names and styles.
 */
export const getNodeDeserializer = ({
  type,
  node,
  attributes,
  rules,
}: GetNodeDeserializerOptions) => {
  const deserializers: DeserializeNode[] = [];

  rules.forEach(({ nodeNames = '*', style, className }) => {
    nodeNames = castArray<string>(nodeNames);

    nodeNames.forEach((nodeName) => {
      deserializers.push({
        type,
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

          const htmlAttributes = {};
          if (attributes) {
            const attributeNames = el.getAttributeNames();
            for (const attribute of attributes) {
              if (attributeNames.includes(attribute))
                htmlAttributes[attribute] = el.getAttribute(attribute);
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
