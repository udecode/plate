import { createPrimitiveComponent } from '@udecode/plate-common';

import { useMediaStore } from '../../media/index';

export const useMediaEmbedVideo = () => {
  const { url } = useMediaStore().get.urlData();

  return {
    props: {
      title: 'embed',
      frameBorder: '0',
      allowFullScreen: true,
      src: url,
    },
  };
};

export const MediaEmbedVideo = createPrimitiveComponent('iframe')({
  propsHook: useMediaEmbedVideo,
});
