import { useMemo } from 'react';
import omit from 'lodash/omit';
import { EditableProps } from 'slate-react/dist/components/editable';
import { usePlateEditorWithPlugins } from '../../stores/plate/selectors/usePlateEditorRef';
import { UseEditablePropsOptions } from '../../types/UseEditablePropsOptions';
import { DOM_HANDLERS } from '../../utils/dom-attributes';
import { pipeDecorate } from '../../utils/pipeDecorate';
import { pipeHandler } from '../../utils/pipeHandler';
import { pipeRenderElement } from '../../utils/pipeRenderElement';
import { pipeRenderLeaf } from '../../utils/pipeRenderLeaf';

export const useEditableProps = ({
  id = 'main',
  editableProps,
}: UseEditablePropsOptions): EditableProps => {
  const editor = usePlateEditorWithPlugins(id)!;

  const props: EditableProps = useMemo(() => {
    const _props: EditableProps = {
      decorate: pipeDecorate(editor),
      renderElement: pipeRenderElement(editor, editableProps),
      renderLeaf: pipeRenderLeaf(editor, editableProps),
    };

    DOM_HANDLERS.forEach((handlerKey) => {
      const handler = pipeHandler(editor, {
        editableProps,
        handlerKey,
      }) as any;

      if (handler) {
        _props[handlerKey] = handler;
      }
    });

    return _props;
  }, [editableProps, editor]);

  return useMemo(
    () => ({
      ...omit(editableProps, [...DOM_HANDLERS, 'renderElement', 'renderLeaf']),
      ...props,
    }),
    [editableProps, props]
  );
};
