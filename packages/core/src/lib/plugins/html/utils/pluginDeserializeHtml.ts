import type { AnyBasePlugin } from '../../../plugin/BasePlugin';
import type { BaseEditor } from '../../../editor';
import { pluginDeserializeHtmlWithParserRuntime } from '../../../../internal/plugin/html-parser-runtime';
import {
  prepareParserPlugin,
  withPreparedParserRuntime,
} from '../../../../internal/plugin/prepareParserRegistry';

/** Get a deserializer by type, node names, class names, and styles. */
export const pluginDeserializeHtml = (
  editor: BaseEditor,
  plugin: AnyBasePlugin,
  options: { element: HTMLElement; deserializeLeaf?: boolean }
) =>
  withPreparedParserRuntime(editor, (runtime) => {
    const prepared = prepareParserPlugin(editor, plugin, runtime.registry);

    return pluginDeserializeHtmlWithParserRuntime(runtime, prepared, options);
  });
