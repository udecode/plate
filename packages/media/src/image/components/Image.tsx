import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useElement,
} from '@udecode/plate-common';
import { useCaptionString } from '../../caption/index';
import { TMediaElement } from '../../media/index';

export const useImage = (props?: HTMLPropsAs<'img'>): HTMLPropsAs<'img'> => {
  const { url } = useElement<TMediaElement>();

  const captionString = useCaptionString();

  return {
    src: url,
    alt: captionString,
    draggable: true,
    ...props,
  };
};

export const Image = createComponentAs((props) => {
  const htmlProps = useImage(props);

  return createElementAs('img', htmlProps);
});
