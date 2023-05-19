import React from 'react';
import { Box, Value } from '@udecode/plate-common';
import { ElementPopover, PopoverProps } from '@udecode/plate-floating';
import {
  Caption,
  ELEMENT_IMAGE,
  Image,
  Media,
  ResizableProps,
  TImageElement,
} from '@udecode/plate-media';
import { cn, PlateElementProps } from '@udecode/plate-styled-components';
import { useFocused, useReadOnly, useSelected } from 'slate-react';
import { PlateFloatingMedia } from '../MediaEmbedElement/index';
import { mediaFloatingOptions } from '../mediaFloatingOptions';

export interface ImageElementPropsCaption {
  disabled?: boolean;

  /**
   * Caption alignment.
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Caption placeholder.
   */
  placeholder?: string;

  /**
   * Whether caption is read-only.
   */
  readOnly?: boolean;
}

export interface ImageElementProps
  extends PlateElementProps<Value, TImageElement>,
    Pick<Partial<ResizableProps>, 'align'> {
  resizableProps?: Omit<ResizableProps, 'as'>;

  caption?: ImageElementPropsCaption;

  popoverProps?: PopoverProps;

  /**
   * Whether the image is draggable.
   */
  draggable?: boolean;

  /**
   * Ignore editable readOnly mode
   */
  ignoreReadOnly?: boolean;
}

export function ImageElement({ className, ...props }: ImageElementProps) {
  const {
    children,
    nodeProps,
    caption = {},
    popoverProps = {},
    resizableProps,
    align = 'center',
    ignoreReadOnly = false,
  } = props;

  const focused = useFocused();
  const selected = useSelected();
  const readOnly = useReadOnly();

  return (
    <ElementPopover
      content={<PlateFloatingMedia pluginKey={ELEMENT_IMAGE} />}
      floatingOptions={mediaFloatingOptions}
      {...popoverProps}
    >
      <Media.Root className={cn('py-2.5', className)} {...props}>
        <figure className="group relative m-0" contentEditable={false}>
          <Media.Resizable
            className={cn(
              align === 'center' && 'mx-auto',
              align === 'right' && 'ml-auto'
            )}
            renderHandleLeft={(htmlProps) => (
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
            )}
            renderHandleRight={(htmlProps) => (
              <Box
                {...htmlProps}
                className={cn(
                  'absolute top-0 z-10 flex h-full w-6 select-none flex-col justify-center',
                  'after:flex after:h-16 after:bg-gray-400  after:opacity-0 after:group-hover:opacity-100',
                  "after:w-[3px] after:rounded-[6px] after:content-['_']",
                  'hover:after:bg-blue-500 focus:after:bg-blue-500 active:after:bg-blue-500',
                  focused && selected && 'opacity-100',
                  // variant right
                  '-right-3 -mr-3 items-end pr-3'
                )}
              />
            )}
            align={align}
            readOnly={!ignoreReadOnly && readOnly}
            {...resizableProps}
          >
            <Image
              {...nodeProps}
              className={cn(
                'block w-full max-w-full cursor-pointer object-cover px-0',
                'rounded-[3px]',
                focused && selected && 'shadow-[0_0_1px_rgb(59,130,249)]',
                nodeProps?.className
              )}
            />
          </Media.Resizable>

          {!caption.disabled && (
            <Caption.Root
              className={cn(
                align === 'center' && 'mx-auto',
                align === 'right' && 'ml-auto'
              )}
            >
              <Caption.Textarea
                className={cn(
                  'mt-2 w-full resize-none border-none bg-inherit p-0 font-[inherit] text-inherit',
                  'focus:outline-none focus:[&::placeholder]:opacity-0',
                  caption?.align === 'center' && 'text-center',
                  caption?.align === 'right' && 'text-right'
                )}
                placeholder={caption.placeholder ?? 'Write a caption...'}
                readOnly={(!ignoreReadOnly && readOnly) || !!caption.readOnly}
              />
            </Caption.Root>
          )}
        </figure>

        {children}
      </Media.Root>
    </ElementPopover>
  );
}
