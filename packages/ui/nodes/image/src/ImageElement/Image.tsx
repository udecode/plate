import React, { useEffect } from 'react';
import { PlateRenderElementProps, Value } from '@udecode/plate-core';
import { ELEMENT_IMAGE, TImageElement } from '@udecode/plate-image';
import { getRootProps } from '@udecode/plate-styled-components';
import { Provider } from 'jotai';
import { createComponentAs } from '../utils/createComponentAs';
import { createElementAs } from '../utils/createElementAs';
import { HTMLPropsAs } from '../utils/types';
import { useWrapElement } from '../utils/useWrapElement';
import { imageElementAtom, useImageAtom } from './imageAtoms';

export const useImage = ({
  attributes,
  nodeProps,
  element,
  editor,
  ...props
}: ImageProps): HTMLPropsAs<'div'> => {
  const { as, ...rootProps } = getRootProps(props);
  const [, setElement] = useImageAtom(imageElementAtom);

  props = useWrapElement(
    props,
    (el) => {
      return (
        <Provider
          initialValues={[[imageElementAtom, element]]}
          scope={ELEMENT_IMAGE}
        >
          {el}
        </Provider>
      );
    },
    [element]
  );

  useEffect(() => {
    setElement(element);
  }, [element, setElement]);

  return {
    ...attributes,
    ...rootProps,
    ...nodeProps,
    ...props,
  };
};
export type ImageProps = PlateRenderElementProps<Value, TImageElement> &
  HTMLPropsAs<'div'>;

export const Image = createComponentAs<ImageProps>((props) => {
  const htmlProps = useImage(props as any);

  return createElementAs('div', htmlProps);
});
