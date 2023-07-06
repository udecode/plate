import { createPrimitiveComponent, useElement } from '@udecode/plate-common';

import { useCaptionString } from '../../caption/index';
import { TMediaElement } from '../../media/index';

export const useImage = () => {
  const { url } = useElement<TMediaElement>();

  const captionString = useCaptionString();

  return {
    props: {
      src: url,
      alt: captionString,
      draggable: true,
    },
  };
};

export const Image = createPrimitiveComponent('img')({
  propsHook: useImage,
});
