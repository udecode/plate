import { createPrimitiveComponent, useElement } from '@udecode/plate-common';

import type { TMediaElement } from '../../media/index';

export const useImage = () => {
  const { url } = useElement<TMediaElement>();

  return {
    props: {
      draggable: true,
      src: url,
    },
  };
};

export const Image = createPrimitiveComponent('img')({
  propsHook: useImage,
});
