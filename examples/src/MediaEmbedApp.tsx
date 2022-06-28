import React from 'react';
import { OndemandVideo } from '@styled-icons/material/OndemandVideo';
import {
  createMediaEmbedPlugin,
  createPlateUI,
  createSelectOnBackspacePlugin,
  ELEMENT_MEDIA_EMBED,
  HeadingToolbar,
  MediaEmbedToolbarButton,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { mediaEmbedValue } from './media-embed/mediaEmbedValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createMediaEmbedPlugin(),
    createSelectOnBackspacePlugin({
      options: {
        query: {
          allow: [ELEMENT_MEDIA_EMBED],
        },
      },
    }),
  ],
  {
    components: createPlateUI(),
  }
);

export default () => (
  <>
    <HeadingToolbar>
      <MediaEmbedToolbarButton icon={<OndemandVideo />} />
    </HeadingToolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={mediaEmbedValue}
    />
  </>
);
