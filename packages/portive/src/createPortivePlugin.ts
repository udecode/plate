import { ELEMENT_IMAGE, TImageElement } from '@udecode/plate';
import {
  createPluginFactory,
  PlateEditor,
  TElement,
  Value,
  WithPartial,
} from '@udecode/plate-core';
import {
  createAttachmentBlock,
  CreateImageFileElementEvent,
  ImageFileInterface,
  PortiveEditor,
  withPortive,
  WithPortiveOptions,
} from 'slate-portive';

export type TPortiveImageElement = WithPartial<TImageElement, 'url'> &
  Partial<ImageFileInterface> &
  TElement;

export const createPortiveImage = (
  e: CreateImageFileElementEvent
): TPortiveImageElement => ({
  type: ELEMENT_IMAGE,
  originKey: e.originKey,
  originSize: e.originSize,
  size: e.initialSize,
  children: [{ text: '' }],
});

export type PortivePlugin = {};

export const KEY_PORTIVE = 'portive';

/**
 * @see {@link withPortive}
 */
export const createPortivePlugin = (
  portiveOptions: Partial<WithPortiveOptions>
) =>
  createPluginFactory<PortivePlugin, Value, PlateEditor & PortiveEditor>({
    key: KEY_PORTIVE,
    withOverrides: (editor) =>
      withPortive(editor as any, {
        createImageFileElement: createPortiveImage as any,
        createFileElement: createAttachmentBlock,
        ...portiveOptions,
      }),
    handlers: {
      onPaste: (editor) => editor.portive.handlePaste,
      onDrop: (editor) => editor.portive.handleDrop,
    },
  });
