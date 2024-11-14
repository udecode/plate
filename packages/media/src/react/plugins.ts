import { toPlatePlugin } from '@udecode/plate-common/react';

import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseVideoPlugin,
} from '../lib';

export const ImagePlugin = toPlatePlugin(BaseImagePlugin);

export const AudioPlugin = toPlatePlugin(BaseAudioPlugin);

export const FilePlugin = toPlatePlugin(BaseFilePlugin);

export const VideoPlugin = toPlatePlugin(BaseVideoPlugin);
