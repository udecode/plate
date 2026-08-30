'use client';

import { useDraggable } from 'platejs/dnd/react';
import { ImagePlugin } from 'platejs/media/react';
import {
  PlateElement,
  useEditor,
  useEditorFocused,
  useElementSelected,
  usePath,
  usePluginStore,
  type PlateElementProps,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Caption, useCaptionFocused } from './caption';
import { imagePlugin } from './media-preview-dialog';
import { MediaToolbar } from './media-toolbar';
import {
  mediaResizeHandleVariants,
  Resizable,
  ResizeHandle,
} from './resize-handle';

export function ImageElement(props: PlateElementProps<typeof imagePlugin>) {
  const path = usePath();
  const focused = useEditorFocused();
  const selected = useElementSelected({ mode: 'node' });
  const textAlign =
    'textAlign' in props.element &&
    (props.element.textAlign === 'left' ||
      props.element.textAlign === 'right' ||
      props.element.textAlign === 'center')
      ? props.element.textAlign
      : 'center';
  const editor = useEditor();
  const captionFocused = useCaptionFocused(path);
  const previewOpen = usePluginStore(imagePlugin, 'previewOpen');
  const { isDragging, handleRef } = useDraggable({
    element: props.element,
  });

  return (
    <MediaToolbar
      disabled={previewOpen}
      plugin={ImagePlugin}
      selected={selected}
    >
      <PlateElement {...props} className="py-2.5">
        <figure className="group relative m-0">
          <div contentEditable={false}>
            <Resizable
              align={textAlign}
              minWidth={92}
              onResizeEnd={(width) => {
                editor.plugin(imagePlugin).update.set({ width }, { at: path });
              }}
              width={props.element.width}
            >
              <ResizeHandle
                className={mediaResizeHandleVariants({ direction: 'left' })}
                direction="left"
              />
              <div>
                {/* oxlint-disable-next-line nextjs/no-img-element -- [P1 local-invariant] The editor node owns a user URL, native draggable image, composed ref, and resizable width. */}
                <img
                  ref={handleRef}
                  className={cn(
                    'block w-full max-w-full cursor-pointer object-cover px-0',
                    'rounded-sm',
                    focused && selected && 'ring-2 ring-ring ring-offset-2',
                    isDragging && 'opacity-50'
                  )}
                  alt={props.element.alt}
                  draggable
                  src={props.element.url}
                  onDoubleClickCapture={() => {
                    editor
                      .plugin(imagePlugin)
                      .api.preview.open(props.element, props.element.url);
                  }}
                />
              </div>
              <ResizeHandle
                className={mediaResizeHandleVariants({
                  direction: 'right',
                })}
                direction="right"
              />
            </Resizable>
          </div>
          <Caption
            active={selected || captionFocused}
            align={textAlign}
            element={props.element}
            slots={props.slots}
          >
            {props.children}
          </Caption>
        </figure>
      </PlateElement>
    </MediaToolbar>
  );
}
