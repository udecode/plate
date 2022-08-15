import React from 'react';
import { Image } from '@styled-icons/material/Image';
import { OndemandVideo } from '@styled-icons/material/OndemandVideo';
import {
  createBasicElementsPlugin,
  createImagePlugin,
  createSelectOnBackspacePlugin,
  ELEMENT_IMAGE,
  ImageToolbarButton,
  MediaEmbedToolbarButton,
  Plate,
} from '@udecode/plate';
import { createPortivePlugin, PortiveImage } from '@udecode/plate-portive';
import { basicMarksPlugins } from './basic-marks/basicMarksPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { portiveValue } from './portive/portiveValue';
import { selectOnBackspacePlugin } from './select-on-backspace/selectOnBackspacePlugin';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    createBasicElementsPlugin(),
    ...basicMarksPlugins,
    createImagePlugin(),
    createPortivePlugin({
      authToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Imo0YlpVSGFQMmtlQmNyYTQifQ.eyJwYXRoIjoib24ve3l5eXl9L3ttbX0ve2RkfSIsImlhdCI6MTY2MDQ3OTY5NCwiZXhwIjoxNjkyMDM3Mjk0fQ.s03TfyuckZx-IfooKQDh8I9h4KwVth3lB7qiLbEzg6w',
    })(),
    createSelectOnBackspacePlugin(selectOnBackspacePlugin),
  ],
  {
    components: { ...plateUI, [ELEMENT_IMAGE]: PortiveImage },
  }
);

export default () => (
  <>
    <Toolbar>
      <ImageToolbarButton icon={<Image />} />
      <MediaEmbedToolbarButton icon={<OndemandVideo />} />
    </Toolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={portiveValue}
    />
  </>
);
