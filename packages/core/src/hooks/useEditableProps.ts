import { useMemo } from 'react';
import { isDefined } from '@udecode/utils';
import omit from 'lodash/omit.js';
import { useDeepCompareMemo } from 'use-deep-compare';

import { usePlateSelectors } from '../stores';
import { useEditorRef } from '../stores/plate/selectors/useEditorRef';
import { DOM_HANDLERS } from '../types/misc/dom-attributes';
import { TEditableProps } from '../types/slate-react/TEditableProps';
import { pipeDecorate } from '../utils/pipeDecorate';
import { pipeHandler } from '../utils/pipeHandler';
import { pipeRenderElement } from '../utils/pipeRenderElement';
import { pipeRenderLeaf } from '../utils/pipeRenderLeaf';

export const useEditableProps = (
  editableProps: TEditableProps = {}
): TEditableProps => {
  const { id } = editableProps;

  const editor = useEditorRef(id);
  const selectors = usePlateSelectors();
  const versionDecorate = selectors.versionDecorate({ scope: id });
  const readOnly = selectors.readOnly({ scope: id });
  const storeDecorate = selectors.decorate({ scope: id })?.fn;
  const storeRenderLeaf = selectors.renderLeaf({ scope: id })?.fn;
  const storeRenderElement = selectors.renderElement({ scope: id })?.fn;

  const decorateMemo = useMemo(() => {
    return pipeDecorate(editor, storeDecorate ?? editableProps?.decorate);
  }, [editableProps?.decorate, editor, storeDecorate]);

  const decorate: typeof decorateMemo = useMemo(() => {
    if (!versionDecorate || !decorateMemo) return;

    return (entry) => decorateMemo(entry);
  }, [decorateMemo, versionDecorate]);

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
  }, [decorate, editableProps, renderElement, renderLeaf, readOnly]);

  return useDeepCompareMemo(
    () => ({
      ...omit(editableProps, [...DOM_HANDLERS, 'renderElement', 'renderLeaf']),
      ...props,
    }),
    [editableProps, props]
  );
};
