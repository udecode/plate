import { createStore } from '@udecode/plate-core';
import create from 'zustand';
import { Upload, UploadState } from './types';

/**
 * Creates an origin store using `zustand`.
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
  return createStore('uploads')({ uploads: initialUploads })
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

  // return create<UploadState>((set, get) => ({
  //   uploads,
  //   setUpload(id: string, origin: Upload): void {
  //     set((state: UploadState) => ({
  //       uploads: {
  //         ...state.uploads,
  //         [id]: origin,
  //       },
  //     }));
  //   },
  //   getUpload(id: string): Upload {
  //     const origin = get().uploads[id];
  //     if (origin === undefined) {
  //       throw new Error(
  //         `Expected upload with id "${id}" but could not find it`
  //       );
  //     }
  //     return origin;
  //   },
  // }));
};
