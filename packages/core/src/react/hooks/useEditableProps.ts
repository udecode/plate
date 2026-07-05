import React from 'react';

import type { EditableProps as PliteEditableProps } from '@platejs/plite-react';
import clsx from 'clsx';
import { useAtomStoreValue } from 'jotai-x';
import omit from 'lodash/omit.js';
import { useDeepCompareMemo } from 'use-deep-compare';

import type { PlateProps } from '../components';

import type { EditableProps } from '../../lib';
import { pipeDecorate } from '../../static/utils/pipeDecorate';
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
  Pick<PlateProps, 'decorate'> = {}): PliteEditableProps => {
  const { id } = editableProps;

  const editor = useEditorRef(id);
  const store = usePlateStore(id);
  const storeDecorate = useAtomStoreValue(store, 'decorate');
  const storeRenderElement = useAtomStoreValue(store, 'renderElement');
  const storeRenderLeaf = useAtomStoreValue(store, 'renderLeaf');
  const storeRenderText = useAtomStoreValue(store, 'renderText');

  const decorateMemo = React.useMemo(
    () =>
      pipeDecorate(editor, storeDecorate ?? (editableProps?.decorate as any)),
    [editableProps?.decorate, editor, storeDecorate]
  );

  const renderElement = React.useMemo(
    () =>
      pipeRenderElement(
        editor,
        storeRenderElement ?? editableProps?.renderElement
      ),
    [editableProps?.renderElement, editor, storeRenderElement]
  );

  const renderLeaf = React.useMemo(
    () => pipeRenderLeaf(editor, storeRenderLeaf ?? editableProps?.renderLeaf),
    [editableProps?.renderLeaf, editor, storeRenderLeaf]
  );

  const renderText = React.useMemo(
    () => pipeRenderText(editor, storeRenderText ?? editableProps?.renderText),
    [editableProps?.renderText, editor, storeRenderText]
  );

  const scrollSelectionIntoView = React.useMemo<
    PliteEditableProps['scrollSelectionIntoView']
  >(() => {
    if (!editableProps.scrollSelectionIntoView) return;

    return (_editor, domRange) => {
      editableProps.scrollSelectionIntoView?.(editor, domRange);
    };
  }, [editableProps, editor]);

  const props: PliteEditableProps = useDeepCompareMemo(() => {
    const _props: PliteEditableProps = {
      decorate: decorateMemo,
      renderElement,
      renderLeaf,
      renderText,
      scrollSelectionIntoView,
    };

    DOM_HANDLERS.forEach((handlerKey) => {
      const handler = pipeHandler(editor, { editableProps, handlerKey }) as any;

      if (handler) {
        _props[handlerKey] = handler;
      }
    });

    return _props;
  }, [decorateMemo, editableProps, renderElement, renderLeaf, renderText]);

  return useDeepCompareMemo(
    () => ({
      ...omit(editableProps, [
        ...DOM_HANDLERS,
        'renderElement',
        'renderLeaf',
        'renderText',
        'decorate',
        'scrollSelectionIntoView',
      ]),
      ...props,
      'aria-disabled': disabled,
      className: clsx(
        'plite-editor',
        'ignore-click-outside/toolbar',
        editableProps.className
      ),
      'data-readonly': readOnly ? 'true' : undefined,
      readOnly,
    }),
    [editableProps, props, readOnly]
  );
};
