import { useMemo } from 'react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { editorActions } from '../../store/editor.actions';
import {
  useStoreEditorRef,
  useStoreSlatePlugins,
} from '../../store/useSlatePluginsSelectors';
import { UseEditablePropsOptions } from '../../types/UseEditablePropsOptions';
import { DOM_HANDLERS } from '../../utils/dom-attributes';
import { pipeDecorate } from '../../utils/pipeDecorate';
import { pipeHandler } from '../../utils/pipeHandler';
import { pipeRenderElement } from '../../utils/pipeRenderElement';
import { pipeRenderLeaf } from '../../utils/pipeRenderLeaf';

export const useEditableProps = ({
  id,
  editableProps,
}: UseEditablePropsOptions): EditableProps => {
  const editor = useStoreEditorRef(id);
  const _plugins = useStoreSlatePlugins(id);

  const plugins: typeof _plugins = useMemo(
    () => [
      ...(_plugins ?? []),
      {
        onFocus: () => () => {
          console.log('yep');
          editorActions.setFocusedEditorId(id);
        },
        onBlur: () => () => {
          editorActions.setBlurredEditorId(id);
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
      ...editableProps,
    }),
    [editableProps, props]
  );
};
