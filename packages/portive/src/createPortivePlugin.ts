import { ELEMENT_IMAGE, TImageElement, Value } from '@udecode/plate';
import {
  createPluginFactory,
  PlateEditor,
  TElement,
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

export type PortivePlugin = Omit<
  WithPortiveOptions,
  'createFileElement' | 'createImageFileElement'
>;

export const KEY_PORTIVE = 'portive';

/**
 * @see {@link withPortive}
 */
export const createPortivePlugin = createPluginFactory<
  PortivePlugin,
  Value,
  PlateEditor & PortiveEditor
>({
  key: KEY_PORTIVE,
  withOverrides: (editor, { options }) =>
    withPortive(editor as any, {
      createImageFileElement: createPortiveImage as any,
      createFileElement: createAttachmentBlock,
      ...options,
    }),
  handlers: {
    onPaste: (editor) => editor.portive.handlePaste,
    onDrop: (editor) => editor.portive.handleDrop,
  },
});
