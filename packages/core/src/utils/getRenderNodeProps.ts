import { Value } from '@udecode/slate';
import { AnyObject } from '@udecode/utils';
import clsx from 'clsx';
import { PlateRenderNodeProps } from '../types/PlateRenderNodeProps';
import { WithPlatePlugin } from '../types/plugin/PlatePlugin';
import { getSlateClass } from './misc/getSlateClass';

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

  if (nodeProps.nodeProps) {
    // remove attributes values that are undefined
    Object.keys(nodeProps.nodeProps).forEach((key) => {
      if (nodeProps.nodeProps?.[key] === undefined) {
        delete nodeProps.nodeProps?.[key];
      }
    });
  }

  const { className } = nodeProps;

  return { ...nodeProps, className: clsx(getSlateClass(type), className) };
};
