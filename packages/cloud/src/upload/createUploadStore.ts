import { createStore } from '@udecode/plate-common';
import { Upload } from './types';

/**
 * Creates an origin store using `zustood`.
 *
 * The purpose of this is to keep track of uploads and their progress but only
 * storing the key to the lookup in the Element itself. We do it this way
 * because we don't want to modify the Editor value during the upload or it
 * becomes part of the edit history.
 */
export const createUploadStore = (
  {
    uploads: initialUploads = {},
  }: {
    uploads: Record<string, Upload>;
  } = { uploads: {} }
) => {
  return createStore('upload')({ uploads: initialUploads })
    .extendActions((set, get) => ({
      upload: (id: string, upload: Upload): void => {
        const uploads = get.uploads();
        set.uploads({ ...uploads, [id]: upload });
      },
    }))
    .extendSelectors((state, get) => ({
      upload: (id: string): Upload | undefined => {
        const uploads = get.uploads();
        return uploads[id];
      },
    }));
};
