'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  insertNodes,
  removeNodes,
  withoutSavingHistory,
} from '@udecode/plate-common';
import {
  findNodePath,
  useEditorPlugin,
  useEditorRef,
} from '@udecode/plate-common/react';
import { setMediaNode } from '@udecode/plate-media';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  PlaceholderPlugin,
  UploadErrorCode,
  VideoPlugin,
  updateUploadHistory,
  usePlaceholderPopoverState,
} from '@udecode/plate-media/react';
import { toast } from 'sonner';
import { useFilePicker } from 'use-file-picker';

import { useUploadFile } from '../lib/uploadthing';
import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const MEDIA_CONFIG: Record<
  string,
  {
    accept: string[];
    buttonText: string;
    embedText: string;
  }
> = {
  [AudioPlugin.key]: {
    accept: ['audio/*'],
    buttonText: 'Upload Audio',
    embedText: 'Embed audio',
  },
  [FilePlugin.key]: {
    accept: ['*'],
    buttonText: 'Choose a file',
    embedText: 'Embed file',
  },
  [ImagePlugin.key]: {
    accept: ['image/*'],
    buttonText: 'Upload file',
    embedText: 'Embed image',
  },
  [VideoPlugin.key]: {
    accept: ['video/*'],
    buttonText: 'Upload video',
    embedText: 'Embed video',
  },
};

export interface MediaPopoverProps {
  children: React.ReactNode;
}

