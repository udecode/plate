import * as React from 'react';

import type { OurFileRouter } from '@/app/api/uploadthing/core';
import type {
  ClientUploadedFileData,
  UploadFilesOptions,
} from 'uploadthing/types';

import { toast } from 'sonner';

import { getErrorMessage } from './handle-error';
import { uploadFiles } from './uploadthing';

export interface UploadedFile<T = unknown> extends ClientUploadedFileData<T> {}

interface UseUploadFileProps
  extends Pick<
    UploadFilesOptions<OurFileRouter, keyof OurFileRouter>,
    'headers' | 'onUploadBegin' | 'onUploadProgress' | 'skipPolling'
  > {
  defaultUploadedFiles?: UploadedFile[];
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: unknown) => void;
}

export function useUploadFile(
  endpoint: keyof OurFileRouter,
  {
    defaultUploadedFiles = [],
    onUploadComplete,
    onUploadError,
    ...props
  }: UseUploadFileProps = {}
) {
  const [uploadedFiles, setUploadedFiles] =
    React.useState<UploadedFile[]>(defaultUploadedFiles);
  const [progresses, setProgresses] = React.useState<Record<string, number>>(
    {}
  );
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadThings(files: File[]) {
    setIsUploading(true);

    try {
      const res = await uploadFiles(endpoint, {
        ...props,
        files,
        onUploadProgress: ({ file, progress }) => {
          setProgresses((prev) => {
            return {
              ...prev,
              [file.name]: Math.min(progress, 100),
            };
          });
        },
      });

      setUploadedFiles((prev) => (prev ? [...prev, ...res] : res));

      onUploadComplete?.(res);

      return uploadedFiles;
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      const message =
        errorMessage.length > 0
          ? errorMessage
          : 'Something went wrong, please try again later.';

      toast.error(message);
      onUploadError?.(error);
    } finally {
      setProgresses({});
      setIsUploading(false);
    }
  }

  return {
    isUploading,
    progresses,
    uploadFiles: uploadThings,
    uploadedFiles,
  };
}
