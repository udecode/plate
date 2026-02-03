import React from 'react';

import clsx from 'clsx';
import { useAtomStoreValue } from 'jotai-x';
import omit from 'lodash/omit.js';
import { useDeepCompareMemo } from 'use-deep-compare';

import type { PlateProps } from '../components';

import { type EditableProps, ChunkingPlugin } from '../../lib';
import { pipeDecorate } from '../../static/utils/pipeDecorate';
import { ContentVisibilityChunk } from '../components';
import { useEditorRef, usePlateStore, usePluginOption } from '../stores';
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
  const storeRenderChunk = useAtomStoreValue(store, 'renderChunk');
  const storeRenderElement = useAtomStoreValue(store, 'renderElement');
  const storeRenderLeaf = useAtomStoreValue(store, 'renderLeaf');
  const storeRenderText = useAtomStoreValue(store, 'renderText');

  const decorateMemo = React.useMemo(
    () =>
      pipeDecorate(editor, storeDecorate ?? (editableProps?.decorate as any)),
    [editableProps?.decorate, editor, storeDecorate]
  );

  const decorate: typeof decorateMemo = React.useMemo(() => {
    if (!versionDecorate || !decorateMemo) return () => [];

    return (entry) => decorateMemo(entry);
  }, [decorateMemo, versionDecorate]);

  const defaultRenderChunk = usePluginOption(
    ChunkingPlugin,
    'contentVisibilityAuto'
  )
    ? ContentVisibilityChunk
    : undefined;

  const renderChunk =
    storeRenderChunk ?? editableProps?.renderChunk ?? defaultRenderChunk;

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

  const props: EditableProps = useDeepCompareMemo(() => {
    const _props: EditableProps = {
      decorate,
      renderChunk,
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
  }, [
    decorate,
    editableProps,
    renderChunk,
    renderElement,
    renderLeaf,
    renderText,
  ]);

  return useDeepCompareMemo(
    () => ({
      ...omit(editableProps, [
        ...DOM_HANDLERS,
        'renderChunk',
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
