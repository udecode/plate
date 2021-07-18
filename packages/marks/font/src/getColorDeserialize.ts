import { getNodeDeserializer } from '@udecode/slate-plugins-common';
import {
  Deserialize,
  getSlatePluginOptions,
} from '@udecode/slate-plugins-core';
import { MARK_BG_COLOR, MARK_COLOR } from './defaults';

export const getFontColorDeserialize = (): Deserialize => (editor) => {
  const options = getSlatePluginOptions(editor, MARK_COLOR);

  return {
    leaf: getNodeDeserializer({
      type: options.type,
      getNode: (element) => ({ [options.type]: element.style.color }),
      rules: [
        {
          style: {
            color: '*',
          },
        },
      ],
      ...options.deserialize,
    }),
  };
};

export const getFontBackgroundColorDeserialize = (): Deserialize => (
  editor
) => {
  const options = getSlatePluginOptions(editor, MARK_BG_COLOR);

  return {
    leaf: getNodeDeserializer({
      type: options.type,
      getNode: (element) => ({ [options.type]: element.style.backgroundColor }),
      rules: [
        {
          style: {
            backgroundColor: '*',
          },
        },
      ],
      ...options.deserialize,
    }),
  };
};
