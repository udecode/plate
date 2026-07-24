import type { Descendant } from '@platejs/plite';

import { deserializeHtmlWithCompiledCodec } from '../../../../internal/plugin/compilePlateHtmlCodec';
import type { BaseEditor } from '../../../editor';

/** Deserialize HTML element to a valid document fragment. */
export const deserializeHtml = (
  editor: BaseEditor,
  options: { collapseWhiteSpace?: boolean; element: HTMLElement | string }
): Descendant[] | null => {
  const compiled = deserializeHtmlWithCompiledCodec(editor, options);

  if (compiled !== undefined) return compiled;

  throw new Error(
    'Plate HTML codec is unavailable before the editor model is compiled.'
  );
};
