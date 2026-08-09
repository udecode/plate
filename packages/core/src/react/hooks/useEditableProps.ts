import React from 'react';

import type { EditableProps as PliteEditableProps } from '@platejs/plite-react';
import { useHotkeysContext } from '@udecode/react-hotkeys';
import clsx from 'clsx';
import { useAtomStoreValue } from 'jotai-x';
import omit from 'lodash/omit.js';
import { useDeepCompareMemo } from 'use-deep-compare';

import type { PlateProps } from '../components';

import type { EditableProps } from '../../lib';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { pipeDecorate } from '../../static/utils/pipeDecorate';
import { usePlateModelRevision } from '../internal/usePlateModelRevision';
import { useEditor, usePlateStore } from '../stores';
import { dispatchPlateShortcut } from '../utils/dispatchPlateShortcut';
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

  const editor = useEditor({ id });
  const { activeScopes } = useHotkeysContext();
  const modelRevision = usePlateModelRevision(editor);
  const shortcutTable = getPlateRuntime(editor).shortcutTable;
  const store = usePlateStore(id);
  const storeDecorate = useAtomStoreValue(store, 'decorate');
  const storeRenderElement = useAtomStoreValue(store, 'renderElement');
  const storeRenderLeaf = useAtomStoreValue(store, 'renderLeaf');
  const storeRenderText = useAtomStoreValue(store, 'renderText');

  const decorateMemo = React.useMemo(() => {
    void modelRevision;

    return pipeDecorate(
      editor,
      storeDecorate ?? (editableProps?.decorate as any)
    );
  }, [editableProps?.decorate, editor, modelRevision, storeDecorate]);

  const renderElement = React.useMemo(() => {
    void modelRevision;

    return pipeRenderElement(
      editor,
      storeRenderElement ?? editableProps?.renderElement
    );
  }, [editableProps?.renderElement, editor, modelRevision, storeRenderElement]);

  const renderLeaf = React.useMemo(() => {
    void modelRevision;

    return pipeRenderLeaf(editor, storeRenderLeaf ?? editableProps?.renderLeaf);
  }, [editableProps?.renderLeaf, editor, modelRevision, storeRenderLeaf]);

  const renderText = React.useMemo(() => {
    void modelRevision;

    return pipeRenderText(editor, storeRenderText ?? editableProps?.renderText);
  }, [editableProps?.renderText, editor, modelRevision, storeRenderText]);

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
      const shortcutPhase =
        handlerKey === 'onKeyDown'
          ? 'keydown'
          : handlerKey === 'onKeyUp'
            ? 'keyup'
            : null;
      const hasShortcut =
        shortcutPhase && shortcutTable.some((item) => item[shortcutPhase]);

      if (hasShortcut) {
        _props[handlerKey] = ((event: React.KeyboardEvent<HTMLDivElement>) => {
          const shortcutHandled = dispatchPlateShortcut(
            activeScopes,
            editor,
            event.nativeEvent,
            shortcutPhase,
            shortcutTable
          );

          if (!shortcutHandled) return handler?.(event);

          if (
            event.nativeEvent.defaultPrevented &&
            !event.isDefaultPrevented()
          ) {
            event.preventDefault();
          }
          if (event.nativeEvent.cancelBubble) {
            event.stopPropagation();

            return true;
          }

          return handler?.(event);
        }) as any;
      } else if (handler) {
        _props[handlerKey] = handler;
      }
    });

    return _props;
  }, [
    activeScopes,
    decorateMemo,
    editableProps,
    editor,
    renderElement,
    renderLeaf,
    renderText,
    shortcutTable,
  ]);

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
