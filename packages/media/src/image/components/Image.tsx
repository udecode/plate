import { createPrimitiveComponent, useElement } from '@udecode/plate-common';

import { TMediaElement } from '../../media/index';

export const useImage = () => {
  const { url } = useElement<TMediaElement>();

  return {
    props: {
      src: url,
      draggable: true,
    },
  };
};

export const Image = createPrimitiveComponent('img')({
  propsHook: useImage,
});
