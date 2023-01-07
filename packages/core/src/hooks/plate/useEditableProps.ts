import { useMemo } from 'react';
import omit from 'lodash/omit';
import { useDeepCompareMemo } from 'use-deep-compare';
import { TEditableProps } from '../../slate/types/TEditableProps';
import { PlateId, usePlateSelectors } from '../../stores/index';
import { usePlateEditorRef } from '../../stores/plate/selectors/usePlateEditorRef';
import { isDefined } from '../../utils/index';
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
  const keyDecorate = selectors.keyDecorate();
  const readOnly = selectors.readOnly();
  const storeDecorate = selectors.decorate()?.fn;
  const storeRenderLeaf = selectors.renderLeaf()?.fn;
  const storeRenderElement = selectors.renderElement()?.fn;

  const decorateMemo = useMemo(() => {
    return pipeDecorate(editor, storeDecorate ?? editableProps?.decorate);
  }, [editableProps?.decorate, editor, storeDecorate]);

  const decorate: typeof decorateMemo = useMemo(() => {
    if (!keyDecorate || !decorateMemo) return;

    return (entry) => decorateMemo(entry);
  }, [decorateMemo, keyDecorate]);

  const renderElement = useMemo(() => {
    return pipeRenderElement(
      editor,
      storeRenderElement ?? editableProps?.renderElement
    );
  }, [editableProps?.renderElement, editor, storeRenderElement]);

  const renderLeaf = useMemo(() => {
    return pipeRenderLeaf(editor, storeRenderLeaf ?? editableProps?.renderLeaf);
  }, [editableProps?.renderLeaf, editor, storeRenderLeaf]);

  const props: TEditableProps = useDeepCompareMemo(() => {
    const _props: TEditableProps = {
      decorate,
      renderElement,
      renderLeaf,
    };

    if (isDefined(readOnly)) {
      _props.readOnly = readOnly;
    }

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
  }, [decorate, editableProps, renderElement, renderLeaf]);

  return useDeepCompareMemo(
    () => ({
      ...omit(editableProps, [...DOM_HANDLERS, 'renderElement', 'renderLeaf']),
      ...props,
    }),
    [editableProps, props]
  );
};
