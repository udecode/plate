import type { AnyObject } from '@udecode/utils';
import type React from 'react';

import type { AnyBasePlugin, GetInjectNodePropsOptions } from '../plugin';
import type { AnyEditorPlatePlugin } from '../../react/plugin';

export const getPluginNodeProps = <
  TProps extends GetInjectNodePropsOptions & {
    attributes?: AnyObject;
    children: React.ReactNode;
  },
>({
  plugin,
  props,
}: {
  props: TProps;
  plugin?: AnyBasePlugin | AnyEditorPlatePlugin;
}): TProps & { attributes: AnyObject } => {
  const newProps = { ...props, attributes: { ...props.attributes } };

  if (plugin?.render.nodeProps) {
    // Base and React callbacks share this runtime shape but expose
    // layer-specific plugin context types.
    const pluginNodeProps =
      (typeof plugin.render.nodeProps === 'function'
        ? (plugin.render.nodeProps as (props: TProps) => AnyObject | undefined)(
            newProps
          )
        : plugin.render.nodeProps) ?? {};

    newProps.attributes = {
      ...newProps.attributes,
      ...pluginNodeProps,
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
