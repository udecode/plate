import type { UploadConfig } from '../PlaceholderPlugin';
import type { AllowedFileType, FileRouterInputKey } from '../internal/mimes';
import type { MediaItemConfig, MediaKeys } from '../type';

import { matchFileType } from './matchFileType';

export const getMediaType = (file: File, config: UploadConfig): MediaKeys => {
  const type = matchFileType(
    file,
    Object.keys(config) as FileRouterInputKey[]
  ) as AllowedFileType;

  return (config[type] as MediaItemConfig).mediaType;
};
