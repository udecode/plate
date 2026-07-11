import type { Element, Text } from '@platejs/plite';
import type { AnyObject } from '@udecode/utils';
import type React from 'react';

import pick from 'lodash/pick.js';

import type { AnyBasePlugin, GetInjectNodePropsOptions } from '../plugin';
import type { AnyEditorPlatePlugin } from '../../react/plugin';

import { getNodeDataAttributeKeys } from '@platejs/plite-dom/internal';

export const getPluginNodeProps = <
  TProps extends GetInjectNodePropsOptions & {
    attributes?: AnyObject;
    children: React.ReactNode;
  },
>({
  attributes: nodeAttributes,
  node,
  plugin,
  props,
}: {
  props: TProps;
  attributes?: AnyObject;
  node?: Element | Text;
  plugin?: AnyBasePlugin | AnyEditorPlatePlugin;
}): TProps & { attributes: AnyObject } => {
  const newProps = { ...props, attributes: { ...props.attributes } };

  if (plugin?.node.props) {
    // Base and React callbacks share this runtime shape but expose
    // layer-specific plugin context types.
    const pluginNodeProps =
      (typeof plugin.node.props === 'function'
        ? (plugin.node.props as (props: TProps) => AnyObject | undefined)(
            newProps
          )
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
         * @see {@link PluginBaseNode.dangerouslyAllowAttributes}
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
