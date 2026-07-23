import type { Descendant } from '@platejs/plite';

import type { BaseEditor } from '../../../editor';
import { deserializeHtmlWithParserRuntime } from '../../../../internal/plugin/html-parser-runtime';
import { withPreparedParserRuntime } from '../../../../internal/plugin/prepareParserRegistry';

/** Deserialize HTML element to a valid document fragment. */
export const deserializeHtml = (
  editor: BaseEditor,
  options: { collapseWhiteSpace?: boolean; element: HTMLElement | string }
): Descendant[] =>
  withPreparedParserRuntime(editor, (runtime) =>
    deserializeHtmlWithParserRuntime(runtime, options)
  );
