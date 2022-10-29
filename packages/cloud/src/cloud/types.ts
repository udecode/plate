import { Client, ClientOptions } from '@portive/client';
import { PlateEditor, Value } from '@udecode/plate-core';
import { ReactEditor } from 'slate-react';
import { Upload } from '../upload';
import { createUploadStore } from '../upload/createUploadStore';

/**
 * Specifies just the `options` part of the CloudPlugin
 */
export type CloudPlugin = ClientOptions & {
  uploadStoreInitialValue?: Record<string, Upload>;
};

export type CloudEditor<V extends Value = Value> = PlateEditor<V> &
  ReactEditor &
  CloudEditorProps;

export type CloudEditorProps = {
  cloud: {
    client: Client;
    uploadFiles: (msg: any) => void;
    useUploadStore: ReturnType<typeof createUploadStore>;
    genericFileHandlers?: {
      onStart?: (e: FileEvent) => void;
      onProgress?: (e: FileEvent & ProgressEvent) => void;
      onError?: (e: FileEvent & ErrorEvent) => void;
      onSuccess?: (e: FileEvent & SuccessEvent) => void;
    };
    imageFileHandlers?: {
      onStart?: (e: ImageFileEvent) => void;
      onProgress?: (e: ImageFileEvent & ProgressEvent) => void;
      onError?: (e: ImageFileEvent & ErrorEvent) => void;
      onSuccess?: (e: ImageFileEvent & SuccessEvent) => void;
    };
  };
};

/**
 * The part of the FileEvent shared between the GenericFileEvent and the
 * ImageFileEvent.
 */
export type FileEventBase = {
  id: string;
  file: File;
  url: string;
};

/**
 * FileEvent for files that are not images
 */
export type GenericFileEvent = {
  type: 'generic';
} & FileEventBase;

/**
 * FileEvent for files that are images
 */
export type ImageFileEvent = {
  type: 'image';
  width: number;
  height: number;
} & FileEventBase;

/**
 * FileEvent for any type of file (generic or image)
 */
export type FileEvent = GenericFileEvent | ImageFileEvent;

/**
 * Indicates upload in progress
 */
export type ProgressEvent = {
  sentBytes: number;
  totalBytes: number;
};

/**
 * Indicates an error during upload
 */
export type ErrorEvent = {
  message: string;
};

/**
 * Indicates a successful upload
 */
export type SuccessEvent = {
  url: string;
};
