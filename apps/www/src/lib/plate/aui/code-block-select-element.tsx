import React from 'react';
import {
  CODE_BLOCK_LANGUAGES,
  CODE_BLOCK_LANGUAGES_POPULAR,
  CodeBlockPlugin,
  ELEMENT_CODE_BLOCK,
} from '@udecode/plate-code-block';
import { getPluginOptions, useEditorRef } from '@udecode/plate-common';
import { useReadOnly } from 'slate-react';

import { CodeBlockSelectElementRoot } from '@/lib/@/CodeBlockSelectElement';

export function CodeBlockSelectElement() {
  const editor = useEditorRef();

  if (useReadOnly()) return null;

  const { syntaxPopularFirst } = getPluginOptions<CodeBlockPlugin>(
    editor,
    ELEMENT_CODE_BLOCK
  );

  return (
    <CodeBlockSelectElementRoot>
      <option value="">Plain text</option>

      {syntaxPopularFirst &&
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
    </CodeBlockSelectElementRoot>
  );
}
