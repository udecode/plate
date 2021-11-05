import clsx from 'clsx';
import { RenderNodeOptions } from '../types/PlatePluginOptions/RenderNodeOptions';
import { PlateRenderNodeProps } from '../types/PlateRenderNodeProps';
import { getSlateClass } from './getSlateClass';

/**
 * Get node props: `nodeProps`, `className`, `overrideProps`
 */
export const getRenderNodeProps = <T extends PlateRenderNodeProps>({
  attributes,
  overrideProps,
  type,
  getNodeProps,
  props: _props,
}: Omit<RenderNodeOptions, 'component'> & {
  props: T;
  attributes?: any;
}) => {
  let props = {
    ..._props,
    nodeProps: getNodeProps?.(_props as any) ?? attributes ?? {},
  };

  if (overrideProps) {
    const newProps =
      typeof overrideProps === 'function'
        ? overrideProps(props as any)
        : overrideProps;

    if (newProps) {
      props = {
        ...props,
        ...newProps,
      };
    }
  }

  const { className } = props;

  return { ...props, className: clsx(getSlateClass(type), className) };
};
