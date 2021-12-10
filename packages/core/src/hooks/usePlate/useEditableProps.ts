import { useMemo } from 'react';
import omit from 'lodash/omit';
import { EditableProps } from 'slate-react/dist/components/editable';
import { useDeepCompareMemo } from 'use-deep-compare';
import { usePlateSelectors } from '../../stores/plate/platesStore';
import { usePlateEditorRef } from '../../stores/plate/selectors/usePlateEditorRef';
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
  const keyPlugins = usePlateSelectors(id).keyPlugins();

  const isValid = editor && keyPlugins;

  const decorate = useMemo(() => {
    if (!isValid) return;

    return pipeDecorate(editor, editableProps?.decorate);
  }, [editableProps?.decorate, editor, isValid]);

  const renderElement = useMemo(() => {
    if (!isValid) return;

    return pipeRenderElement(editor, editableProps?.renderElement);
  }, [editableProps?.renderElement, editor, isValid]);

  const renderLeaf = useMemo(() => {
    if (!isValid) return;

    return pipeRenderLeaf(editor, editableProps?.renderLeaf);
  }, [editableProps?.renderLeaf, editor, isValid]);

  const props: EditableProps = useDeepCompareMemo(() => {
    if (!isValid) return {};

    const _props: EditableProps = {
      decorate,
      renderElement,
      renderLeaf,
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
  }, [decorate, editableProps, isValid, renderElement, renderLeaf]);

  return useDeepCompareMemo(
    () => ({
      ...omit(editableProps, [...DOM_HANDLERS, 'renderElement', 'renderLeaf']),
      ...props,
    }),
    [editableProps, props]
  );
};
