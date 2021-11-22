import { UsePlateOptions } from '../../types/UsePlateOptions';
import { useEditableProps } from './useEditableProps';
import { usePlateEffects } from './usePlateEffects';
import { useSlateProps } from './useSlateProps';

/**
 * Run `usePlateEffects` and props getter for `Slate` and `Editable` components.
 * Use `usePlateStore` to select store state.
 */
export const usePlate = <T = {}>({
  id,
  editor,
  initialValue,
  value,
  plugins,
  onChange,
  editableProps,
  normalizeInitialValue,
}: UsePlateOptions<T>) => {
  usePlateEffects({
    id,
    plugins,
    initialValue,
    editor,
    value,
    normalizeInitialValue,
  });

  return {
    slateProps: useSlateProps({
      id,
      onChange,
    }),
    editableProps: useEditableProps({
      id,
      editableProps,
    }),
  };
};
