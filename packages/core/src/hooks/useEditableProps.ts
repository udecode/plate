import { useMemo } from 'react';
import { isDefined } from '@udecode/slate';
import omit from 'lodash/omit';
import { useDeepCompareMemo } from 'use-deep-compare';
import { PlateId, usePlateSelectors } from '../stores';
import { usePlateEditorRef } from '../stores/plate/selectors/usePlateEditorRef';
import { DOM_HANDLERS } from '../types/misc/dom-attributes';
import { TEditableProps } from '../types/slate-react/TEditableProps';
import { pipeDecorate } from '../utils/pipeDecorate';
import { pipeHandler } from '../utils/pipeHandler';
import { pipeRenderElement } from '../utils/pipeRenderElement';
import { pipeRenderLeaf } from '../utils/pipeRenderLeaf';

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
