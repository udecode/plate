import * as React from 'react';

import type { TSuggestionText } from 'platejs';
import type { SlateLeafProps } from 'platejs/static';

import { SlateLeaf } from 'platejs/static';

/**
 * DOCX export suggestion leaf: renders as <span> instead of <ins>/<del>.
 *
 * The default SuggestionLeafStatic uses <ins>/<del> HTML tags which
 * html-to-docx interprets as underline/strikethrough formatting.
 * For DOCX export, the tracked changes are handled by the injected
 * DOCX tracking tokens, so we only need a plain wrapper.
 */
export function SuggestionLeafDocx(props: SlateLeafProps<TSuggestionText>) {
  return (
    <SlateLeaf {...props} as="span">
      {props.children}
    </SlateLeaf>
  );
}
