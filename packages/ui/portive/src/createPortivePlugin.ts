import { createPluginFactory, PlateEditor, Value } from '@udecode/plate-core';
import { OverrideByKey, PlatePlugin } from '@udecode/plate-core/src/index';
import {
  createImageBlock,
  withPortive,
  WithPortiveOptions,
} from 'slate-portive';
import { PortiveEditor } from 'slate-portive/.dist/src/types/editor-types';

export type PortivePlugin = {};

export const KEY_PORTIVE = 'portive';

/**
 * @see {@link withPortive}
 */
export const createPortivePlugin = (
  portiveOptions: WithPortiveOptions,
  override?: Partial<
    PlatePlugin<PortivePlugin, Value, PlateEditor & PortiveEditor>
  >,
  overrideByKey: OverrideByKey<Value, PlateEditor & PortiveEditor> = {}
) =>
  createPluginFactory<PortivePlugin, Value, PlateEditor & PortiveEditor>({
    key: KEY_PORTIVE,
    withOverrides: (editor) =>
      withPortive(editor as any, {
        createImageFileElement: createImageBlock,
        // createFileElement: createAttachmentBlock,
        ...portiveOptions,
      }),
    handlers: {
      onPaste: (editor) => editor.portive.handlePaste,
      onDrop: (editor) => editor.portive.handleDrop,
    },
  })(override, overrideByKey);
