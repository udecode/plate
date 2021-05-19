import {
  getRenderElement,
  getSlatePluginTypes,
  SlatePlugin,
} from '@udecode/slate-plugins-core';
import { ELEMENT_EXCALIDRAW } from './defaults';
import { getExcalidrawDeserialize } from './getExcalidrawDeserialize';

/**
 * Enables support for embeddable media such as YouTube
 * or Vimeo videos, Instagram posts and tweets or Google Maps.
 */
export const createExcalidrawPlugin = ({
  pluginKey = ELEMENT_EXCALIDRAW,
}: {
  pluginKey?: string;
} = {}): SlatePlugin => ({
  pluginKeys: pluginKey,
  renderElement: getRenderElement(pluginKey),
  deserialize: getExcalidrawDeserialize(pluginKey),
  voidTypes: getSlatePluginTypes(pluginKey),
});
