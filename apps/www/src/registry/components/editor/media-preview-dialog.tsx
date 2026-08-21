'use client';

import {
  BaseImagePlugin,
  type ImageElement as ImageNode,
} from '@platejs/media';
import { ImagePlugin } from '@platejs/media/react';
import { useComposedRef } from '@udecode/react-utils';
import { cva } from 'class-variance-authority';
import { ArrowLeft, ArrowRight, Download, Minus, Plus, X } from 'lucide-react';
import type { NodeKey } from 'platejs';
import { isHotkey } from 'platejs';
import { useEditorPlugin, usePluginStore } from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva('rounded bg-[rgba(0,0,0,0.5)] px-1', {
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      default: 'text-white',
      disabled: 'cursor-not-allowed text-gray-400',
    },
  },
});

const SCROLL_SPEED = 4;
const DEFAULT_DOWNLOAD_FILENAME = 'image';
const ZOOM_LEVELS = [0, 0.5, 1, 1.5, 2];

type PreviewItem = {
  key: NodeKey;
  url: string;
};

type ImagePreviewState = {
  boundingClientRect: DOMRect | null;
  currentPreview: PreviewItem | null;
  isEditingScale: boolean;
  openEditorId: string | null;
  previewList: PreviewItem[];
  scale: number;
  translate: { x: number; y: number };
};

const createInitialPreviewState = (): ImagePreviewState => ({
  boundingClientRect: null,
  currentPreview: null,
  isEditingScale: false,
  openEditorId: null,
  previewList: [],
  scale: 1,
  translate: { x: 0, y: 0 },
});

export const imagePlugin = ImagePlugin.extend({
  initialState: { preview: createInitialPreviewState() },
}).extend(({ editor, store }) => ({
  api: () => ({
    preview: {
      close: () => {
        store.set({ preview: createInitialPreviewState() });
        editor.api.dom.focus();
      },
      next: () => {
        const preview = store.get('preview');
        const currentIndex = preview.currentPreview
          ? preview.previewList.findIndex(
              (item) =>
                item.url === preview.currentPreview?.url &&
                item.key === preview.currentPreview.key
            )
          : -1;

        if (
          currentIndex >= 0 &&
          currentIndex < preview.previewList.length - 1
        ) {
          store.set({
            preview: {
              ...preview,
              boundingClientRect: null,
              currentPreview: preview.previewList[currentIndex + 1],
              isEditingScale: false,
              scale: 1,
              translate: { x: 0, y: 0 },
            },
          });
        }
      },
      open: (element: ImageNode, resolvedUrl = element.url) => {
        const currentKey = editor.key(element);

        store.set({
          preview: {
            ...createInitialPreviewState(),
            currentPreview: {
              key: currentKey,
              url: resolvedUrl,
            },
            openEditorId: editor.id,
            previewList: Array.from(
              editor.read.nodes.entries({ at: [], type: BaseImagePlugin }),
              ([node, path]) => ({
                key: editor.key(path)!,
                url: editor.key(path) === currentKey ? resolvedUrl : node.url,
              })
            ),
          },
        });
      },
      previous: () => {
        const preview = store.get('preview');
        const currentIndex = preview.currentPreview
          ? preview.previewList.findIndex(
              (item) =>
                item.url === preview.currentPreview?.url &&
                item.key === preview.currentPreview.key
            )
          : -1;

        if (currentIndex > 0) {
          store.set({
            preview: {
              ...preview,
              boundingClientRect: null,
              currentPreview: preview.previewList[currentIndex - 1],
              isEditingScale: false,
              scale: 1,
              translate: { x: 0, y: 0 },
            },
          });
        }
      },
      setEditingScale: (isEditingScale: boolean) => {
        const preview = store.get('preview');
        store.set({ preview: { ...preview, isEditingScale } });
      },
      setScale: (scale: number) => {
        const preview = store.get('preview');
        store.set({
          preview: {
            ...preview,
            boundingClientRect: scale <= 1 ? null : preview.boundingClientRect,
            scale,
            translate: scale <= 1 ? { x: 0, y: 0 } : preview.translate,
          },
        });
      },
      setTranslate: (translate: { x: number; y: number }) => {
        const preview = store.get('preview');
        store.set({ preview: { ...preview, translate } });
      },
      zoomIn: () => {
        const preview = store.get('preview');
        const scale = ZOOM_LEVELS.find((target) => preview.scale < target);

        if (scale !== undefined) {
          store.set({ preview: { ...preview, scale } });
        }
      },
      zoomOut: () => {
        const preview = store.get('preview');
        const scale = ZOOM_LEVELS.findLast((target) => preview.scale > target);

        if (scale !== undefined) {
          store.set({
            preview: {
              ...preview,
              boundingClientRect:
                scale <= 1 ? null : preview.boundingClientRect,
              scale,
              translate: scale <= 1 ? { x: 0, y: 0 } : preview.translate,
            },
          });
        }
      },
    },
  }),
  selectors: {
    previewOpen: (state) => state.preview.openEditorId === editor.id,
  },
}));

