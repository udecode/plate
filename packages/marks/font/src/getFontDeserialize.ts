import { getNodeDeserializer } from '@udecode/plate-common';
import { Deserialize } from '@udecode/plate-core';

export const getFontColorDeserialize = (): Deserialize => (
  editor,
  { type }
) => {
  return {
    leaf: getNodeDeserializer({
      type,
      getNode: (element) => ({ [type!]: element.style.color }),
      rules: [
        {
          style: {
            color: '*',
          },
        },
      ],
    }),
  };
};

export const getFontBackgroundColorDeserialize = (): Deserialize => (
  editor,
  { type }
) => {
  return {
    leaf: getNodeDeserializer({
      type,
      getNode: (element) => ({ [type!]: element.style.backgroundColor }),
      rules: [
        {
          style: {
            backgroundColor: '*',
          },
        },
      ],
    }),
  };
};

export const getFontSizeDeserialize = (): Deserialize => (editor, { type }) => {
  return {
    leaf: getNodeDeserializer({
      type,
      getNode: (element) => ({ [type!]: element.style.fontSize }),
      rules: [
        {
          style: {
            fontSize: '*',
          },
        },
      ],
    }),
  };
};

export const getFontWeightDeserialize = (): Deserialize => (
  editor,
  { type }
) => {
  return {
    leaf: getNodeDeserializer({
      type,
      getNode: (element) => ({ [type!]: element.style.fontWeight }),
      rules: [
        {
          style: {
            fontWeight: '*',
          },
        },
      ],
    }),
  };
};

export const getFontFamilyDeserialize = (): Deserialize => (
  editor,
  { type }
) => {
  return {
    leaf: getNodeDeserializer({
      type,
      getNode: (element) => ({ [type!]: element.style.fontFamily }),
      rules: [
        {
          style: {
            fontFamily: '*',
          },
        },
      ],
    }),
  };
};
