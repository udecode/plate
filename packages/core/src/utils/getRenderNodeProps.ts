import clsx from 'clsx';
import { RenderNodeOptions } from '../types/PlatePluginOptions/RenderNodeOptions';
import { SPRenderNodeProps } from '../types/SPRenderNodeProps';
import { getSlateClass } from './getSlateClass';

/**
 * Computes `className` and `nodeProps`
 */
export const getRenderNodeProps = <T extends SPRenderNodeProps>({
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
