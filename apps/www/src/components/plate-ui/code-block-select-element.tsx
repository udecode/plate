'use client';

import React from 'react';
import {
  CODE_BLOCK_LANGUAGES,
  CODE_BLOCK_LANGUAGES_POPULAR,
  useCodeBlockSelectElement,
  useCodeBlockSelectElementState,
} from '@udecode/plate-code-block';

export function CodeBlockSelectElement() {
  const state = useCodeBlockSelectElementState();
  const { selectProps } = useCodeBlockSelectElement();

  if (state.readOnly) return null;

  return (
    <select {...selectProps}>
      <option value="">Plain text</option>

      {state.syntaxPopularFirst &&
        Object.entries(CODE_BLOCK_LANGUAGES_POPULAR).map(([key, val]) => (
          <option key={key} value={key}>
            {val}
          </option>
        ))}

      {Object.entries(CODE_BLOCK_LANGUAGES).map(([key, val]) => (
        <option key={key} value={key}>
          {val}
        </option>
      ))}
    </select>
  );
}
