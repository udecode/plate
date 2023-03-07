import { createElementAs, HTMLPropsAs } from '@udecode/plate-common';
import { EmbedUrlData, useMediaStore } from '../../media/index';

export const useMediaEmbedVideo = ({
  ...props
}: EmbedUrlData): HTMLPropsAs<'iframe'> => {
  const { url } = useMediaStore().get.urlData();

  return {
    title: 'embed',
    frameBorder: '0',
    allowFullScreen: true,
    src: url,
    ...props,
  };
};

export const MediaEmbedVideo = (props: EmbedUrlData) => {
  const htmlProps = useMediaEmbedVideo(props);

  return createElementAs('iframe', htmlProps);
};
