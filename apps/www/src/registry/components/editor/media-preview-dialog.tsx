'use client';

import { ArrowLeft, ArrowRight, Download, Minus, Plus, X } from 'lucide-react';
import { type NodeKey, type Path, isHotkey } from 'platejs';
import { BaseImagePlugin } from 'platejs/media';
import { ImagePlugin } from 'platejs/media/react';
import { useComposedRef, useEditor, usePluginStore } from 'platejs/react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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
      // Keys differ between the owner and view editors, so the image passes
      // its path and this editor resolves every key.
      open: (at: Path, resolvedUrl: string) => {
        const currentKey = editor.key(at);

        if (!currentKey) return;

        store.set({
          preview: {
            ...createInitialPreviewState(),
            currentPreview: {
              key: currentKey,
              url: resolvedUrl,
            },
            openEditorId: editor.id,
            previewList: Array.from(
              editor.read.nodes.entries({ at: [], type: BaseImagePlugin })
            ).flatMap(([node, path]) => {
              const key = editor.key(path);

              return key == null
                ? []
                : [
                    {
                      key,
                      url: key === currentKey ? resolvedUrl : node.url,
                    },
                  ];
            }),
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
  const editor = useEditor();
  const { api } = editor.plugin(imagePlugin);
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
    if (!isOpen) return undefined;

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

    return () => {
      document.removeEventListener('wheel', onWheel);
    };
  }, [api.preview, boundingClientRect, isOpen, scale, translate]);

  React.useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isHotkey('escape')(event)) return;

      event.stopPropagation();
      api.preview.close();
    };

    // Capture so an editor or popover handler cannot swallow Escape first.
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
    };
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

  if (!isOpen) return null;

  // Portal to the body so no ancestor stacking context or overlay covers it.
  return createPortal(
    <div
      className="fixed top-0 left-0 z-50 h-screen w-screen select-none"
      onContextMenu={(e) => {
        e.stopPropagation();
      }}
    >
      <button
        aria-label="Close preview"
        className="absolute inset-0 size-full border-0 bg-black p-0 opacity-60"
        onClick={api.preview.close}
        type="button"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative flex max-h-screen w-full items-center justify-center">
          <PreviewImage
            className={cn(
              'mx-auto block max-h-[calc(100vh-10rem)] w-auto object-contain transition-transform'
            )}
          />
          <div className="pointer-events-auto fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
            <Button
              aria-label="Previous image"
              disabled={prevDisabled}
              onClick={api.preview.previous}
              size="icon-sm"
              variant="ghost"
            >
              <ArrowLeft />
            </Button>
            <span className="min-w-10 text-center text-sm text-muted-foreground tabular-nums">
              {(currentPreviewIndex ?? 0) + 1} / {previewList.length}
            </span>
            <Button
              aria-label="Next image"
              disabled={nextDisabled}
              onClick={api.preview.next}
              size="icon-sm"
              variant="ghost"
            >
              <ArrowRight />
            </Button>
            <Separator
              className="mx-1 data-[orientation=vertical]:h-5"
              orientation="vertical"
            />
            <Button
              aria-label="Zoom out"
              disabled={zoomOutDisabled}
              onClick={api.preview.zoomOut}
              size="icon-sm"
              variant="ghost"
            >
              <Minus />
            </Button>
            {isEditingScale ? (
              <div className="flex items-center gap-1 px-1 text-sm">
                <ScaleInput
                  key={scale}
                  className="h-7 w-12 rounded-md border bg-transparent px-1.5 text-center tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  scale={scale}
                  onCommit={(nextScale) => {
                    api.preview.setScale(nextScale);
                    api.preview.setEditingScale(false);
                  }}
                />
                %
              </div>
            ) : (
              <Button
                aria-label="Set zoom level"
                className="min-w-14 tabular-nums"
                onClick={() => {
                  api.preview.setEditingScale(true);
                }}
                size="sm"
                variant="ghost"
              >
                {`${scale * 100}%`}
              </Button>
            )}
            <Button
              aria-label="Zoom in"
              disabled={zoomInDisabled}
              onClick={api.preview.zoomIn}
              size="icon-sm"
              variant="ghost"
            >
              <Plus />
            </Button>
            <Separator
              className="mx-1 data-[orientation=vertical]:h-5"
              orientation="vertical"
            />
            <Button
              aria-label="Download image"
              disabled={downloadDisabled}
              onClick={handleDownload}
              size="icon-sm"
              variant="ghost"
            >
              <Download />
            </Button>
            <Button
              aria-label="Close preview"
              onClick={api.preview.close}
              size="icon-sm"
              variant="ghost"
            >
              <X />
            </Button>
          </div>
        </div>
      </div>
    </div>,
    editor.api.dom.getWindow().document.body
  );
}

function PreviewImage({
  alt = '',
  ref,
  ...props
}: React.ComponentPropsWithRef<'img'>) {
  const { api, store } = useEditor().plugin(imagePlugin);
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
    <button
      aria-label={isZoomIn ? 'Zoom in preview image' : 'Zoom out preview image'}
      className="pointer-events-auto block border-0 bg-transparent p-0"
      onClick={(event) => {
        event.stopPropagation();
        api.preview[isZoomIn ? 'zoomIn' : 'zoomOut']();
      }}
      type="button"
    >
      {/* oxlint-disable-next-line nextjs/no-img-element -- [P1 local-invariant] The preview owns a runtime URL, imperative ref, and live CSS transform that Next Image cannot preserve. */}
      <img
        alt={alt}
        ref={useComposedRef(imageRef, ref)}
        draggable={false}
        src={preview.currentPreview?.url}
        style={{
          cursor: isZoomIn ? 'zoom-in' : 'zoom-out',
          transform: `translate(${preview.translate.x}px, ${preview.translate.y}px) scale(${preview.scale})`,
        }}
        {...props}
      />
    </button>
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
      onChange={(event) => {
        setValue(event.target.value);
      }}
      onFocus={(event) => {
        event.currentTarget.select();
      }}
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
    const { pathname } = new URL(url, window.location.href);
    const filename = pathname.split('/').findLast(Boolean);

    return filename || DEFAULT_DOWNLOAD_FILENAME;
  } catch {
    return DEFAULT_DOWNLOAD_FILENAME;
  }
}
