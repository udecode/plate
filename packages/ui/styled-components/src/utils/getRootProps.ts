import { AnyObject, EElement, Value } from '@udecode/plate-common';
import { PlateElementProps } from '../components/PlateElement';
import { PlateLeafProps } from '../components/PlateLeaf';

export const getRootProps = <V extends Value = Value>(
  props: PlateElementProps<V, EElement<V>> | PlateLeafProps<V> | AnyObject
) => {
  const {
    editor,
    attributes,
    children,
    nodeProps,
    element,
    leaf,
    text,
    ...rootProps
  } = props as PlateElementProps<V, EElement<V>> & PlateLeafProps<V>;

  return rootProps;
};
