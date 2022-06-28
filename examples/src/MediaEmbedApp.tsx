import React from 'react';
import { OndemandVideo } from '@styled-icons/material/OndemandVideo';
import {
  createMediaEmbedPlugin,
  createSelectOnBackspacePlugin,
  ELEMENT_MEDIA_EMBED,
  MediaEmbedToolbarButton,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { mediaEmbedValue } from './media-embed/mediaEmbedValue';
import { Toolbar } from './toolbar/Toolbar';
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
    components: plateUI,
  }
);

export default () => (
  <>
    <Toolbar>
      <MediaEmbedToolbarButton icon={<OndemandVideo />} />
    </Toolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={mediaEmbedValue}
    />
  </>
);