export function MediaPreviewDialog() {
  const { api } = useEditorPlugin(imagePlugin);
  const preview = usePluginStore(imagePlugin, 'preview');
  const isOpen = usePluginStore(imagePlugin, 'previewOpen');
  const {
    boundingClientRect,
    currentPreview,
    isEditingScale,
    previewList,
    scale,
    translate,
  } = preview;
  const currentPreviewIndex = currentPreview
    ? previewList.findIndex(
        (item) =>
          item.url === currentPreview.url && item.key === currentPreview.key
      )
    : null;
  const prevDisabled = currentPreviewIndex === 0;
  const nextDisabled = currentPreviewIndex === previewList.length - 1;
  const zoomOutDisabled = scale <= 0.5;
  const zoomInDisabled = scale >= 2;
  const downloadDisabled = !currentPreview?.url;

  React.useEffect(() => {
    if (!isOpen) return;

    const onWheel = (event: WheelEvent) => {
      if (scale <= 1 || !boundingClientRect) return;

      event.preventDefault();

      const { deltaX, deltaY } = event;
      const { x, y } = translate;
      const { bottom, left, right, top } = boundingClientRect;
      let nextX = x - deltaX / SCROLL_SPEED;
      let nextY = y - deltaY / SCROLL_SPEED;

      if (left - deltaX / SCROLL_SPEED > window.innerWidth / 2 && deltaX < 0) {
        nextX = x;
      }
      if (right - deltaX / SCROLL_SPEED < window.innerWidth / 2 && deltaX > 0) {
        nextX = x;
      }
      if (top - deltaY / SCROLL_SPEED > window.innerHeight / 2 && deltaY < 0) {
        nextY = y;
      }
      if (
        bottom - deltaY / SCROLL_SPEED < window.innerHeight / 2 &&
        deltaY > 0
      ) {
        nextY = y;
      }

      api.preview.setTranslate({ x: nextX, y: nextY });
    };

    document.addEventListener('wheel', onWheel, { passive: false });

    return () => document.removeEventListener('wheel', onWheel);
  }, [api.preview, boundingClientRect, isOpen, scale, translate]);

  React.useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isHotkey('escape')(event)) return;

      event.stopPropagation();
      api.preview.close();
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [api.preview, isOpen]);

  const handleDownload = () => {
    if (!currentPreview?.url) return;

    const link = document.createElement('a');
    link.download = getImageDownloadFilename(currentPreview.url);
    link.href = currentPreview.url;
    link.rel = 'noopener noreferrer';
    document.body.append(link);
    link.click();
    link.remove();
  };

  return (
    <div
      className={cn(
        'fixed top-0 left-0 z-50 h-screen w-screen select-none',
        !isOpen && 'hidden'
      )}
      onContextMenu={(e) => e.stopPropagation()}
      onClick={api.preview.close}
    >
      <div className="absolute inset-0 size-full bg-black opacity-30" />
      <div className="absolute inset-0 size-full bg-black opacity-30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex max-h-screen w-full items-center">
          <PreviewImage
            className={cn(
              'mx-auto block max-h-[calc(100vh-4rem)] w-auto object-contain transition-transform'
            )}
          />
          <div
            className="absolute bottom-0 left-1/2 z-40 flex w-fit -translate-x-1/2 justify-center gap-4 p-2 text-center text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-1">
              <button
                className={cn(
                  buttonVariants({
                    variant: prevDisabled ? 'disabled' : 'default',
                  })
                )}
                disabled={prevDisabled}
                onClick={api.preview.previous}
                type="button"
              >
                <ArrowLeft />
              </button>
              {(currentPreviewIndex ?? 0) + 1}
              <button
                className={cn(
                  buttonVariants({
                    variant: nextDisabled ? 'disabled' : 'default',
                  })
                )}
                disabled={nextDisabled}
                onClick={api.preview.next}
                type="button"
              >
                <ArrowRight />
              </button>
            </div>
            <div className="flex">
              <button
                className={cn(
                  buttonVariants({
                    variant: zoomOutDisabled ? 'disabled' : 'default',
                  })
                )}
                disabled={zoomOutDisabled}
                onClick={api.preview.zoomOut}
                type="button"
              >
                <Minus className="size-4" />
              </button>
              <div className="mx-px">
                {isEditingScale ? (
                  <>
                    <ScaleInput
                      key={scale}
                      className="w-10 rounded px-1 text-slate-500 outline"
                      scale={scale}
                      onCommit={(nextScale) => {
                        api.preview.setScale(nextScale);
                        api.preview.setEditingScale(false);
                      }}
                    />{' '}
                    <span>%</span>
                  </>
                ) : (
                  <span onClick={() => api.preview.setEditingScale(true)}>
                    {`${scale * 100}%`}
                  </span>
                )}
              </div>
              <button
                className={cn(
                  buttonVariants({
                    variant: zoomInDisabled ? 'disabled' : 'default',
                  })
                )}
                disabled={zoomInDisabled}
                onClick={api.preview.zoomIn}
                type="button"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <button
              className={cn(
                buttonVariants({
                  variant: downloadDisabled ? 'disabled' : 'default',
                })
              )}
              disabled={downloadDisabled}
              onClick={handleDownload}
              type="button"
            >
              <Download className="size-4" />
            </button>
            <button
              className={cn(buttonVariants())}
              onClick={api.preview.close}
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewImage({
  alt = '',
  ref,
  ...props
}: React.ComponentPropsWithRef<'img'>) {
  const { api, store } = useEditorPlugin(imagePlugin);
  const preview = usePluginStore(imagePlugin, 'preview');
  const imageRef = React.useRef<HTMLImageElement>(null);
  const isZoomIn = preview.scale <= 1;

  React.useEffect(() => {
    if (preview.scale <= 1) return;

    const boundingClientRect = imageRef.current?.getBoundingClientRect();

    if (!boundingClientRect) return;

    store.set({ preview: { ...store.get('preview'), boundingClientRect } });
  }, [preview.scale, preview.translate.x, preview.translate.y, store]);

  return (
    <img
      alt={alt}
      ref={useComposedRef(imageRef, ref)}
      draggable={false}
      src={preview.currentPreview?.url}
      style={{
        cursor: isZoomIn ? 'zoom-in' : 'zoom-out',
        transform: `translate(${`${preview.translate.x}px`}, ${`${preview.translate.y}px`}) scale(${preview.scale})`,
      }}
      onClick={(event) => {
        event.stopPropagation();
        api.preview[isZoomIn ? 'zoomIn' : 'zoomOut']();
      }}
      {...props}
    />
  );
}

function ScaleInput({
  onCommit,
  scale,
  ...props
}: React.ComponentProps<'input'> & {
  scale: number;
  onCommit: (scale: number) => void;
}) {
  const [value, setValue] = React.useState(`${scale * 100}`);

  return (
    <input
      autoFocus
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onFocus={(event) => event.currentTarget.select()}
      onKeyDown={(event) => {
        if (!isHotkey('enter')(event)) return;

        event.preventDefault();

        const percentage = Number(value);

        if (!Number.isFinite(percentage)) return;

        const nextScale = Math.min(200, Math.max(50, percentage)) / 100;

        onCommit(Number(nextScale.toFixed(2)));
      }}
      {...props}
    />
  );
}

function getImageDownloadFilename(url: string) {
  try {
    const pathname = new URL(url, window.location.href).pathname;
    const filename = pathname.split('/').filter(Boolean).pop();

    return filename || DEFAULT_DOWNLOAD_FILENAME;
  } catch {
    return DEFAULT_DOWNLOAD_FILENAME;
  }
}
