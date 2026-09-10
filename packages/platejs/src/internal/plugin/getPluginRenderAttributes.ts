import type { GetInjectNodePropsOptions } from '../../lib/plugin';
import type { AnyObject } from '../../lib/types/AnyObject';

type RenderAttributesPlugin = {
  render: {
    attributes?: unknown;
  };
};

export const getPluginRenderAttributes = <
  TProps extends GetInjectNodePropsOptions & {
    attributes?: AnyObject;
    children: any;
  },
>({
  plugin,
  props,
}: {
  props: TProps;
  plugin?: RenderAttributesPlugin;
}): TProps & { attributes: AnyObject } => {
  const newProps = { ...props, attributes: { ...props.attributes } };

  if (plugin?.render.attributes) {
    const attributes =
      (typeof plugin.render.attributes === 'function'
        ? (
            plugin.render.attributes as (props: TProps) => AnyObject | undefined
          )(newProps)
        : (plugin.render.attributes as AnyObject)) ?? {};

    newProps.attributes = {
      ...newProps.attributes,
      ...attributes,
    };
  }

  Object.keys(newProps.attributes).forEach((key) => {
    if (newProps.attributes?.[key] === undefined) {
      delete newProps.attributes?.[key];
    }
  });

  return newProps;
};
