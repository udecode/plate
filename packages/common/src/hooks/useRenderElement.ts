import {
  useEditorOptions,
  useEditorPluginOptions,
} from '@udecode/slate-plugins-core';
import { getRenderElement, getRenderElements } from '../utils/getRenderElement';

export const useRenderElement = (pluginKey: string) => {
  return getRenderElement(useEditorPluginOptions(pluginKey));
};

export const useRenderElements = (pluginKeys: string[]) => {
  const options = useEditorOptions();
  return getRenderElements(pluginKeys.map((key) => options[key]));
};
