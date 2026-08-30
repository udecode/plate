import type { GetInjectNodePropsOptions } from '../plugin';
import type { AnyObject } from '../types/AnyObject';

type NodePropsPlugin = {
  render: {
    nodeProps?: unknown;
  };
};

export const getPluginNodeProps = <
  TProps extends GetInjectNodePropsOptions & {
    attributes?: AnyObject;
    children: any;
  },
>({
  plugin,
  props,
}: {
  props: TProps;
  plugin?: NodePropsPlugin;
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
        : (plugin.render.nodeProps as AnyObject)) ?? {};

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
