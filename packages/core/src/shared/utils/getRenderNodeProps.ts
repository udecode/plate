import type { Value } from '@udecode/slate';
import type { AnyObject } from '@udecode/utils';

import { clsx } from 'clsx';

import type { PlateRenderNodeProps } from '../types/PlateRenderNodeProps';
import type { WithPlatePlugin } from '../types/plugin/PlatePlugin';

import { getSlateClass } from './misc/getSlateClass';

/**
 * Override node props with plugin props. `props.element.attributes` are passed
 * as `nodeProps`. Extend the class name with the node type.
 */
export const getRenderNodeProps = <V extends Value>({
  attributes,
  nodeProps,
  props,
  type,
}: {
  attributes?: AnyObject;
  nodeProps: PlateRenderNodeProps<V>;
} & Pick<WithPlatePlugin<V>, 'props' | 'type'>): PlateRenderNodeProps<V> => {
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
