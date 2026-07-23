import type { BaseEditor } from '../../../editor';
import { htmlElementToElementWithParserRuntime } from '../../../../internal/plugin/html-parser-runtime';
import { withPreparedParserRuntime } from '../../../../internal/plugin/prepareParserRegistry';

/** Deserialize one HTML element through the installed element parsers. */
export const htmlElementToElement = (
  editor: BaseEditor,
  element: HTMLElement,
  isPlite = false
) =>
  withPreparedParserRuntime(editor, (runtime) =>
    htmlElementToElementWithParserRuntime(runtime, element, isPlite)
  );
