import React from 'react';
import {
  createImagePlugin,
  createMediaEmbedPlugin,
  createSelectOnBackspacePlugin,
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  ImageToolbarButton,
  MediaEmbedToolbarButton,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { Icons } from './common/icons';
import { plateUI } from './common/plateUI';
import { mediaValue } from './media/mediaValue';
import { Toolbar } from './toolbar/Toolbar';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createImagePlugin(),
    createMediaEmbedPlugin(),
    createSelectOnBackspacePlugin({
      options: {
        query: {
          allow: [ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED],
        },
      },
    }),
  ],
  {
    components: plateUI,
  }
);

export default function MediaApp() {
  return (
    <PlateProvider<MyValue> plugins={plugins} initialValue={mediaValue}>
      <Toolbar>
        <ImageToolbarButton icon={<Icons.image />} />
        <MediaEmbedToolbarButton icon={<Icons.embed />} />
      </Toolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
