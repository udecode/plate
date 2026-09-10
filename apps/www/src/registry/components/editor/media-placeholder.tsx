'use client';

import { AudioLines, FileUp, Film, ImageIcon, Loader2Icon } from 'lucide-react';
import { PLUGINS } from 'platejs';
import { PlaceholderPlugin } from 'platejs/media/react';
import {
  PlateElement,
  useEditor,
  useEditorPlugin,
  useEditorReadOnly,
  usePluginStore,
  type PlateElementProps,
} from 'platejs/react';
import * as React from 'react';
import { toast } from 'sonner';
import { useFilePicker } from 'use-file-picker';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { useObjectUrl } from '@/registry/hooks/use-object-url';

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
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const nodeKey = editor.key(element);
  const { api, update } = useEditorPlugin(PlaceholderPlugin);
  const task = usePluginStore(PlaceholderPlugin, 'uploadTask', nodeKey);
  const state = React.useSyncExternalStore(
    React.useCallback(
      (listener) => task?.subscribe(listener) ?? (() => {}),
      [task]
    ),
    React.useCallback(() => task?.getSnapshot() ?? null, [task]),
    () => null
  );
  const currentFile = task?.file;
  const progress = state?.progress ?? 0;
  const loading = state?.status === 'uploading';

  React.useEffect(() => {
    if (!state?.error) return;
    const message =
      state.error instanceof z.ZodError
        ? state.error.issues.map((issue) => issue.message).join('\n')
        : state.error instanceof Error
          ? state.error.message
          : '';
    toast.error(message || 'Upload failed. Please try again.');
  }, [state?.error]);

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

  const { openFilePicker } = useFilePicker({
    accept: currentContent?.accept ?? [],
    multiple: true,
    onFilesSelected: ({ plainFiles: updatedFiles }: { plainFiles: File[] }) => {
      const firstFile = updatedFiles[0];
      const restFiles = updatedFiles.slice(1);

      if (!firstFile || readOnly) return;

      api.upload(nodeKey, firstFile);

      if (restFiles.length > 0) {
        update.insertMedia(restFiles);
      }
    },
  });

  if (!currentContent) return null;

  return (
    <PlateElement className="my-1" {...props}>
      {(!loading || !isImage) && (
        <button
          className={cn(
            'flex w-full cursor-pointer select-none items-center rounded-sm bg-muted p-3 pr-9 text-left hover:bg-primary/10'
          )}
          disabled={loading || readOnly}
          onClick={() => !loading && !readOnly && openFilePicker()}
          contentEditable={false}
          type="button"
        >
          <div className="relative mr-3 flex text-muted-foreground/80 [&_svg]:size-6">
            {currentContent.icon}
          </div>
          <div className="text-sm whitespace-nowrap text-muted-foreground">
            <div>{loading ? currentFile?.name : currentContent.content}</div>

            {loading && !isImage && (
              <div className="mt-1 flex items-center gap-1.5">
                <div>{formatBytes(currentFile?.size ?? 0)}</div>
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

      {isImage && loading && currentFile && (
        <ImageProgress file={currentFile} progress={progress} />
      )}

      {props.children}
    </PlateElement>
  );
}

export function ImageProgress({
  className,
  file,
  progress = 0,
}: {
  file: File;
  className?: string;
  progress?: number;
}) {
  const previewUrl = useObjectUrl(file);

  if (!previewUrl) return null;

  return (
    <div className={cn('relative', className)} contentEditable={false}>
      {/* oxlint-disable-next-line nextjs/no-img-element -- [P1 local-invariant] This local blob preview owns and revokes its object URL. */}
      <img
        className="h-auto w-full rounded-sm object-cover"
        alt={file.name}
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
