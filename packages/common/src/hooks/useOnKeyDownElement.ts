import {
  useEditorOptions,
  useEditorPluginOptions,
  useEditorPluginType,
} from '@udecode/slate-plugins-core';
import { DEFAULT_ELEMENT } from '../types/node.types';
import { getOnKeyDownElement } from '../utils/getOnKeyDownElement';

export const useOnKeyDownElement = (pluginKey: string) => {
  const options = useEditorPluginOptions(pluginKey);

  return getOnKeyDownElement({
    ...options,
    defaultType: useEditorPluginType(DEFAULT_ELEMENT),
  });
};

export const useOnKeyDownElements = (pluginKeys: string[]) => {
  const options = useEditorOptions();
  const defaultType = useEditorPluginType(DEFAULT_ELEMENT);

  const opt = pluginKeys.map((key) => {
    return {
      ...options[key],
      defaultType,
    };
  });

  return getOnKeyDownElement(opt);
};
