import { getDataNodePropsWithParserRuntime } from '../../../../internal/plugin/html-parser-runtime';
import {
  prepareParserPlugin,
  withPreparedParserRuntime,
} from '../../../../internal/plugin/prepareParserRegistry';
import type { AnyBasePlugin } from '../../../plugin/BasePlugin';
import type { BaseEditor } from '../../../editor';

export const getDataNodeProps = ({
  editor,
  element,
  plugin,
}: {
  editor: BaseEditor;
  element: HTMLElement;
  plugin: AnyBasePlugin;
}) =>
  withPreparedParserRuntime(editor, (runtime) => {
    const prepared = prepareParserPlugin(editor, plugin, runtime.registry);

    return getDataNodePropsWithParserRuntime({
      element,
      plugin: prepared,
      runtime,
    });
  });
