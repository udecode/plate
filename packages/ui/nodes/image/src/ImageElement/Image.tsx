import React from 'react';
import { PlateRenderElementProps, Value } from '@udecode/plate-core';
import { ELEMENT_IMAGE, TImageElement } from '@udecode/plate-image';
import { Provider } from 'jotai';
import { createComponentAs } from '../utils/createComponentAs';
import { createElementAs } from '../utils/createElementAs';
import { HTMLPropsAs } from '../utils/types';
import { useComposedRef } from '../utils/useComposedRef';
import { elementAtom, SCOPE_NODE } from '../utils/useElement';
import { useWrapElement } from '../utils/useWrapElement';

export type ImageProps = PlateRenderElementProps<Value, TImageElement> &
  HTMLPropsAs<'div'>;

export const useImage = ({
  attributes,
  nodeProps,
  element,
  editor,
  ...props
}: ImageProps): HTMLPropsAs<'div'> => {
  props = useWrapElement(
    props,
    (el) => (
      <Provider initialValues={[[elementAtom, element]]} scope={SCOPE_NODE}>
        <Provider scope={ELEMENT_IMAGE}>{el}</Provider>
      </Provider>
    ),
    [element]
  );

  return {
    ...attributes,
    ...props,
    ...nodeProps,
    ref: useComposedRef(props.ref, attributes.ref),
  };
};

export const Image = createComponentAs<ImageProps>((props) => {
  const htmlProps = useImage(props as any);

  return createElementAs('div', htmlProps);
});
