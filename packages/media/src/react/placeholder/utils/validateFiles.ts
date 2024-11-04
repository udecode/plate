/* eslint-disable @typescript-eslint/only-throw-error */
import type { uploadConfig } from '../PlaceholderPlugin';
import type { AllowedFileType } from '../internal/mimes';

import { UploadErrorCode } from '../type';
import { createUploadError } from './createUploadError';
import { groupFilesByType } from './groupFilesByType';
import { validateFileItem } from './validateFileItem';

export const validateFiles = (fileList: FileList, config: uploadConfig) => {
  const fileTypeMap = groupFilesByType(fileList, config);

  const keys = Object.keys(fileTypeMap) as AllowedFileType[];

  for (const key of keys) {
    const itemConfig = config[key];

    if (!itemConfig)
      throw createUploadError(UploadErrorCode.InvalidConfigKey, {
        invalidateFiles: Array.from(fileList),
      });

    const itemFiles = fileTypeMap[key];

    if (itemFiles.length === 0) continue;

    validateFileItem(itemFiles, itemConfig);
  }
};
