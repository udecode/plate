/**
 * Indicates an `Upload` that is uploading and the state of the Upload
 */
export type UploadProgress = {
  status: 'progress';
  url: string;
  sentBytes: number;
  totalBytes: number;
  finishPromise: Promise<UploadSuccess | UploadError>;
};

/**
 * Indicates an `Upload` that has completed uploading
 */
export type UploadSuccess = {
  status: 'success';
  url: string;
};

/**
 * Indicates an `Upload` that has an error during uploading and the Error
 * message
 */
export type UploadError = {
  status: 'error';
  url: string;
  message: string;
};

/**
 * Indicated the `Upload` could not be found.
 */
export type UploadStateNotFound = {
  status: 'not-found';
  // no url here
};

export type Upload =
  | UploadProgress
  | UploadError
  | UploadSuccess
  | UploadStateNotFound;

/**
 * `UploadState`
 *
 * Types related to the `zustand` state-management library which we use to
 * store the state of uploads.
 */

export type GetUpload = (id: string) => Upload;
export type SetUpload = (id: string, upload: Upload) => void;

export type UploadState = {
  uploads: Record<string, Upload>;
  getUpload: GetUpload;
  setUpload: SetUpload;
};
