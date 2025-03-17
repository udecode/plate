import type { AllowedFileType } from '../internal/mimes';
import type { UploadConfig } from '../PlaceholderPlugin';

import { groupFilesByType } from './groupFilesByType';
import { validateFileItem } from './validateFileItem';

export const validateFiles = (fileList: FileList, config: UploadConfig) => {
  const fileTypeMap = groupFilesByType(fileList, config);

  const keys = Object.keys(fileTypeMap) as AllowedFileType[];

  for (const key of keys) {
    const itemConfig = config[key];

    const itemFiles = fileTypeMap[key];

    if (itemFiles.length === 0) continue;

    validateFileItem(itemFiles, itemConfig!, key);
  }
};
