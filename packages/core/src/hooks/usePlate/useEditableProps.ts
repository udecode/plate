import { useMemo } from 'react';
import omit from 'lodash/omit';
import { EditableProps } from 'slate-react/dist/components/editable';
import { usePlateEditorRef } from '../../stores/plate/selectors/usePlateEditorRef';
import { usePlateKey } from '../../stores/plate/selectors/usePlateKey';
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
  const editor = usePlateEditorRef(id);
  const keyPlugins = usePlateKey('keyPlugins', id);

  const props: EditableProps = useMemo(() => {
    if (!editor || !keyPlugins) return {};

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
  }, [editableProps, editor, keyPlugins]);

  return useMemo(
    () => ({
      ...omit(editableProps, [...DOM_HANDLERS, 'renderElement', 'renderLeaf']),
      ...props,
    }),
    [editableProps, props]
  );
};
