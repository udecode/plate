import clsx from 'clsx';
import { AnyObject } from '../common/types/utility/AnyObject';
import { Value } from '../slate/editor/TEditor';
import { PlateRenderNodeProps } from '../types/PlateRenderNodeProps';
import { WithPlatePlugin } from '../types/plugins/PlatePlugin';
import { getSlateClass } from './getSlateClass';

/**
 * Override node props with plugin props.
 * `props.element.attributes` are passed as `nodeProps`.
 * Extend the class name with the node type.
 */
export const getRenderNodeProps = <V extends Value>({
  attributes,
  nodeProps,
  props,
  type,
}: Pick<WithPlatePlugin<V>, 'type' | 'props'> & {
  attributes?: AnyObject;
  nodeProps: PlateRenderNodeProps<V>;
}): PlateRenderNodeProps<V> => {
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
