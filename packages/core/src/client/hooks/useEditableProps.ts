import React from 'react';
import { isDefined } from '@udecode/utils';
import omit from 'lodash/omit.js';
import { useDeepCompareMemo } from 'use-deep-compare';

import { DOM_HANDLERS } from '../../shared/types/misc/dom-attributes';
import { TEditableProps } from '../../shared/types/slate-react/TEditableProps';
import { pipeDecorate } from '../../shared/utils/pipeDecorate';
import { pipeHandler } from '../../shared/utils/pipeHandler';
import { useEditorRef, usePlateSelectors } from '../stores';
import { pipeRenderElement } from '../utils/pipeRenderElement';
import { pipeRenderLeaf } from '../utils/pipeRenderLeaf';

export const useEditableProps = (
  editableProps: TEditableProps = {}
): TEditableProps => {
  const { id } = editableProps;

  const editor = useEditorRef(id);
  const selectors = usePlateSelectors(id);
  const versionDecorate = selectors.versionDecorate();
  const readOnly = selectors.readOnly();
  const storeDecorate = selectors.decorate();
  const storeRenderLeaf = selectors.renderLeaf();
  const storeRenderElement = selectors.renderElement();

  const decorateMemo = React.useMemo(() => {
    return pipeDecorate(editor, storeDecorate ?? editableProps?.decorate);
  }, [editableProps?.decorate, editor, storeDecorate]);

  const decorate: typeof decorateMemo = React.useMemo(() => {
    if (!versionDecorate || !decorateMemo) return;

    return (entry) => decorateMemo(entry);
  }, [decorateMemo, versionDecorate]);

  const renderElement = React.useMemo(() => {
    return pipeRenderElement(
      editor,
      storeRenderElement ?? editableProps?.renderElement
    );
  }, [editableProps?.renderElement, editor, storeRenderElement]);

  const renderLeaf = React.useMemo(() => {
    return pipeRenderLeaf(editor, storeRenderLeaf ?? editableProps?.renderLeaf);
  }, [editableProps?.renderLeaf, editor, storeRenderLeaf]);

  const props: TEditableProps = useDeepCompareMemo(() => {
    const _props: TEditableProps = {
      decorate,
      renderElement,
      renderLeaf,
    };

    if (isDefined(readOnly)) {
      _props.readOnly = readOnly!;
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
