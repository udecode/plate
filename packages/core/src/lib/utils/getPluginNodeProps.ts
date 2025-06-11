import type { TElement, TText } from '@platejs/slate';
import type { AnyObject } from '@udecode/utils';

import pick from 'lodash/pick.js';

import type { AnyEditorPlugin } from '../plugin';

import { type SlateRenderNodeProps, getNodeDataAttributeKeys } from '../static';

export const getPluginNodeProps = ({
  attributes: nodeAttributes,
  node,
  plugin,
  props,
}: {
  props: SlateRenderNodeProps;
  attributes?: AnyObject;
  node?: TElement | TText;
  plugin?: AnyEditorPlugin;
}): any => {
  const newProps: any = { ...props, attributes: { ...props.attributes } };

  if (plugin?.node.props) {
    const pluginNodeProps =
      (typeof plugin.node.props === 'function'
        ? plugin.node.props(newProps as any)
        : plugin.node.props) ?? {};

    newProps.attributes = {
      ...newProps.attributes,
      ...pluginNodeProps,
    };
  }
  if (nodeAttributes && plugin) {
    // Add data attributes to attributes if attributes is already set
    newProps.attributes = {
      ...newProps.attributes,
      ...pick(
        nodeAttributes,
        /**
         * WARNING: Improper use of `dangerouslyAllowAttributes` WILL make your
         * application vulnerable to cross-site scripting (XSS) or information
         * exposure attacks.
         *
         * @see {@link BasePluginNode.dangerouslyAllowAttributes}
         */
        ...(plugin.node.dangerouslyAllowAttributes ?? []),
        [...(node ? getNodeDataAttributeKeys(node) : [])]
      ),
    };
  }

  // remove attributes values that are undefined
  Object.keys(newProps.attributes).forEach((key) => {
    if (newProps.attributes?.[key] === undefined) {
      delete newProps.attributes?.[key];
    }
  });

  return newProps;
};
