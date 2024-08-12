import type { AnyPlatePlugin } from '../plugin/types/PlatePlugin';

import { DOMPlugin } from './DOMPlugin';
import { DeserializeAstPlugin } from './DeserializeAstPlugin';
import { HistoryPlugin } from './HistoryPlugin';
import { InlineVoidPlugin } from './InlineVoidPlugin';
import { InsertDataPlugin } from './InsertDataPlugin';
import { PlateApiPlugin } from './PlateApiPlugin';
import { DebugPlugin } from './debug/DebugPlugin';
import { SlateNextPlugin } from './editor-protocol/SlateNextPlugin';
import { EventEditorPlugin } from './event-editor';
import { DeserializeHtmlPlugin } from './html-deserializer';
import { LengthPlugin } from './length/LengthPlugin';

export type CorePlugin = ReturnType<typeof getCorePlugins>[number];

export type GetCorePluginsOptions = {
  domPlugin?: AnyPlatePlugin;

  /** Specifies the maximum number of characters allowed in the editor. */
  maxLength?: number;
};

export const getCorePlugins = ({
  domPlugin,
  maxLength,
}: GetCorePluginsOptions) => {
  const plugins = [
    DebugPlugin,
    SlateNextPlugin,
    (domPlugin ?? DOMPlugin) as typeof DOMPlugin,
    HistoryPlugin,
    PlateApiPlugin,
    InlineVoidPlugin,
    InsertDataPlugin,
    EventEditorPlugin,
    maxLength
      ? LengthPlugin.configure({
          maxLength,
        })
      : LengthPlugin,
    DeserializeHtmlPlugin,
    DeserializeAstPlugin,
  ];

  return plugins;
};
