import {
  getPluginOptions,
  getPluginType,
  OnKeyDown,
} from '@udecode/slate-plugins-core';
import { castArray } from 'lodash';
import { ELEMENT_DEFAULT } from '../types/node.types';
import { getOnKeyDownElement } from '../utils/getOnKeyDownElement';

export const useOnKeyDownElement = (
  pluginKey: string | string[]
): OnKeyDown => (editor) => (e) => {
  const pluginKeys = castArray<string>(pluginKey);
  const defaultType = getPluginType(editor, ELEMENT_DEFAULT);

  const opt = pluginKeys.map((key) => {
    return {
      ...getPluginOptions(editor, key),
      defaultType,
    };
  });

  return getOnKeyDownElement(opt)(editor)(e);
};