export const MediaPlaceholderPopover = ({ children }: MediaPopoverProps) => {
  const editor = useEditorRef();

  const {
    id,
    element,
    mediaType,
    readOnly,
    selected,
    setIsUploading,
    setProgresses,
    setUpdatedFiles,
    size,
  } = usePlaceholderPopoverState();
  const [open, setOpen] = useState(false);

  const currentMedia = MEDIA_CONFIG[mediaType];

  const { api, getOption } = useEditorPlugin(PlaceholderPlugin);

  // const mediaConfig = api.placeholder.getMediaConfig(mediaType as MediaKeys);
  const multiple = getOption('multiple') ?? true;

  const { isUploading, progresses, uploadFiles, uploadedFiles } = useUploadFile(
    'imageUploader',
    {
      defaultUploadedFiles: [],
    }
  );

  const replaceCurrentPlaceholder = useCallback(
    (file: File) => {
      setUpdatedFiles([file]);
      void uploadFiles([file]);
      api.placeholder.addUploadingFile(element.id as string, file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [element.id]
  );

  /** Open file picker */
  const { openFilePicker } = useFilePicker({
    accept: currentMedia.accept,
    multiple,
    onFilesSelected: ({ plainFiles: updatedFiles }) => {
      const firstFile = updatedFiles[0];
      const restFiles = updatedFiles.slice(1);

      replaceCurrentPlaceholder(firstFile);

      restFiles.length > 0 && (editor as any).tf.insert.media(restFiles);
    },
  });

  // React dev mode will call useEffect twice
  const isReplaced = useRef(false);
  /** Paste and drop */
  useEffect(() => {
    if (isReplaced.current) return;

    isReplaced.current = true;
    const currentFiles = api.placeholder.getUploadingFile(element.id as string);

    if (!currentFiles) return;

    replaceCurrentPlaceholder(currentFiles);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReplaced]);

  useEffect(() => {
    const uploaded = uploadedFiles.length;

    if (!uploaded) return;

    const fileInfo = uploadedFiles[0];

    const path = findNodePath(editor, element);

    // replaceNode<TImageElement>(editor, {
    //   at: path!,
    //   nodes: [
    //     {
    //       children: [],
    //       initialHeight: size!.height,
    //       initialWidth: size!.width,
    //       isUpload: true,
    //       name: mediaType === FilePlugin.key ? fileInfo.name : '',
    //       placeholderId: element.id as string,
    //       type: mediaType!,
    //       url: fileInfo.url,
    //     },
    //   ],
    // });

    withoutSavingHistory(editor, () => {
      removeNodes(editor, { at: path });

      const node = {
        children: [{ text: '' }],
        initialHeight: size?.height,
        initialWidth: size?.width,
        isUpload: true,
        name: mediaType === FilePlugin.key ? fileInfo.name : '',
        placeholderId: element.id as string,
        type: mediaType!,
        url: fileInfo.url,
      };

      insertNodes(editor, node, { at: path });

      updateUploadHistory(editor, node);
    });

    // setMediaNode(
    //   editor,
    //   {
    //     id: nanoid(),
    //     initialHeight: size?.height,
    //     initialWidth: size?.width,
    //     isUpload: true,
    //     name: mediaType === FilePlugin.key ? fileInfo.name : '',
    //     placeholderId: element.id as string,
    //     type: mediaType!,
    //     url: fileInfo.url,
    //   },
    //   { at: path }
    // );

    api.placeholder.removeUploadingFile(element.id as string);

    // mergeMarkedBatch(editor, PlaceholderPlugin.key);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFiles, element.id, size]);

  const [embedValue, setEmbedValue] = useState('');

  const onEmbed = useCallback(
    (value: string) => {
      setMediaNode(editor, {
        type: mediaType,
        url: value,
      });
    },
    [editor, mediaType]
  );

  useEffect(() => {
    setOpen(selected);
  }, [selected, setOpen]);

  useEffect(() => {
    if (isUploading) {
      setOpen(false);
    }
  }, [isUploading]);

  useEffect(() => {
    setProgresses(progresses);
    setIsUploading(isUploading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, progresses, isUploading]);

  if (readOnly) return <>{children}</>;

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent
        className="flex flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Tabs className="w-full shrink-0" defaultValue="account">
          <TabsList className="px-2" onMouseDown={(e) => e.preventDefault()}>
            <TabsTrigger value="account">Upload</TabsTrigger>
            <TabsTrigger value="password">Embed link</TabsTrigger>
          </TabsList>
          <TabsContent className="w-[300px] px-3 py-2" value="account">
            <Button className="w-full" onClick={openFilePicker}>
              {currentMedia.buttonText}
            </Button>
            <div className="mt-3 text-xs text-muted-foreground">
              The maximum size per file is 5MB
            </div>
          </TabsContent>

          <TabsContent
            className="w-[300px] px-3 pb-3 pt-2 text-center"
            value="password"
          >
            <Input
              value={embedValue}
              onChange={(e) => setEmbedValue(e.target.value)}
              placeholder="Paste the link..."
            />

            <Button
              className="mt-2 w-full max-w-[300px]"
              onClick={() => onEmbed(embedValue)}
            >
              {currentMedia.embedText}
            </Button>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export const useUploadErrorToast = () => {
  const editor = useEditorRef();

  const uploadError = editor.useOption(PlaceholderPlugin, 'error');

  useEffect(() => {
    if (!uploadError) return;

    const { code, data } = uploadError;

    switch (code) {
      case UploadErrorCode.INVALID_FILE_SIZE: {
        toast.error(
          `The size of files ${data.files
            .map((f) => f.name)
            .join(', ')} is invalid`
        );

        break;
      }
      case UploadErrorCode.INVALID_FILE_TYPE: {
        toast.error(
          `The type of files ${data.files
            .map((f) => f.name)
            .join(', ')} is invalid`
        );

        break;
      }
      case UploadErrorCode.TOO_LARGE: {
        toast.error(
          `The size of files ${data.files
            .map((f) => f.name)
            .join(', ')} is too large than ${data.maxFileSize}`
        );

        break;
      }
      case UploadErrorCode.TOO_LESS_FILES: {
        toast.error(
          `The mini um number of files is ${data.minFileCount} for ${data.fileType}`
        );

        break;
      }
      case UploadErrorCode.TOO_MANY_FILES: {
        toast.error(
          `The maximum number of files is ${data.maxFileCount} ${
            data.fileType ? `for ${data.fileType}` : ''
          }`
        );

        break;
      }
    }
  }, [uploadError]);
};
