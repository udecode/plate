/** Indicates an `Upload` that is uploading and the state of the Upload */
export type UploadProgress = {
  finishPromise: Promise<UploadError | UploadSuccess>;
  sentBytes: number;
  status: 'progress';
  totalBytes: number;
  url: string;
};

/** Indicates an `Upload` that has completed uploading */
export type UploadSuccess = {
  status: 'success';
  url: string;
};

/**
 * Indicates an `Upload` that has an error during uploading and the Error
 * message
 */
export type UploadError = {
  message: string;
  status: 'error';
  url: string;
};

/** Indicated the `Upload` could not be found. */
export type UploadStateNotFound = {
  status: 'not-found';
  // no url here
};

export type Upload =
  | UploadError
  | UploadProgress
  | UploadStateNotFound
  | UploadSuccess;

/**
 * `UploadState`
 *
 * Types related to the `zustand` state-management library which we use to store
 * the state of uploads.
 */

export type GetUpload = (id: string) => Upload;

export type SetUpload = (id: string, upload: Upload) => void;

export type UploadState = {
  getUpload: GetUpload;
  setUpload: SetUpload;
  uploads: Record<string, Upload>;
};
