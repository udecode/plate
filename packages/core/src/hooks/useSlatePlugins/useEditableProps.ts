import { useMemo } from 'react';
import omit from 'lodash/omit';
import { EditableProps } from 'slate-react/dist/components/editable';
import { setEventEditorId } from '../../stores/event-editor/actions/setEventEditorId';
import { useStoreEditorRef } from '../../stores/plate/selectors/useStoreEditorRef';
import { useStorePlate } from '../../stores/plate/selectors/useStorePlate';
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
  const editor = useStoreEditorRef(id);
  const _plugins = useStorePlate(id);

  const plugins: typeof _plugins = useMemo(
    () => [
      ...(_plugins ?? []),
      {
        onFocus: () => () => {
          setEventEditorId('focus', id);
        },
        onBlur: () => () => {
          setEventEditorId('blur', id);
        },
      },
    ],
    [_plugins, id]
  );

  const props: EditableProps = useMemo(() => {
    if (!editor) return {};

    const _props: EditableProps = {
      decorate: pipeDecorate(editor, plugins),
      renderElement: pipeRenderElement(editor, plugins),
      renderLeaf: pipeRenderLeaf(editor, plugins),
    };

    DOM_HANDLERS.forEach((handlerKey) => {
      const handler = pipeHandler(editor, {
        editableProps,
        handlerKey,
        plugins,
      }) as any;

      if (handler) {
        _props[handlerKey] = handler;
      }
    });

    return _props;
  }, [editableProps, editor, plugins]);

  return useMemo(
    () => ({
      ...props,
      ...omit(editableProps, DOM_HANDLERS),
    }),
    [editableProps, props]
  );
};
