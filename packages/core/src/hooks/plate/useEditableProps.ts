import { useMemo } from 'react';
import omit from 'lodash/omit';
import { useDeepCompareMemo } from 'use-deep-compare';
import { PlateProps } from '../../components/plate/Plate';
import { Value } from '../../slate/editor/TEditor';
import { TEditableProps } from '../../slate/types/TEditableProps';
import { usePlateSelectors } from '../../stores/plate/platesStore';
import { usePlateEditorRef } from '../../stores/plate/selectors/usePlateEditorRef';
import { DOM_HANDLERS } from '../../utils/misc/dom-attributes';
import { pipeDecorate } from '../../utils/plate/pipeDecorate';
import { pipeHandler } from '../../utils/plate/pipeHandler';
import { pipeRenderElement } from '../../utils/plate/pipeRenderElement';
import { pipeRenderLeaf } from '../../utils/plate/pipeRenderLeaf';

export const useEditableProps = <V extends Value>({
  id = 'main',
}: Pick<PlateProps<V>, 'id'>): TEditableProps<V> => {
  const editor = usePlateEditorRef<V>(id)!;
  const keyPlugins = usePlateSelectors<V>(id).keyPlugins();
  const keyDecorate = usePlateSelectors<V>(id).keyDecorate();
  const editableProps = usePlateSelectors<V>(id).editableProps();
  const storeDecorate = usePlateSelectors<V>(id).decorate();
  const storeRenderLeaf = usePlateSelectors<V>(id).renderLeaf();
  const storeRenderElement = usePlateSelectors<V>(id).renderElement();

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

    return pipeRenderElement<V>(
      editor,
      storeRenderElement ?? editableProps?.renderElement
    );
  }, [editableProps?.renderElement, editor, isValid, storeRenderElement]);

  const renderLeaf = useMemo(() => {
    if (!isValid) return;

    return pipeRenderLeaf(editor, storeRenderLeaf ?? editableProps?.renderLeaf);
  }, [editableProps?.renderLeaf, editor, isValid, storeRenderLeaf]);

  const props: TEditableProps<V> = useDeepCompareMemo(() => {
    if (!isValid) return {};

    const _props: TEditableProps<V> = {
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
