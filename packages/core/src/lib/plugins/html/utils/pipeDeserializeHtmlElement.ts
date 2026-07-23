import type { BaseEditor } from '../../../editor';
import { pipeDeserializeHtmlElementWithParserRuntime } from '../../../../internal/plugin/html-parser-runtime';
import { withPreparedParserRuntime } from '../../../../internal/plugin/prepareParserRegistry';

export const pipeDeserializeHtmlElement = (
  editor: BaseEditor,
  element: HTMLElement
) =>
  withPreparedParserRuntime(editor, (runtime) =>
    pipeDeserializeHtmlElementWithParserRuntime(runtime, element)
  );
