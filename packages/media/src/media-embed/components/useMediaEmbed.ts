import { useMediaStore } from '../../media/mediaStore';

export const useMediaEmbed = () => {
  const { component, ...embedData } = useMediaStore().get.urlData();

  return {
    props: {
      embedData,
    },
  };
};
