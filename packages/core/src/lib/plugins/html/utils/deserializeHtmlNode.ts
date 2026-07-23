import type { DeserializeHtmlNodeReturnType } from '../types';
import type { BaseEditor } from '../../../editor';
import { deserializeHtmlNodeWithParserRuntime } from '../../../../internal/plugin/html-parser-runtime';
import { withPreparedParserRuntime } from '../../../../internal/plugin/prepareParserRegistry';

/** Deserialize an HTML element or child node. */
export const deserializeHtmlNode =
  (editor: BaseEditor) =>
  (node: ChildNode | HTMLElement): DeserializeHtmlNodeReturnType =>
    withPreparedParserRuntime(editor, (runtime) =>
      deserializeHtmlNodeWithParserRuntime(runtime)(node)
    );
