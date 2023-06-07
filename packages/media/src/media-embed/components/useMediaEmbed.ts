import { useMediaStore } from '../../media/mediaStore';

export const useMediaEmbed = () => {
  const { component, ...embedData } = useMediaStore().get.urlData();

  return {
    component: component || 'iframe',
    props: {
      id: embedData.id,
      src: embedData.url,
    },
  };
};
