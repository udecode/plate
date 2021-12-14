import { PlateProps } from '../../components/Plate';
import { useEditableProps } from './useEditableProps';
import { usePlateEffects } from './usePlateEffects';
import { useSlateProps } from './useSlateProps';

/**
 * Run `usePlateEffects` and props getter for `Slate` and `Editable` components.
 * Use `usePlateStore` to select store state.
 */
export const usePlate = <T = {}>(options: PlateProps<T>) => {
  const { id } = options;

  usePlateEffects(options);

  return {
    slateProps: useSlateProps({ id }),
    editableProps: useEditableProps({ id }),
  };
};
