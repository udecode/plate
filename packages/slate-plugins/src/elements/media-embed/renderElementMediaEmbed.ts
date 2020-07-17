import { getRenderElement } from '../../common/utils/getRenderElement';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_MEDIA_EMBED } from './defaults';
import { MediaEmbedRenderElementOptions } from './types';

export const renderElementMediaEmbed = (
  options?: MediaEmbedRenderElementOptions
) => {
  const { media_embed } = setDefaults(options, DEFAULTS_MEDIA_EMBED);

  return getRenderElement(media_embed);
};
