import { useMemo } from 'react';
import omit from 'lodash/omit';
import { useDeepCompareMemo } from 'use-deep-compare';
import { TEditableProps } from '../../slate/types/TEditableProps';
import { PlateId, usePlateSelectors } from '../../stores/index';
import { usePlateEditorRef } from '../../stores/plate/selectors/usePlateEditorRef';
import { DOM_HANDLERS } from '../../utils/misc/dom-attributes';
import { pipeDecorate } from '../../utils/plate/pipeDecorate';
import { pipeHandler } from '../../utils/plate/pipeHandler';
import { pipeRenderElement } from '../../utils/plate/pipeRenderElement';
import { pipeRenderLeaf } from '../../utils/plate/pipeRenderLeaf';

export const useEditableProps = ({
  id,
  ...editableProps
}: TEditableProps & { id?: PlateId } = {}): TEditableProps => {
  const editor = usePlateEditorRef(id);
  const selectors = usePlateSelectors(id);
  const keyPlugins = selectors.keyPlugins();
  const keyDecorate = selectors.keyDecorate();
  const storeDecorate = selectors.decorate();
  const storeRenderLeaf = selectors.renderLeaf();
  const storeRenderElement = selectors.renderElement();

  const isValid = editor && !!keyPlugins;

  const decorateMemo = useMemo(() => {
    if (!isValid) return;

    return pipeDecorate(editor, storeDecorate ?? editableProps?.decorate);
  }, [editableProps?.decorate, editor, isValid, storeDecorate]);

  const decorate: typeof decorateMemo = useMemo(() => {
    if (!keyDecorate || !decorateMemo) return;

    return (entry) => decorateMemo(entry);
  }, [decorateMemo, keyDecorate]);

  const renderElement = useMemo(() => {
    if (!isValid) return;

    return pipeRenderElement(
      editor,
      storeRenderElement ?? editableProps?.renderElement
    );
  }, [editableProps?.renderElement, editor, isValid, storeRenderElement]);

  const renderLeaf = useMemo(() => {
    if (!isValid) return;

    return pipeRenderLeaf(editor, storeRenderLeaf ?? editableProps?.renderLeaf);
  }, [editableProps?.renderLeaf, editor, isValid, storeRenderLeaf]);

  const props: TEditableProps = useDeepCompareMemo(() => {
    if (!isValid) return {};

    const _props: TEditableProps = {
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
