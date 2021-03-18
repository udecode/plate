import { getElementDeserializer } from '@udecode/slate-plugins-common';
import { DeserializeHtml, getOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { DEFAULT_HEADING_LEVEL } from './defaults';
import { HeadingPluginOptions } from './types';

export const useDeserializeHeading = ({
  levels = DEFAULT_HEADING_LEVEL,
}: HeadingPluginOptions = {}): DeserializeHtml => (editor: Editor) => {
  const { h1, h2, h3, h4, h5, h6 } = getOptions(editor);

  let deserializers = getElementDeserializer({
    type: h1.type,
    rules: [{ nodeNames: 'H1' }],
    ...h1.deserialize,
  });

  if (levels >= 2)
    deserializers = [
      ...deserializers,
      ...getElementDeserializer({
        type: h2.type,
        rules: [{ nodeNames: 'H2' }],
        ...h2.deserialize,
      }),
    ];
  if (levels >= 3)
    deserializers = [
      ...deserializers,
      ...getElementDeserializer({
        type: h3.type,
        rules: [{ nodeNames: 'H3' }],
        ...h3.deserialize,
      }),
    ];
  if (levels >= 4)
    deserializers = [
      ...deserializers,
      ...getElementDeserializer({
        type: h4.type,
        rules: [{ nodeNames: 'H4' }],
        ...h4.deserialize,
      }),
    ];
  if (levels >= 5)
    deserializers = [
      ...deserializers,
      ...getElementDeserializer({
        type: h5.type,
        rules: [{ nodeNames: 'H5' }],
        ...h5.deserialize,
      }),
    ];
  if (levels >= 6)
    deserializers = [
      ...deserializers,
      ...getElementDeserializer({
        type: h6.type,
        rules: [{ nodeNames: 'H6' }],
        ...h6.deserialize,
      }),
    ];

  return {
    element: deserializers,
  };
};
