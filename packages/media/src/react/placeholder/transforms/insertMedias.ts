import type { PlateEditor } from '@udecode/plate-common/react';

import { insertNodes, nanoid, withoutNormalizing } from '@udecode/plate-common';

import { type TPlaceholderElement, BasePlaceholderPlugin } from '../../../lib';
import { PlaceholderPlugin } from '../PlaceholderPlugin';
import { getMediaTypeByFileName, validateFiles } from '../utils/validateFiles';

export const insertMedias = (editor: PlateEditor, files: FileList): any => {
  const api = editor.getApi(PlaceholderPlugin);
  const mediaConfig = editor.getOption(PlaceholderPlugin, 'mediaConfig');
  const multiple = editor.getOption(PlaceholderPlugin, 'multiple');

  const validationResult = validateFiles(files, mediaConfig);

  if (!validationResult.isValid && validationResult.errorMessage) {
    return editor.setOption(
      PlaceholderPlugin,
      'uploadErrorMessage',
      validationResult.errorMessage
    );
  }
  if (!multiple && files.length > 1) {
    return editor.setOption(
      PlaceholderPlugin,
      'uploadErrorMessage',
      'Can not upload multiple files'
    );
  }

  const maxFileCount =
    editor.getOption(PlaceholderPlugin, 'uploadMaxFileCount') ?? 3;

  if (files.length > maxFileCount) {
    return editor.setOption(
      PlaceholderPlugin,
      'uploadErrorMessage',
      `Can not upload more than ${maxFileCount} files`
    );
  }

  Array.from(files).forEach((file) => {
    const id = nanoid();

    withoutNormalizing(editor, () =>
      insertNodes<TPlaceholderElement>(editor, {
        id,
        children: [{ text: '' }],
        mediaType: getMediaTypeByFileName(file.name, mediaConfig)!,
        type: editor.getType(BasePlaceholderPlugin),
      })
    );

    api.placeholder.addUploadingFile(id, file);
  });
};
