import { useCallback, useMemo } from 'react';
import { Node } from 'slate';
import {
  useSlatePluginsActions,
  useSlatePluginsEditor,
  useSlatePluginsValue,
} from '../../store/useSlatePluginsSelectors';
import { UseSlatePluginsOptions } from '../../types/UseSlatePluginsOptions';

/**
 * Get Slate props stored in a global store.
 */
export const useSlateProps = ({
  key,
  onChange: controlledOnChange,
}: UseSlatePluginsOptions = {}) => {
  const { setValue } = useSlatePluginsActions();
  const editor = useSlatePluginsEditor(key);
  const value = useSlatePluginsValue(key);

  console.log(value);

  const onChange = useMemo(() => {
    if (controlledOnChange) return controlledOnChange;
    return (v: Node[]) => setValue(v, key);
  }, [controlledOnChange, key, setValue]);

  return useCallback(
    () => ({
      editor,
      onChange,
      value,
    }),
    [editor, onChange, value]
  );
};
