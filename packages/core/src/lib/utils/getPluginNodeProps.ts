import type { AnyObject } from '@udecode/utils';

import pick from 'lodash/pick.js';

import type { AnyEditorPlugin } from '../plugin';
import type { SlateRenderNodeProps } from '../static';

export const getPluginNodeProps = ({
  attributes,
  plugin,
  props,
}: {
  props: SlateRenderNodeProps;
  attributes?: AnyObject;
  plugin?: AnyEditorPlugin;
}): any => {
  let newProps: AnyObject = {};

  if (plugin?.node.props) {
    newProps =
      (typeof plugin.node.props === 'function'
        ? plugin.node.props(props as any)
        : plugin.node.props) ?? {};
  }
  if (!newProps.nodeProps && attributes && plugin) {
    /**
     * WARNING: Improper use of `dangerouslyAllowAttributes` WILL make your
     * application vulnerable to cross-site scripting (XSS) or information
     * exposure attacks.
     *
     * @see {@link BasePluginNode.dangerouslyAllowAttributes}
     */
    newProps.nodeProps = pick(
      attributes,
      plugin.node.dangerouslyAllowAttributes ?? []
    );
  }

  props = { ...props, ...newProps };

  if (props.nodeProps) {
    // remove attributes values that are undefined
    Object.keys(props.nodeProps).forEach((key) => {
      if (props.nodeProps?.[key] === undefined) {
        delete props.nodeProps?.[key];
      }
    });
  }

  return props;
};
