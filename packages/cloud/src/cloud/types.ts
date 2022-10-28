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

export type GenericFileEvent = {
  id: string;
  type: 'generic';
  file: File;
};

export type ImageFileEvent = {
  id: string;
  type: 'image';
  file: File;
  width: number;
  height: number;
};

export type FileEvent = GenericFileEvent | ImageFileEvent;

export type ProgressEvent = {
  sentBytes: number;
  totalBytes: number;
};

export type ErrorEvent = {
  message: string;
};

export type SuccessEvent = {
  url: string;
};
