import { createPluginFactory, PlateEditor, Value } from '@udecode/plate-core';
import { ELEMENT_IMAGE, TImageElement } from '@udecode/plate-media/src/index';
import {
  createAttachmentBlock,
  CreateImageFileElementEvent,
  PortiveEditor,
  withPortive,
  WithPortiveOptions,
} from 'slate-portive';

export type TPortiveImageElement = Partial<TImageElement> & {
  /**
   * Must include originKey and originSize
   */
  originKey: string;
  originSize: [number, number];
  /**
   * Must include `size` (consider switching to `mods.size`)
   */
  size: [number, number];
};

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
