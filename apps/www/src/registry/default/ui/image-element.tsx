import React from 'react';
import {
  Box,
  PlateElement,
  PlateElementProps,
  Value,
} from '@udecode/plate-common';
import { ElementPopover } from '@udecode/plate-floating';
import {
  Caption,
  CaptionTextarea,
  ELEMENT_IMAGE,
  Image,
  Resizable,
  TImageElement,
  useMediaState,
} from '@udecode/plate-media';
import { useFocused, useReadOnly, useSelected } from 'slate-react';
import {
  mediaFloatingOptions,
  MediaFloatingToolbar,
} from './media-floating-toolbar';

import { cn } from '@/lib/utils';

const align = 'center';

export function ImageElement({
  className,
  ...props
}: PlateElementProps<Value, TImageElement>) {
  const { children, nodeProps } = props;

  const focused = useFocused();
  const selected = useSelected();
  const readOnly = useReadOnly();

  useMediaState();

  return (
    <ElementPopover
      content={
        readOnly ? null : <MediaFloatingToolbar pluginKey={ELEMENT_IMAGE} />
      }
      floatingOptions={mediaFloatingOptions}
    >
      <PlateElement className={cn('py-2.5', className)} {...props}>
        <figure className="group relative m-0" contentEditable={false}>
          <Resizable
            className={cn(
              align === 'center' && 'mx-auto'
              // align === 'right' && 'ml-auto'
            )}
            options={{
              renderHandleLeft: (htmlProps) => (
                <Box
                  {...htmlProps}
                  className={cn(
                    'absolute top-0 z-10 flex h-full w-6 select-none flex-col justify-center',
                    'after:flex after:h-16 after:bg-gray-400  after:opacity-0 after:group-hover:opacity-100',
                    "after:w-[3px] after:rounded-[6px] after:content-['_']",
                    'hover:after:bg-blue-500 focus:after:bg-blue-500 active:after:bg-blue-500',
                    focused && selected && 'opacity-100',
                    // variant left
                    '-left-3 -ml-3 pl-3'
                  )}
                />
              ),
              renderHandleRight: (htmlProps) => (
                <Box
                  {...htmlProps}
                  className={cn(
                    'absolute top-0 z-10 flex h-full w-6 select-none flex-col justify-center',
                    'after:flex after:h-16 after:bg-gray-400 after:opacity-0 after:group-hover:opacity-100',
                    "after:w-[3px] after:rounded-[6px] after:content-['_']",
                    'hover:after:bg-blue-500 focus:after:bg-blue-500 active:after:bg-blue-500',
                    focused && selected && 'opacity-100',
                    // variant right
                    '-right-3 -mr-3 items-end pr-3'
                  )}
                />
              ),
              align,
              readOnly,
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
              {...nodeProps}
              className={cn(
                'block w-full max-w-full cursor-pointer object-cover px-0',
                'rounded-[3px]',
                focused && selected && 'shadow-[0_0_1px_rgb(59,130,249)]',
                nodeProps?.className
              )}
            />
          </Resizable>

          <Caption className={cn(align === 'center' && 'mx-auto')}>
            <CaptionTextarea
              className={cn(
                'mt-2 w-full resize-none border-none bg-inherit p-0 font-[inherit] text-inherit',
                'focus:outline-none focus:[&::placeholder]:opacity-0',
                'text-center'
              )}
              placeholder="Write a caption..."
              readOnly={readOnly}
            />
          </Caption>
        </figure>

        {children}
      </PlateElement>
    </ElementPopover>
  );
}
