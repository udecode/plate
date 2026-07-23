import type { BaseEditor } from '../../../editor';
import { pipeDeserializeHtmlLeafWithParserRuntime } from '../../../../internal/plugin/html-parser-runtime';
import { withPreparedParserRuntime } from '../../../../internal/plugin/prepareParserRegistry';

export const pipeDeserializeHtmlLeaf = (
  editor: BaseEditor,
  element: HTMLElement
) =>
  withPreparedParserRuntime(editor, (runtime) =>
    pipeDeserializeHtmlLeafWithParserRuntime(runtime, element)
  );
