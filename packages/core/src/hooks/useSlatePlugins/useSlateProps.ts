import { useCallback, useMemo } from 'react';
import { Node } from 'slate';
import { ReactEditor } from 'slate-react';
import { useSlatePluginsActions } from '../../store/useSlatePluginsActions';
import { useSlatePluginsEditor } from '../../store/useSlatePluginsEditor';
import { useSlatePluginsValue } from '../../store/useSlatePluginsValue';
import { SlateProps } from '../../types/SlateProps';
import { UseSlatePropsOptions } from '../../types/UseSlatePropsOptions';
import { SlatePluginsEditor } from '../../with/withSlatePlugins';

/**
 * Get Slate props stored in a global store.
 */
export const useSlateProps = ({
  id,
  onChange: controlledOnChange,
}: UseSlatePropsOptions = {}): (() => Omit<SlateProps, 'children'>) => {
  const { setValue } = useSlatePluginsActions(id);
  const editor = useSlatePluginsEditor<ReactEditor & SlatePluginsEditor>(id);
  const value = useSlatePluginsValue(id);

  const onChange = useMemo(() => {
    if (controlledOnChange) return controlledOnChange;

    return (v: Node[]) => {
      setValue(v);
    };
  }, [controlledOnChange, setValue]);

  return useCallback(
    () => ({
      editor,
      onChange,
      value,
    }),
    [editor, onChange, value]
  );
};
