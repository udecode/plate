import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from '../../../features/media/lib';
import { toReactPlugin } from '../../core';

export const ImagePlugin = toReactPlugin(BaseImagePlugin);
export const MediaEmbedPlugin = toReactPlugin(BaseMediaEmbedPlugin);
export const AudioPlugin = toReactPlugin(BaseAudioPlugin);
export const FilePlugin = toReactPlugin(BaseFilePlugin);
export const VideoPlugin = toReactPlugin(BaseVideoPlugin);

/** Exact React media descriptors accepted by shared media controls. */
export type MediaPlugin =
  | typeof AudioPlugin
  | typeof FilePlugin
  | typeof ImagePlugin
  | typeof MediaEmbedPlugin
  | typeof VideoPlugin;
