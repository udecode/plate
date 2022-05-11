import { PlateProps } from '../../components/Plate';
import { Value } from '../../slate/editor/TEditor';
import { PlateEditor } from '../../types/PlateEditor';
import { useEditableProps } from './useEditableProps';
import { usePlateEffects } from './usePlateEffects';
import { useSlateProps } from './useSlateProps';

/**
 * Run `usePlateEffects` and props getter for `Slate` and `Editable` components.
 * Use `usePlateStore` to select store state.
 */
export const usePlate = <
  V extends Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  options: PlateProps<V, E>
) => {
  const { id } = options;

  usePlateEffects(options);

  return {
    slateProps: useSlateProps({ id }),
    editableProps: useEditableProps({ id }),
  };
};
