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
  let nodeProps = {
    ...props,
    ...(getNodeProps?.(props as any) ?? attributes ?? {}),
  };

  if (overrideProps) {
    const newProps =
      typeof overrideProps === 'function'
        ? overrideProps(props as any)
        : overrideProps;

    if (newProps) {
      nodeProps = {
        ...nodeProps,
        ...newProps,
      };
    }
  }

  const { className } = nodeProps;

  return { ...nodeProps, className: clsx(getSlateClass(type), className) };
};
