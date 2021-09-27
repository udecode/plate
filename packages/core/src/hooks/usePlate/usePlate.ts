import { SPEditor } from '../../types/SPEditor';
import { UsePlateOptions } from '../../types/UsePlateOptions';
import { useEditableProps } from './useEditableProps';
import { usePlateEffects } from './usePlateEffects';
import { useSlateProps } from './useSlateProps';

/**
 * Run `usePlateEffects` and props getter for `Slate` and `Editable` components.
 * Use `usePlateStore` to select store state.
 */
export const usePlate = <T extends SPEditor = SPEditor>({
  id,
  components,
  editor,
  initialValue,
  value,
  options,
  plugins,
  onChange,
  editableProps,
  normalizeInitialValue,
}: UsePlateOptions<T>) => {
  usePlateEffects({
    id,
    components,
    plugins,
    initialValue,
    editor,
    value,
    options,
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
