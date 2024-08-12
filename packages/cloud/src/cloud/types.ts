import type * as portiveClient from '@portive/client';
import type { Value } from '@udecode/plate-common';

import type { Upload } from '../upload';
import type { createUploadStore } from '../upload/createUploadStore';

/** Specifies just the `options` part of the CloudPlugin */
export type CloudPluginOptions = {
  uploadStoreInitialValue?: Record<string, Upload>;
} & portiveClient.ClientOptions;

export type CloudPluginApi = {
  cloud: {
    client: portiveClient.Client;
    finishUploads: (options?: FinishUploadsOptions) => Promise<void>;
    getSaveValue: () => Value;
    uploadFiles: (msg: any) => void;
    uploadStore: ReturnType<typeof createUploadStore>;
    // save: (options: { maxTimeoutInMs?: number }) => Promise<V>;
  };
};

export type FinishUploadsOptions = { maxTimeoutInMs?: number };

/**
 * The part of the FileEvent shared between the GenericFileEvent and the
 * ImageFileEvent.
 */
export type FileEventBase = {
  file: File;
  id: string;
  url: string;
};

/** FileEvent for files that are not images */
export type GenericFileEvent = {
  type: 'generic';
} & FileEventBase;

/** FileEvent for files that are images */
export type ImageFileEvent = {
  height: number;
  type: 'image';
  width: number;
} & FileEventBase;

/** FileEvent for any type of file (generic or image) */
export type FileEvent = GenericFileEvent | ImageFileEvent;

/** Indicates upload in progress */
export type ProgressEvent = {
  sentBytes: number;
  totalBytes: number;
};

/** Indicates an error during upload */
export type ErrorEvent = {
  message: string;
};

/** Indicates a successful upload */
export type SuccessEvent = {
  url: string;
};
