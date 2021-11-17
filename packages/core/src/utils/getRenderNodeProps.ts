import clsx from 'clsx';
import { PlateRenderNodeProps } from '../types/PlateRenderNodeProps';
import { WithPlatePlugin } from '../types/plugins/PlatePlugin';
import { AnyObject } from '../types/utility/AnyObject';
import { getSlateClass } from './getSlateClass';

/**
 * Override node props with plugin props.
 * `props.element.attributes` are passed as `nodeProps`.
 * Extend the class name with the node type.
 */
export const getRenderNodeProps = <T extends PlateRenderNodeProps>({
  attributes,
  nodeProps,
  props,
  type,
}: Pick<WithPlatePlugin, 'type' | 'props'> & {
  attributes?: AnyObject;
  nodeProps: T;
}) => {
  let newProps: AnyObject = {};

  if (props) {
    newProps =
      (typeof props === 'function' ? props(nodeProps as any) : props) ?? {};
  }

  if (!newProps.nodeProps && attributes) {
    newProps.nodeProps = attributes;
  }

  nodeProps = { ...nodeProps, ...newProps };

  const { className } = nodeProps;

  return { ...nodeProps, className: clsx(getSlateClass(type), className) };
};
