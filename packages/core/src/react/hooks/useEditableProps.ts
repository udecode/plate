import React from 'react';

import clsx from 'clsx';
import { useAtomStoreValue } from 'jotai-x';
import omit from 'lodash/omit.js';
import { useDeepCompareMemo } from 'use-deep-compare';

import type { EditableProps } from '../../lib';
import type { PlateProps } from '../components';

import { pipeDecorate } from '../../lib/static/utils/pipeDecorate';
import { useEditorRef, usePlateStore } from '../stores';
import { DOM_HANDLERS } from '../utils/dom-attributes';
import { pipeHandler } from '../utils/pipeHandler';
import { pipeRenderElement } from '../utils/pipeRenderElement';
import { pipeRenderLeaf } from '../utils/pipeRenderLeaf';
import { pipeRenderText } from '../utils/pipeRenderText';

export const useEditableProps = ({
  disabled,
  readOnly,
  ...editableProps
}: Omit<EditableProps, 'decorate'> &
  Pick<PlateProps, 'decorate'> = {}): EditableProps => {
  const { id } = editableProps;

  const editor = useEditorRef(id);
  const store = usePlateStore(id);
  const versionDecorate = useAtomStoreValue(store, 'versionDecorate');
  const storeDecorate = useAtomStoreValue(store, 'decorate');
  const storeRenderLeaf = useAtomStoreValue(store, 'renderLeaf');
  const storeRenderElement = useAtomStoreValue(store, 'renderElement');
  const storeRenderText = useAtomStoreValue(store, 'renderText');

  const decorateMemo = React.useMemo(() => {
    return pipeDecorate(
      editor,
      storeDecorate ?? (editableProps?.decorate as any)
    );
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

  const renderText = React.useMemo(() => {
    return pipeRenderText(editor, storeRenderText ?? editableProps?.renderText);
  }, [editableProps?.renderText, editor, storeRenderText]);

  const props: EditableProps = useDeepCompareMemo(() => {
    const _props: EditableProps = {
      decorate,
      renderElement,
      renderLeaf,
      renderText,
    };

    DOM_HANDLERS.forEach((handlerKey) => {
      const handler = pipeHandler(editor, { editableProps, handlerKey }) as any;

      if (handler) {
        _props[handlerKey] = handler;
      }
    });

    return _props;
  }, [decorate, editableProps, renderElement, renderLeaf, renderText]);

  return useDeepCompareMemo(
    () => ({
      ...omit(editableProps, [
        ...DOM_HANDLERS,
        'renderElement',
        'renderLeaf',
        'renderText',
        'decorate',
      ]),
      ...props,
      'aria-disabled': disabled,
      className: clsx(
        'slate-editor',
        'ignore-click-outside/toolbar',
        editableProps.className
      ),
      'data-readonly': readOnly ? 'true' : undefined,
      readOnly,
    }),
    [editableProps, props, readOnly]
  );
};
