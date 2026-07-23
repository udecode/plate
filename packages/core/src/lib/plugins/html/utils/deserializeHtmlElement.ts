import type { BaseEditor } from '../../../editor';
import { deserializeHtmlElementWithParserRuntime } from '../../../../internal/plugin/html-parser-runtime';
import { withPreparedParserRuntime } from '../../../../internal/plugin/prepareParserRegistry';
import type { DeserializeHtmlNodeReturnType } from '../types';

/** Deserialize an HTML element into one document fragment. */
export const deserializeHtmlElement = (
  editor: BaseEditor,
  element: HTMLElement
): DeserializeHtmlNodeReturnType =>
  withPreparedParserRuntime(editor, (runtime) =>
    deserializeHtmlElementWithParserRuntime(runtime, element)
  );
