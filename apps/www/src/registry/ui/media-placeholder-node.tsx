'use client';

import * as React from 'react';

import { PLUGINS } from 'platejs';
import type { PlateElementProps } from 'platejs/react';

import { PlaceholderPlugin, PlaceholderProvider } from '@platejs/media/react';
import { AudioLines, FileUp, Film, ImageIcon, Loader2Icon } from 'lucide-react';

import {
  PlateElement,
  useEditor,
  useEditorPlugin,
  usePath,
  usePluginStore,
  withHOC,
} from 'platejs/react';
import { useFilePicker } from 'use-file-picker';

import { cn } from '@/lib/utils';
import { useUploadFile } from '@/registry/hooks/use-upload-file';

const CONTENT: Record<
  string,
  {
    accept: string[];
    content: React.ReactNode;
    icon: React.ReactNode;
  }
> = {
  [PLUGINS.audio]: {
    accept: ['audio/*'],
    content: 'Add an audio file',
    icon: <AudioLines />,
  },
  [PLUGINS.file]: {
    accept: ['*'],
    content: 'Add a file',
    icon: <FileUp />,
  },
  [PLUGINS.image]: {
    accept: ['image/*'],
    content: 'Add an image',
    icon: <ImageIcon />,
  },
  [PLUGINS.video]: {
    accept: ['video/*'],
    content: 'Add a video',
    icon: <Film />,
  },
};

export const PlaceholderElement = withHOC(
  PlaceholderProvider,
  function PlaceholderElement(
    props: PlateElementProps<typeof PlaceholderPlugin>
  ) {
    const { element } = props;
    const path = usePath();

    const editor = useEditor();
    const nodeKey = editor.key(element);
    const { api, update } = useEditorPlugin(PlaceholderPlugin);
    const currentFile = usePluginStore(
      PlaceholderPlugin,
      'uploadingFile',
      nodeKey
    );

    const { isUploading, progress, uploadedFile, uploadFile, uploadingFile } =
      useUploadFile();

    const loading = isUploading && uploadingFile;

    const mediaPlugin = [
      PLUGINS.audio,
      PLUGINS.file,
      PLUGINS.image,
      PLUGINS.video,
    ].find((plugin) => {
      const media = editor.plugin(plugin);

      return media.installed && media.name === element.mediaType;
    });
    const currentContent = mediaPlugin ? CONTENT[mediaPlugin] : undefined;

    const isImage = mediaPlugin === PLUGINS.image;

    const imageRef = React.useRef<HTMLImageElement>(null);
    const isReplaced = React.useRef(false);

    const replaceCurrentPlaceholder = React.useCallback(
      (file: File) => {
        void uploadFile(file);
        api.addUploadingFile(nodeKey, file);
      },
      [api, nodeKey, uploadFile]
    );

    const { openFilePicker } = useFilePicker({
      accept: currentContent?.accept ?? [],
      multiple: true,
      onFilesSelected: ({ plainFiles: updatedFiles }) => {
        const firstFile = updatedFiles[0];
        const restFiles = updatedFiles.slice(1);

        isReplaced.current = true;
        replaceCurrentPlaceholder(firstFile);

        if (restFiles.length > 0) {
          update.insertMedia(restFiles);
        }
      },
    });

    React.useEffect(() => {
      if (!mediaPlugin || !uploadedFile) return;

      if (!path) return;

      update({ history: 'skip' }).replaceMedia(
        {
          initialHeight: imageRef.current?.height,
          initialWidth: imageRef.current?.width,
          isUpload: true,
          name: mediaPlugin === PLUGINS.file ? uploadedFile.name : '',
          plugin: mediaPlugin,
          url: uploadedFile.url,
        },
        { at: path }
      );

      api.removeUploadingFile(nodeKey);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadedFile, nodeKey, path]);

    /** Paste and drop */
    React.useEffect(() => {
      if (!mediaPlugin || isReplaced.current || !currentFile) return;

      isReplaced.current = true;
      replaceCurrentPlaceholder(currentFile);
    }, [currentFile, mediaPlugin, replaceCurrentPlaceholder]);

    if (!currentContent) return null;

    return (
      <PlateElement className="my-1" {...props}>
        {(!loading || !isImage) && (
          <div
            className={cn(
              'flex cursor-pointer select-none items-center rounded-sm bg-muted p-3 pr-9 hover:bg-primary/10'
            )}
            onClick={() => !loading && openFilePicker()}
            contentEditable={false}
          >
            <div className="relative mr-3 flex text-muted-foreground/80 [&_svg]:size-6">
              {currentContent.icon}
            </div>
            <div className="whitespace-nowrap text-muted-foreground text-sm">
              <div>
                {loading ? uploadingFile?.name : currentContent.content}
              </div>

              {loading && !isImage && (
                <div className="mt-1 flex items-center gap-1.5">
                  <div>{formatBytes(uploadingFile?.size ?? 0)}</div>
                  <div>–</div>
                  <div className="flex items-center">
                    <Loader2Icon className="mr-1 size-3.5 animate-spin text-muted-foreground" />
                    {progress ?? 0}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isImage && loading && (
          <ImageProgress
            file={uploadingFile}
            imageRef={imageRef}
            progress={progress}
          />
        )}

        {props.children}
      </PlateElement>
    );
  }
);

export function ImageProgress({
  className,
  file,
  imageRef,
  progress = 0,
}: {
  file: File;
  className?: string;
  imageRef?: React.RefObject<HTMLImageElement | null>;
  progress?: number;
}) {
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Store the object URL tied to this File and revoke it on cleanup.
    setObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!objectUrl) {
    return null;
  }

  return (
    <div className={cn('relative', className)} contentEditable={false}>
      <img
        ref={imageRef}
        className="h-auto w-full rounded-sm object-cover"
        alt={file.name}
        src={objectUrl}
      />
      {progress < 100 && (
        <div className="absolute right-1 bottom-1 flex items-center space-x-2 rounded-full bg-black/50 px-1 py-0.5">
          <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />
          <span className="font-medium text-white text-xs">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}

function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];

  if (bytes === 0) return '0 Byte';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / 1024 ** i).toFixed(decimals)} ${
    sizeType === 'accurate'
      ? (accurateSizes[i] ?? 'Bytest')
      : (sizes[i] ?? 'Bytes')
  }`;
}
