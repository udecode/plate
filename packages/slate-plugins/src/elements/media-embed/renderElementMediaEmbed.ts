import { getRenderElement } from 'element';
import { MediaEmbedElement } from './components';
import { MEDIA_EMBED, MediaEmbedRenderElementOptions } from './types';

export const renderElementMediaEmbed = ({
  typeMediaEmbed = MEDIA_EMBED,
  component = MediaEmbedElement,
}: MediaEmbedRenderElementOptions = {}) =>
  getRenderElement({
    type: typeMediaEmbed,
    component,
  });
