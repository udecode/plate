import clsx from 'clsx';
import { RenderNodeOptions } from '../types/PlatePluginOptions/RenderNodeOptions';
import { SPRenderNodeProps } from '../types/SPRenderNodeProps';
import { getSlateClass } from './getSlateClass';

/**
 * Computes `className` and `nodeProps`
 */
export const getRenderNodeProps = ({
  attributes,
  overrideProps,
  type,
  getNodeProps,
  props,
}: Omit<RenderNodeOptions, 'component'> & {
  props: SPRenderNodeProps;
  attributes?: any;
}) => {
  const nodeProps = getNodeProps?.(props as any) ?? attributes ?? {};

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

  return { className: clsx(getSlateClass(type), className), nodeProps };
};
