import type { Descendant } from '@platejs/plite';

import type { BaseEditor } from '../../../editor';
import { htmlBodyToFragmentWithParserRuntime } from '../../../../internal/plugin/html-parser-runtime';
import { withPreparedParserRuntime } from '../../../../internal/plugin/prepareParserRegistry';

/** Deserialize an HTML body element into one fragment. */
export const htmlBodyToFragment = (
  editor: BaseEditor,
  element: HTMLElement
): Descendant[] | undefined =>
  withPreparedParserRuntime(editor, (runtime) =>
    htmlBodyToFragmentWithParserRuntime(runtime, element)
  );
