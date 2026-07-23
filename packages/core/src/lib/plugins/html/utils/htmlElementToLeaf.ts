import type { BaseEditor } from '../../../editor';
import { htmlElementToLeafWithParserRuntime } from '../../../../internal/plugin/html-parser-runtime';
import { withPreparedParserRuntime } from '../../../../internal/plugin/prepareParserRegistry';

/** Deserialize HTML through the installed text-mark parsers. */
export const htmlElementToLeaf = (editor: BaseEditor, element: HTMLElement) =>
  withPreparedParserRuntime(editor, (runtime) =>
    htmlElementToLeafWithParserRuntime(runtime, element)
  );
