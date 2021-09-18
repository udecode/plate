import { getNodeDeserializer } from '@udecode/plate-common';
import { Deserialize, getPlatePluginOptions } from '@udecode/plate-core';
import { MARK_BG_COLOR, MARK_COLOR, MARK_FONT_SIZE } from './defaults';

export const getFontColorDeserialize = (): Deserialize => (editor) => {
  const options = getPlatePluginOptions(editor, MARK_COLOR);

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
  const options = getPlatePluginOptions(editor, MARK_BG_COLOR);

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

export const getFontSizeDeserialize = (): Deserialize => (editor) => {
  const options = getPlatePluginOptions(editor, MARK_FONT_SIZE);

  return {
    leaf: getNodeDeserializer({
      type: options.type,
      getNode: (element) => ({ [options.type]: element.style.fontSize }),
      rules: [
        {
          style: {
            fontSize: '*',
          },
        },
      ],
      ...options.deserialize,
    }),
  };
};
