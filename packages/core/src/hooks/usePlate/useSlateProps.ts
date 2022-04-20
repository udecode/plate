import { useCallback, useMemo } from 'react';
import { PlateProps } from '../../components/Plate';
import {
  getPlateActions,
  usePlateSelectors,
} from '../../stores/plate/platesStore';
import { usePlateEditorRef } from '../../stores/plate/selectors/usePlateEditorRef';
import { SlateProps } from '../../types/slate/SlateProps';
import { TDescendant } from '../../types/slate/TDescendant';
import { pipeOnChange } from '../../utils/pipeOnChange';

/**
 * Get Slate props stored in a global store.
 */
export const useSlateProps = ({ id }: Pick<PlateProps, 'id'> = {}): Omit<
  SlateProps,
  'children'
> => {
  const editor = usePlateEditorRef(id);
  const keyPlugins = usePlateSelectors(id).keyPlugins();
  const value = usePlateSelectors(id).value();
  const onChangeProp = usePlateSelectors(id).onChange();

  const onChange = useCallback(
    (newValue: TDescendant[]) => {
      if (!editor || !keyPlugins) return;

      const eventIsHandled = pipeOnChange(editor)(newValue);

      if (!eventIsHandled) {
        onChangeProp?.(newValue);
      }

      getPlateActions(id).value(newValue);
    },
    [onChangeProp, editor, id, keyPlugins]
  );

  return useMemo(() => {
    if (!editor) return {};

    return {
      key: editor.key,
      editor,
      onChange,
      value,
    };
  }, [editor, onChange, value]);
};
