import { useCallback, useMemo } from 'react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { usePlugins, useSPEditor } from '../../store/useSlatePluginsSelectors';
import { UseEditablePropsOptions } from '../../types/UseEditablePropsOptions';
import { decoratePlugins } from '../../utils/decoratePlugins';
import { onDOMBeforeInputPlugins } from '../../utils/onDOMBeforeInputPlugins';
import { onKeyDownPlugins } from '../../utils/onKeyDownPlugins';
import { renderElementPlugins } from '../../utils/renderElementPlugins';
import { renderLeafPlugins } from '../../utils/renderLeafPlugins';

export const useEditableProps = ({
  id,
  editableProps,
}: UseEditablePropsOptions): (() => EditableProps) => {
  const editor = useSPEditor(id);
  const plugins = usePlugins(id);

  const props = useMemo(
    () => ({
      renderElement: renderElementPlugins(editor, plugins),
      renderLeaf: renderLeafPlugins(editor, plugins),
      onKeyDown: onKeyDownPlugins(editor, plugins),
      decorate: decoratePlugins(editor, plugins),
      onDOMBeforeInput: onDOMBeforeInputPlugins(editor, plugins),
    }),
    [editor, plugins]
  );

  return useCallback(
    () => ({
      ...props,
      ...editableProps,
    }),
    [editableProps, props]
  );
};
