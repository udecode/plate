import {
  getSlatePluginOptions,
  getSlatePluginType,
  OnKeyDown,
} from '@udecode/slate-plugins-core';
import { castArray } from 'lodash';
import { ELEMENT_DEFAULT } from '../types/node.types';
import { getOnKeyDownElement } from '../utils/getOnKeyDownElement';

export const useOnKeyDownElement = (
  pluginKey: string | string[]
): OnKeyDown => (editor) => (e) => {
  const pluginKeys = castArray<string>(pluginKey);
  const defaultType = getSlatePluginType(editor, ELEMENT_DEFAULT);

  const opt = pluginKeys.map((key) => {
    return {
      ...getSlatePluginOptions(editor, key),
      defaultType,
    };
  });

  return getOnKeyDownElement(opt)(editor)(e);
};
