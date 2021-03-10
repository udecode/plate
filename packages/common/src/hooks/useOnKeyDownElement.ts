import {
  useEditorMultiOptions,
  useEditorOptions,
  useEditorType,
} from '@udecode/slate-plugins-core';
import { DEFAULT_ELEMENT } from '../types/node.types';
import { getOnKeyDownElement } from '../utils/getOnKeyDownElement';

export const useOnKeyDownElement = (pluginKey: string) => {
  const options = useEditorOptions(pluginKey);

  return getOnKeyDownElement({
    ...options,
    defaultType: useEditorType(DEFAULT_ELEMENT),
  });
};

export const useOnKeyDownElements = (pluginKeys: string[]) => {
  const optionsByKey = useEditorMultiOptions(pluginKeys);
  const defaultType = useEditorType(DEFAULT_ELEMENT);

  const opt = Object.values(optionsByKey).map((options) => {
    return {
      ...options,
      defaultType,
    };
  });

  return getOnKeyDownElement(opt);
};
