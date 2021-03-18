import {
  getPluginOptions,
  getPluginType,
  OnKeyDown,
} from '@udecode/slate-plugins-core';
import { castArray } from 'lodash';
import { DEFAULT_ELEMENT } from '../types/node.types';
import { getOnKeyDownElement } from './getOnKeyDownElement';

export const getPluginOnKeyDownElement = (
  pluginKey: string | string[]
): OnKeyDown => (editor) => (e) => {
  const pluginKeys = castArray<string>(pluginKey);
  const defaultType = getPluginType(editor, DEFAULT_ELEMENT);

  const opt = pluginKeys.map((key) => {
    return {
      ...getPluginOptions(editor, key),
      defaultType,
    };
  });

  return getOnKeyDownElement(opt)(editor)(e);
};
