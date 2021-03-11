import {
  useEditorMultiOptions,
  useEditorOptions,
  useRenderElementOptions,
} from '@udecode/slate-plugins-core';
import { getRenderElement, getRenderElements } from '../utils/getRenderElement';

export const useRenderElement = (pluginKey: string) => {
  console.log(useEditorOptions(pluginKey));
  console.log(useRenderElementOptions(pluginKey));

  return getRenderElement(useRenderElementOptions(pluginKey));
};

export const useRenderElements = (pluginKeys: string[]) => {
  return getRenderElements(Object.values(useEditorMultiOptions(pluginKeys)));
};
