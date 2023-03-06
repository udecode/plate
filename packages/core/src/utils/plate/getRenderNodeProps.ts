import { Value } from '@udecode/slate';
import clsx from 'clsx';
import { AnyObject } from '../../../../slate/src/types/misc/AnyObject';
import { getSlateClass } from '../../../../slate-utils/src/types/misc/getSlateClass';
import { PlateRenderNodeProps } from '../../types/plate/PlateRenderNodeProps';
import { WithPlatePlugin } from '../../types/plugin/PlatePlugin';

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
