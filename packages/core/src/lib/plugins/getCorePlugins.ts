import type { AnyPlatePlugin } from '../plugin/types/PlatePlugin';

import { DOMPlugin } from './DOMPlugin';
import { DeserializeAstPlugin } from './DeserializeAstPlugin';
import { HistoryPlugin } from './HistoryPlugin';
import { InlineVoidPlugin } from './InlineVoidPlugin';
import { InsertDataPlugin } from './InsertDataPlugin';
import { NodeFactoryPlugin } from './NodeFactoryPlugin';
import { PrevSelectionPlugin } from './PrevSelectionPlugin';
import { DebugPlugin } from './debug/DebugPlugin';
import { EditorProtocolPlugin } from './editor-protocol/EditorProtocolPlugin';
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
    (domPlugin ?? DOMPlugin) as typeof DOMPlugin,
    HistoryPlugin,
    DebugPlugin,
    NodeFactoryPlugin,
    EventEditorPlugin,
    InlineVoidPlugin,
    InsertDataPlugin,
    PrevSelectionPlugin,
    maxLength
      ? LengthPlugin.configure({
          maxLength,
        })
      : LengthPlugin,
    DeserializeHtmlPlugin,
    DeserializeAstPlugin,
    EditorProtocolPlugin,
  ];

  return plugins;
};
