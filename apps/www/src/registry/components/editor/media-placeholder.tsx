'use client';

import { generateReactHelpers } from '@uploadthing/react';
import { AudioLines, FileUp, Film, ImageIcon, Loader2Icon } from 'lucide-react';
import { PLUGINS } from 'platejs';
import { PlaceholderPlugin } from 'platejs/media/react';
import {
  PlateElement,
  useEditor,
  useEditorPlugin,
  usePath,
  usePluginStore,
  type PlateElementProps,
} from 'platejs/react';
import * as React from 'react';
import { toast } from 'sonner';
import type { ClientUploadedFileData } from 'uploadthing/types';
import { useFilePicker } from 'use-file-picker';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { useObjectUrl } from '@/registry/hooks/use-object-url';
import type { OurFileRouter } from '@/registry/lib/uploadthing';

type UploadedFile = ClientUploadedFileData<unknown>;

const { uploadFiles } = generateReactHelpers<OurFileRouter>();

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

export function PlaceholderElement(
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
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const uploadFile = React.useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadingFile(file);

    try {
      const [result] = await uploadFiles('editorUploader', {
        files: [file],
        onUploadProgress: ({ progress: innerProgress }) => {
          setProgress(Math.min(innerProgress, 100));
        },
      });

      setUploadedFile(result);

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof z.ZodError
          ? error.issues.map((issue) => issue.message).join('\n')
          : error instanceof Error
            ? error.message
            : 'Something went wrong, please try again later.';

      toast.error(
        errorMessage.length > 0
          ? errorMessage
          : 'Something went wrong, please try again later.'
      );

      const mockUploadedFile = {
        key: 'mock-key-0',
        name: file.name,
        size: file.size,
        type: file.type,
        ufsUrl: URL.createObjectURL(file),
      } as UploadedFile;
      let mockProgress = 0;

      while (mockProgress < 100) {
        await new Promise((resolve) => {
          setTimeout(resolve, 50);
        });
        mockProgress += 2;
        setProgress(Math.min(mockProgress, 100));
      }

      setUploadedFile(mockUploadedFile);

      return mockUploadedFile;
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }, []);

  const loading = Boolean(isUploading && uploadingFile);

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

  const [naturalSizeState, setNaturalSizeState] = React.useState<{
    file: File;
    size: null | { naturalHeight: number; naturalWidth: number };
  }>();
  const naturalSize =
    naturalSizeState && naturalSizeState.file === currentFile
      ? naturalSizeState.size
      : undefined;
  const isReplaced = React.useRef(false);

  const replaceCurrentPlaceholder = React.useCallback(
    (file: File) => {
      setNaturalSizeState(undefined);
      void uploadFile(file);
      api.addUploadingFile(nodeKey, file);
    },
    [api, nodeKey, uploadFile]
  );

  const { openFilePicker } = useFilePicker({
    accept: currentContent?.accept ?? [],
    multiple: true,
    onFilesSelected: ({ plainFiles: updatedFiles }: { plainFiles: File[] }) => {
      const firstFile = updatedFiles[0];
      const restFiles = updatedFiles.slice(1);

      if (!firstFile) return;

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
    if (isImage && naturalSize === undefined) return;

    update({ history: 'skip' }).replaceMedia(
      {
        ...naturalSize,
        ...(mediaPlugin === PLUGINS.file ? { name: uploadedFile.name } : {}),
        plugin: mediaPlugin,
        provider: mediaPlugin === PLUGINS.video ? 'file' : undefined,
        url: uploadedFile.ufsUrl,
      },
      { at: path }
    );

    api.removeUploadingFile(nodeKey);
  }, [
    api,
    mediaPlugin,
    uploadedFile,
    isImage,
    naturalSize,
    nodeKey,
    path,
    update,
  ]);

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
        <button
          className={cn(
            'flex w-full cursor-pointer select-none items-center rounded-sm bg-muted p-3 pr-9 text-left hover:bg-primary/10'
          )}
          disabled={loading}
          onClick={() => !loading && openFilePicker()}
          contentEditable={false}
          type="button"
        >
          <div className="relative mr-3 flex text-muted-foreground/80 [&_svg]:size-6">
            {currentContent.icon}
          </div>
          <div className="text-sm whitespace-nowrap text-muted-foreground">
            <div>{loading ? uploadingFile?.name : currentContent.content}</div>

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
        </button>
      )}

      {isImage && currentFile && (
        <ImageProgress
          file={currentFile}
          onNaturalSize={(file, size) => {
            setNaturalSizeState({ file, size });
          }}
          progress={progress}
        />
      )}

      {props.children}
    </PlateElement>
  );
}

export function ImageProgress({
  className,
  file,
  onNaturalSize,
  progress = 0,
}: {
  file: File;
  className?: string;
  onNaturalSize?: (
    file: File,
    size: null | { naturalHeight: number; naturalWidth: number }
  ) => void;
  progress?: number;
}) {
  const previewUrl = useObjectUrl(file);

  if (!previewUrl) return null;

  return (
    <div className={cn('relative', className)} contentEditable={false}>
      {/* oxlint-disable-next-line nextjs/no-img-element -- [P1 local-invariant] This local blob preview must expose native load dimensions and revoke its object URL directly. */}
      <img
        className="h-auto w-full rounded-sm object-cover"
        alt={file.name}
        onError={() => onNaturalSize?.(file, null)}
        onLoad={(event) => {
          const { naturalHeight, naturalWidth } = event.currentTarget;

          onNaturalSize?.(file, { naturalHeight, naturalWidth });
        }}
        src={previewUrl}
      />
      {progress < 100 && (
        <div className="absolute right-1 bottom-1 flex items-center space-x-2 rounded-full bg-black/50 px-1 py-0.5">
          <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />
          <span className="text-xs font-medium text-white">
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
