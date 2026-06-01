'use client';

import {
  PreviewImage,
  useImagePreview,
  useImagePreviewValue,
  useScaleInput,
} from '@platejs/media/react';
import { cva } from 'class-variance-authority';
import { ArrowLeft, ArrowRight, Download, Minus, Plus, X } from 'lucide-react';
import { useEditorRef } from 'platejs/react';

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

export function MediaPreviewDialog() {
  const editor = useEditorRef();
  const isOpen = useImagePreviewValue('isOpen', editor.id);
  const scale = useImagePreviewValue('scale');
  const isEditingScale = useImagePreviewValue('isEditingScale');
  const currentPreview = useImagePreviewValue('currentPreview');
  const {
    closeProps,
    currentUrlIndex,
    maskLayerProps,
    nextDisabled,
    nextProps,
    prevDisabled,
    prevProps,
    scaleTextProps,
    zommOutProps,
    zoomInDisabled,
    zoomInProps,
    zoomOutDisabled,
  } = useImagePreview({ scrollSpeed: SCROLL_SPEED });
  const downloadDisabled = !currentPreview?.url;
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
      {...maskLayerProps}
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
            className="-translate-x-1/2 absolute bottom-0 left-1/2 z-40 flex w-fit justify-center gap-4 p-2 text-center text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-1">
              <button
                {...prevProps}
                className={cn(
                  buttonVariants({
                    variant: prevDisabled ? 'disabled' : 'default',
                  })
                )}
                type="button"
              >
                <ArrowLeft />
              </button>
              {(currentUrlIndex ?? 0) + 1}
              <button
                {...nextProps}
                className={cn(
                  buttonVariants({
                    variant: nextDisabled ? 'disabled' : 'default',
                  })
                )}
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
                {...zommOutProps}
                type="button"
              >
                <Minus className="size-4" />
              </button>
              <div className="mx-px">
                {isEditingScale ? (
                  <>
                    <ScaleInput className="w-10 rounded px-1 text-slate-500 outline" />{' '}
                    <span>%</span>
                  </>
                ) : (
                  <span {...scaleTextProps}>{`${scale * 100}%`}</span>
                )}
              </div>
              <button
                className={cn(
                  buttonVariants({
                    variant: zoomInDisabled ? 'disabled' : 'default',
                  })
                )}
                {...zoomInProps}
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
              {...closeProps}
              className={cn(buttonVariants())}
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

function ScaleInput(props: React.ComponentProps<'input'>) {
  const { props: scaleInputProps, ref } = useScaleInput();

  return <input {...scaleInputProps} {...props} ref={ref} />;
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
