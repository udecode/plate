/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { EditableProps } from 'slate-react/dist/components/editable';
import {
  useStoreEditor,
  useStorePlugins,
} from '../../store/useSlatePluginsSelectors';
import { UseEditablePropsOptions } from '../../types/UseEditablePropsOptions';
import { pipeDecorate } from '../../utils/pipeDecorate';
import { pipeOnDOMBeforeInput } from '../../utils/pipeOnDOMBeforeInput';
import { pipeOnKeyDown } from '../../utils/pipeOnKeyDown';
import { pipeRenderElement } from '../../utils/pipeRenderElement';
import { pipeRenderLeaf } from '../../utils/pipeRenderLeaf';

export const useEditableProps = ({
  id,
  editableProps,
}: UseEditablePropsOptions): EditableProps => {
  const editor = useStoreEditor(id);
  const plugins = useStorePlugins(id);

  return useMemo(() => {
    console.log('update plugins');

    return {
      renderElement: pipeRenderElement(editor, plugins),
      renderLeaf: pipeRenderLeaf(editor, plugins),
      onKeyDown: pipeOnKeyDown(editor, plugins),
      decorate: pipeDecorate(editor, plugins),
      onDOMBeforeInput: pipeOnDOMBeforeInput(editor, plugins),
      ...editableProps,
    };
  }, [editor, plugins]);
};
