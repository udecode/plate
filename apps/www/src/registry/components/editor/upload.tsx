'use client';

import { createFilesClient } from 'files-sdk/client';
import { AudioLines, FileUp, Film, ImageIcon, Loader2Icon } from 'lucide-react';
import {
  EditorElement,
  useEditor,
  useEditorReadOnly,
  usePath,
  usePluginStore,
  type EditorElementProps,
} from 'platejs/react';
import type { UploadFailure, UploadKind } from 'platejs/upload';
import { UploadPlugin } from 'platejs/upload/react';
import * as React from 'react';
import { toast } from 'sonner';
import { useFilePicker } from 'use-file-picker';

import { cn } from '@/lib/utils';
import { useObjectUrl } from '@/registry/hooks/use-object-url';

// The copied playground uses one document; applications supply their active document ID.
const endpoint = '/api/files?documentId=playground';
const client = createFilesClient({ endpoint });

const CONTENT: Record<
  UploadKind,
  {
    accept: string[];
    content: React.ReactNode;
    icon: React.ReactNode;
  }
> = {
  audio: {
    accept: ['audio/*'],
    content: 'Add an audio file',
    icon: <AudioLines />,
  },
  file: {
    accept: ['*'],
    content: 'Add a file',
    icon: <FileUp />,
  },
  image: {
    accept: ['image/*'],
    content: 'Add an image',
    icon: <ImageIcon />,
  },
  video: {
    accept: ['video/*'],
    content: 'Add a video',
    icon: <Film />,
  },
};

const fileNames = (files: readonly File[]) =>
  files.map((file) => file.name).join(', ');

const showUploadFailure = (failure: UploadFailure) => {
  if (failure.phase === 'admission') {
    switch (failure.code) {
      case 'unsupported-file-type': {
        toast.error(
          `The type of ${fileNames(failure.files)} is not supported.`
        );
        return;
      }
      case 'file-too-large': {
        toast.error(
          `${fileNames(failure.files)} exceeds the ${formatBytes(failure.maxBytes)} limit.`
        );
        return;
      }
      case 'too-few-files': {
        toast.error(
          `Select at least ${failure.minFiles} ${failure.fileType} file${failure.minFiles === 1 ? '' : 's'}.`
        );
        return;
      }
      case 'too-many-files': {
        toast.error(
          `Select at most ${failure.maxFiles}${failure.fileType ? ` ${failure.fileType}` : ''} file${failure.maxFiles === 1 ? '' : 's'}.`
        );
        return;
      }
    }
  }

  switch (failure.code) {
    case 'missing-client':
    case 'missing-url-resolver':
    case 'missing-destination': {
      toast.error('File uploads are not configured.');
      break;
    }
    case 'upload-error':
    case 'resolver-error': {
      toast.error(
        failure.error instanceof Error
          ? failure.error.message
          : `Could not upload ${failure.file.name}.`
      );
      break;
    }
    case 'invalid-url': {
      toast.error(
        `The upload for ${failure.file.name} returned an invalid URL.`
      );
      break;
    }
  }
};

export function UploadElement(props: EditorElementProps<typeof UploadPlugin>) {
  const { element } = props;
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const nodeKey = usePath((path) => editor.key(path));
  if (!nodeKey) {
    throw new Error('File upload element requires a live node key.');
  }
  const { api, update } = editor.plugin(UploadPlugin);
  const task = usePluginStore(UploadPlugin, 'task', nodeKey);
  const state = React.useSyncExternalStore(
    React.useCallback(
      (listener) => task?.subscribe(listener) ?? (() => {}),
      [task]
    ),
    React.useCallback(() => task?.getSnapshot() ?? null, [task]),
    () => null
  );
  const currentContent = CONTENT[element.kind];
  const currentFile = task?.file;
  const progress = Math.round((state?.progress.fraction ?? 0) * 100);
  const loading = state?.status === 'uploading';
  const failed = state?.status === 'failed';
  const isImage = element.kind === 'image';

  const { openFilePicker } = useFilePicker({
    accept: currentContent.accept,
    multiple: true,
    readFilesContent: false,
    onFilesSelected: ({ plainFiles }) => {
      if (readOnly) return;

      update.submit(plainFiles, { slot: nodeKey });
    },
  });

  return (
    <EditorElement className="relative my-1" {...props}>
      {(!loading || !isImage) && (
        <button
          className={cn(
            'flex w-full cursor-pointer select-none items-center rounded-sm bg-muted p-3 pr-9 text-left hover:bg-primary/10'
          )}
          disabled={loading || readOnly}
          onClick={() => openFilePicker()}
          contentEditable={false}
          type="button"
        >
          <div className="relative mr-3 flex text-muted-foreground/80 [&_svg]:size-6">
            {currentContent.icon}
          </div>
          <div className="text-sm whitespace-nowrap text-muted-foreground">
            <div>{currentFile?.name ?? currentContent.content}</div>

            {loading && !isImage && currentFile && (
              <div className="mt-1 flex items-center gap-1.5">
                <div>{formatBytes(currentFile.size)}</div>
                <div>–</div>
                <div className="flex items-center">
                  <Loader2Icon className="mr-1 size-3.5 animate-spin text-muted-foreground" />
                  {progress}%
                </div>
              </div>
            )}
            {failed && <div className="mt-1">Upload failed. Try again.</div>}
          </div>
        </button>
      )}

      {isImage && loading && currentFile && (
        <ImageProgress file={currentFile} progress={progress} />
      )}

      {loading && !readOnly && (
        <button
          aria-label="Cancel upload"
          className="absolute top-2 right-2 rounded-sm bg-background/80 p-1 text-xs text-foreground"
          contentEditable={false}
          onClick={() => api.cancel(nodeKey)}
          type="button"
        >
          Cancel
        </button>
      )}

      {props.children}
    </EditorElement>
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
      <div className="absolute right-1 bottom-1 flex items-center gap-2 rounded-full bg-black/50 px-1 py-0.5">
        <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />
        <span className="text-xs font-medium text-white">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

export const UploadKit = [
  UploadPlugin.configure({
    component: UploadElement,
    initialState: {
      client,
      getUrl: ({ key }) => {
        const url = new URL(endpoint, window.location.origin);
        url.searchParams.set('op', 'download');
        url.searchParams.set('key', key);
        return url.href;
      },
      maxFiles: 5,
      onError: showUploadFailure,
      rules: {
        audio: {
          kind: 'audio',
          maxBytes: 8 * 1024 * 1024,
          maxFiles: 1,
          minFiles: 1,
        },
        blob: {
          kind: 'file',
          maxBytes: 8 * 1024 * 1024,
          maxFiles: 1,
          minFiles: 1,
        },
        image: {
          kind: 'image',
          maxBytes: 4 * 1024 * 1024,
          maxFiles: 3,
          minFiles: 1,
        },
        pdf: {
          kind: 'file',
          maxBytes: 4 * 1024 * 1024,
          maxFiles: 1,
          minFiles: 1,
        },
        text: {
          kind: 'file',
          maxBytes: 64 * 1024,
          maxFiles: 1,
          minFiles: 1,
        },
        video: {
          kind: 'video',
          maxBytes: 16 * 1024 * 1024,
          maxFiles: 1,
          minFiles: 1,
        },
      },
    },
  }),
];

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
      ? (accurateSizes[i] ?? 'Bytes')
      : (sizes[i] ?? 'Bytes')
  }`;
}
