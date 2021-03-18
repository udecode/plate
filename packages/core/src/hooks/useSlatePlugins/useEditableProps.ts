import { useCallback, useMemo } from 'react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { usePlugins } from '../../store/usePlugins';
import { useSlatePluginsEditor } from '../../store/useSlatePluginsEditor';
import { UseEditablePropsOptions } from '../../types/UseEditablePropsOptions';
import { decoratePlugins } from '../../utils/decoratePlugins';
import { flatMapKey } from '../../utils/flatMapKey';
import { onDOMBeforeInputPlugins } from '../../utils/onDOMBeforeInputPlugins';
import { onKeyDownPlugins } from '../../utils/onKeyDownPlugins';
import { renderElementPlugins } from '../../utils/renderElementPlugins';
import { renderLeafPlugins } from '../../utils/renderLeafPlugins';

export const useEditableProps = ({
  id,
  editableProps,
}: UseEditablePropsOptions): (() => EditableProps) => {
  const editor = useSlatePluginsEditor(id);
  const plugins = usePlugins(id);

  const renderElement = useMemo(() => {
    console.log('renderElement');
    return renderElementPlugins(editor, flatMapKey(plugins, 'renderElement'));
  }, [editor, plugins]);

  const renderLeaf = useMemo(() => {
    console.log('renderLeaf');
    return renderLeafPlugins(editor, flatMapKey(plugins, 'renderLeaf'));
  }, [editor, plugins]);

  const onKeyDown = useMemo(() => {
    console.log('onKeyDown');
    return onKeyDownPlugins(editor, flatMapKey(plugins, 'onKeyDown'));
  }, [editor, plugins]);

  const decorate = useMemo(() => {
    console.log('decorate');
    return decoratePlugins(editor, flatMapKey(plugins, 'decorate'));
  }, [editor, plugins]);

  const onDOMBeforeInput = useMemo(
    () =>
      onDOMBeforeInputPlugins(editor, flatMapKey(plugins, 'onDOMBeforeInput')),
    [editor, plugins]
  );

  return useCallback(
    () => ({
      renderElement,
      renderLeaf,
      onKeyDown,
      decorate,
      onDOMBeforeInput,
      ...editableProps,
    }),
    [
      decorate,
      editableProps,
      onDOMBeforeInput,
      onKeyDown,
      renderElement,
      renderLeaf,
    ]
  );
};
