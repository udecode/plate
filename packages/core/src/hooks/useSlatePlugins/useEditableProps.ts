import { useMemo } from 'react';
import { EditableProps } from 'slate-react/dist/components/editable';
import {
  useStoreEditor,
  useStoreSlatePlugins,
} from '../../store/useSlatePluginsSelectors';
import { SPEditor } from '../../types/SPEditor';
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
  const editor = useStoreEditor<SPEditor | undefined>(id);
  const plugins = useStoreSlatePlugins(id);

  const props: EditableProps = useMemo(() => {
    if (!editor) return {};

    return {
      renderElement: pipeRenderElement(editor, plugins),
      renderLeaf: pipeRenderLeaf(editor, plugins),
      onKeyDown: pipeOnKeyDown(editor, plugins),
      decorate: pipeDecorate(editor, plugins),
      onDOMBeforeInput: pipeOnDOMBeforeInput(editor, plugins),
    };
  }, [editor, plugins]);

  return useMemo(
    () => ({
      ...props,
      ...editableProps,
    }),
    [editableProps, props]
  );
};
